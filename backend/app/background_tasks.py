from datetime import datetime, timezone

from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError

from app.models import Platform, VendorProfile, BuyerProfile, TransactionFeatures
from app.schema import EvaluateRequest
from app.database import engine
from app.services.notification_service import send_review_notification as _send_review_notification

def save_features_to_store(
    transaction_id:  str,
    buyer_features:  dict,
    vendor_features: dict,
    is_fraud: bool | None = None
) -> None:
    with Session(engine) as db:
        merged_features = {**buyer_features, **vendor_features}

        if is_fraud is not None:
            record = TransactionFeatures(
                transaction_id=transaction_id,
                is_fraud=int(is_fraud),
                **merged_features
            )
        else:
            record = TransactionFeatures(
                transaction_id=transaction_id,
                **merged_features
            )

        db.add(record)
        db.commit()


def update_profiles(
    payload: EvaluateRequest,
    final_score: float,
    platform: Platform,
) -> None:
    
    with Session(engine) as db:
    # ── Vendor profile ────────────────────────
        with db.no_autoflush:
            vendor_profile = db.exec(
                select(VendorProfile).where(
                    VendorProfile.vendor_id == payload.vendor.id
                )
            ).first()

        if vendor_profile:
            vendor_profile.total_transactions_seen += 1
            vendor_profile.avg_risk_score = round(
                (vendor_profile.avg_risk_score + final_score) / 2, 4
            )
            vendor_profile.last_seen = datetime.now(timezone.utc)
            
        else:
            try:
                vendor_profile = VendorProfile(
                    vendor_id=payload.vendor.id,
                    platform_id=platform.id,
                    total_transactions_seen=1,
                    total_completed_transactions=0,
                    total_fraud_flags=0,
                    avg_risk_score=final_score,
                    last_seen=datetime.now(timezone.utc),
                )

            except IntegrityError:
                db.rollback()

                with db.no_autoflush:
                    vendor_profile = db.exec(
                        select(VendorProfile).where(
                            VendorProfile.vendor_id == payload.vendor.id
                        )
                    ).first()

        db.add(vendor_profile)

        # ── Buyer profile ─────────────────────────
        with db.no_autoflush:
            buyer_profile = db.exec(
                select(BuyerProfile).where(
                    BuyerProfile.buyer_id == payload.buyer.id
                )
            ).first()

        if buyer_profile:
            buyer_profile.total_transactions_seen += 1
            buyer_profile.last_seen = datetime.now(timezone.utc)
            buyer_profile.avg_risk_score = round(
                (buyer_profile.avg_risk_score + final_score) / 2, 4
            )
            buyer_profile.avg_amount = round(
                (buyer_profile.avg_amount + payload.transaction.amount) / 2, 2
            )
            if payload.buyer.past_dispute_count is not None:
                buyer_profile.total_disputes += payload.buyer.past_dispute_count
        else:
            try:
                buyer_profile = BuyerProfile(
                    buyer_id=payload.buyer.id,
                    platform_id=platform.id,
                    total_transactions_seen=1,
                    avg_risk_score=final_score,
                    avg_amount=payload.transaction.amount,
                    total_disputes=payload.buyer.past_dispute_count or 0,
                    last_seen=datetime.now(timezone.utc)
                )
            except IntegrityError:
                db.rollback()

                with db.no_autoflush:
                    buyer_profile = db.exec(
                        select(BuyerProfile).where(
                            BuyerProfile.buyer_id == payload.buyer.id
                        )
                    ).first()
          
        db.add(buyer_profile)
        db.commit()


async def send_review_notification(
    transaction_id: str,
    payload: EvaluateRequest,
    final_score: float,
    reasons: list[str],
    platform: Platform,
) -> None:
    await _send_review_notification(
        transaction_id=transaction_id,
        payload=payload,
        final_score=final_score,
        reasons=reasons,
        platform=platform,
    )


def update_transaction_label(
    transaction_id: str,
    is_fraud: bool,
) -> None:
    """Update the is_fraud label for a transaction in the training features store.
    
    Args:
        transaction_id: ID of the transaction
        is_fraud: Whether the transaction is fraudulent (True) or legitimate (False)
    """
    with Session(engine) as db:
        # Find every transaction features record for this transaction id
        features_rows = db.exec(
            select(TransactionFeatures).where(
                TransactionFeatures.transaction_id == transaction_id
            )
        ).all()

        if features_rows:
            for features in features_rows:
                features.is_fraud = int(is_fraud)
                db.add(features)
        else:
            # If no features record exists, create one with just the label
            db.add(
                TransactionFeatures(
                    transaction_id=transaction_id,
                    is_fraud=int(is_fraud),
                )
            )

        db.commit()

