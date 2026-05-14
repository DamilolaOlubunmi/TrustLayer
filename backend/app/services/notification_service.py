from __future__ import annotations

import asyncio
import hmac
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from collections.abc import Awaitable

from sqlalchemy import desc
from sqlmodel import Session, select

from app.database import engine
from app.integrations.squad_sms import send_sms
from app.models import Platform, ReviewDecision, Transaction, TransactionWhitelist
from app.schema import EvaluateRequest
from app.services.email_service import send_review_email

logger = logging.getLogger(__name__)

REVIEW_TTL_HOURS = 12
WHITELIST_TTL_HOURS = 12
REVIEW_BASE_URL = os.getenv("REVIEW_BASE_URL") or os.getenv("APP_BASE_URL") or "http://localhost:8000"


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def generate_review_token() -> str:
    return str(uuid.uuid4())


def build_review_link(review_token: str) -> str:
    return f"{REVIEW_BASE_URL.rstrip('/')}/review/{review_token}"


def _tokens_match(expected: str | None, provided: str) -> bool:
    if not expected:
        return False
    return hmac.compare_digest(expected, provided)


def get_review_decision_by_token(session: Session, review_token: str) -> ReviewDecision | None:
    record = session.exec(
        select(ReviewDecision).where(ReviewDecision.review_token == review_token)
    ).first()

    if record and _tokens_match(record.review_token, review_token):
        return record
    return None


def get_active_whitelist_entry(
    session: Session,
    *,
    platform_id: str,
    buyer_id: str | None,
    vendor_id: str | None,
    payment_method: str | None,
    amount: int | float | None,
    current_time: datetime | None = None,
) -> TransactionWhitelist | None:
    if not all([platform_id, buyer_id, vendor_id, payment_method]):
        return None

    if amount is None:
        return None

    now = current_time or utcnow()
    amount_value = float(amount)

    statement = (
        select(TransactionWhitelist)
        .where(
            TransactionWhitelist.platform_id == platform_id,
            TransactionWhitelist.buyer_id == buyer_id,
            TransactionWhitelist.vendor_id == vendor_id,
            TransactionWhitelist.payment_method == payment_method,
            TransactionWhitelist.expires_at > now,
            TransactionWhitelist.max_amount >= amount_value,
        )
        .order_by(desc(TransactionWhitelist.created_at))
        .limit(1)
    )
    return session.exec(statement).first()


def create_temporary_whitelist_entry(
    session: Session,
    *,
    transaction: Transaction,
    platform_id: str,
    current_time: datetime | None = None,
) -> TransactionWhitelist:
    if not transaction.buyer_id or not transaction.vendor_id or not transaction.payment_method:
        raise ValueError("Transaction is missing fields required for whitelist creation")

    now = current_time or utcnow()
    expires_at = now + timedelta(hours=WHITELIST_TTL_HOURS)
    max_amount = float(round((transaction.amount or 0) * 1.1, 2))

    whitelist_entry = TransactionWhitelist(
        buyer_id=transaction.buyer_id,
        vendor_id=transaction.vendor_id,
        platform_id=platform_id,
        payment_method=transaction.payment_method,
        max_amount=max_amount,
        expires_at=expires_at,
        created_at=now,
    )
    session.add(whitelist_entry)
    return whitelist_entry


def apply_review_action(
    session: Session,
    *,
    review_token: str,
    action: str,
) -> tuple[ReviewDecision, TransactionWhitelist | None]:
    now = utcnow()
    review_decision = get_review_decision_by_token(session, review_token)
    if not review_decision:
        raise ValueError("Review token not found")

    if review_decision.expires_at <= now:
        raise ValueError("Review token has expired")

    if review_decision.reviewed_at or review_decision.decision in {"ALLOW", "BLOCK"}:
        raise ValueError("Review token has already been used")

    normalized_action = action.upper().strip()
    if normalized_action not in {"ALLOW", "BLOCK"}:
        raise ValueError("Unsupported review action")

    transaction = session.get(Transaction, review_decision.transaction_id)
    if not transaction:
        raise ValueError("Transaction not found")

    review_decision.decision = normalized_action
    review_decision.reviewed_at = now
    session.add(review_decision)

    whitelist_entry: TransactionWhitelist | None = None
    
    if normalized_action == "ALLOW":
        whitelist_entry = create_temporary_whitelist_entry(
            session,
            transaction=transaction,
            platform_id=review_decision.platform_id,
            current_time=now,
        )

    session.commit()
    session.refresh(review_decision)
    if whitelist_entry is not None:
        session.refresh(whitelist_entry)

    return review_decision, whitelist_entry


async def send_review_notification(
    transaction_id: str,
    payload: EvaluateRequest,
    final_score: float,
    reasons: list[str],
    platform: Platform,
) -> None:
    review_token = generate_review_token()
    notified_at = utcnow()
    expires_at = notified_at + timedelta(hours=REVIEW_TTL_HOURS)
    review_link = build_review_link(review_token)

    try:
        with Session(engine) as session:
            review_decision = ReviewDecision(
                transaction_id=transaction_id,
                platform_id=platform.id,
                decision="REVIEW",
                review_token=review_token,
                expires_at=expires_at,
                notified_at=notified_at,
                created_at=notified_at,
            )
            session.add(review_decision)
            session.commit()
            session.refresh(review_decision)
    except Exception:
        logger.exception("Failed to persist review notification for transaction %s", transaction_id)
        return

    notification_tasks: list[tuple[str, Awaitable[object]]] = []

    if platform.email:
        notification_tasks.append(
            (
                "email",
                asyncio.to_thread(
                    send_review_email,
                    transaction_id,
                    final_score,
                    reasons,
                    platform.email,
                    review_link,
                ),
            )
        )

    if platform.phone_number and platform.squad_secret_key:
        sms_message = (
            f"TrustLayer review required for transaction {transaction_id}. "
            f"Risk score: {final_score:.4f}. Review: {review_link}"
        )
        notification_tasks.append(
            (
                "sms",
                send_sms(
                    squad_secret_key=platform.squad_secret_key,
                    phone_number=platform.phone_number,
                    message=sms_message,
                ),
            )
        )

    if notification_tasks:
        labels = [label for label, _ in notification_tasks]
        results = await asyncio.gather(
            *(task for _, task in notification_tasks),
            return_exceptions=True,
        )

        for label, result in zip(labels, results):
            if isinstance(result, Exception):
                logger.error(
                    "Failed to send review %s notification for transaction %s",
                    label,
                    transaction_id,
                    exc_info=result,
                )
