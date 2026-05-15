from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlmodel import Session, select, desc
from datetime import datetime

from app.api.auth import get_api_key_platform, get_current_user
from app.database import get_session
from app.models import Platform, Transaction, Feedback
from app.pipeline import evaluate
from app.schema import EvaluateRequest, EvaluateResponse, FeedbackRequest, FeedbackResponse, FeedbackListResponse, FeedbackItem
from app.background_tasks import update_transaction_label

router = APIRouter(prefix="/api", tags=["dashboard"])


def _format_transaction(transaction: Transaction) -> dict:
    timestamp = transaction.timestamp or transaction.created_at
    recommended_action_map = {
        "ALLOW": "Proceed with payment",
        "REVIEW": "Trigger step-up authentication or queue for manual review",
        "BLOCK": "Block transaction and warn buyer",
    }
    review_decision = transaction.review_decision
    review_token = review_decision.review_token if review_decision else None
    review_expires_at = review_decision.expires_at if review_decision else None

    return {
        "id": transaction.id,
        "transaction_id": transaction.id,
        "amount": transaction.amount or 0,
        "currency": transaction.currency,
        "timestamp": timestamp,
        "created_at": transaction.created_at,
        "payment_method": transaction.payment_method,
        "decision": transaction.decision or "REVIEW",
        "score": transaction.final_score or 0.0,
        "confidence": transaction.confidence or "MEDIUM",
        "buyer_risk_score": transaction.buyer_score or 0.0,
        "vendor_risk_score": transaction.vendor_score or 0.0,
        "primary_signal": transaction.primary_signal,
        "escalated_to_llm": bool(transaction.escalated_to_llm),
        "rule_preset_matched": transaction.rule_preset_matched,
        "reasons": transaction.reasons or [],
        "recommended_action": recommended_action_map.get(transaction.decision or "REVIEW", "Trigger step-up authentication or queue for manual review"),
        "buyer": {
            "id": transaction.buyer_id,
            "account_age_days": transaction.buyer_account_age_days,
            "total_past_transactions": transaction.buyer_total_past_txns,
            "avg_transaction_amount": transaction.buyer_avg_amount,
            "past_dispute_count": transaction.buyer_dispute_count,
        },
        "vendor": {
            "id": transaction.vendor_id,
            "account_age_days": transaction.vendor_account_age_days,
            "total_completed_transactions": transaction.vendor_completed_txns,
            "category": transaction.vendor_category,
            "listing_price": transaction.listing_price,
            "avg_category_price": transaction.avg_category_price,
        },
        "session": {
            "arrival_source": transaction.arrival_source,
            "time_on_page_seconds": transaction.time_on_page_seconds,
        },
        "shap_signals": [],
        "squad_status": transaction.squad_status,
        "review_token": review_token,
        "review_expires_at": review_expires_at,
    }


def _build_stats(transactions: list[Transaction]) -> dict:
    blocked = sum(1 for transaction in transactions if transaction.decision == "BLOCK")
    reviewed = sum(1 for transaction in transactions if transaction.decision == "REVIEW")
    allowed = sum(1 for transaction in transactions if transaction.decision == "ALLOW")
    total_value_protected = sum(
        transaction.amount or 0
        for transaction in transactions
        if transaction.decision != "ALLOW"
    )

    return {
        "total": len(transactions),
        "blocked": blocked,
        "reviewed": reviewed,
        "allowed": allowed,
        "total_value_protected_ngn": total_value_protected,
    }


@router.post("/v1/evaluate", response_model=EvaluateResponse)
async def evaluate_transaction(
    payload: EvaluateRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_session),
    platform: Platform = Depends(get_api_key_platform),
):
    """Evaluate transaction - requires API key authentication."""
    return await evaluate(payload, db, request, background_tasks, platform)


@router.post("/v1/feedback", response_model=FeedbackResponse)
def submit_feedback(
    payload: FeedbackRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_session),
    platform: Platform = Depends(get_current_user),
):
    """
    Submit feedback for a transaction.
    
    This endpoint:
    1. Stores the feedback request in the database
    2. Launches a background task to update the transaction features with the corrected is_fraud label
    
    Args:
        payload: FeedbackRequest containing transaction_id, is_fraud, reported_by, reported_at
        background_tasks: FastAPI background tasks manager
        db: Database session
        platform: Current authenticated platform
    
    Returns:
        FeedbackResponse with status and message
    """
    # Verify transaction exists and belongs to this platform
    transaction = db.exec(
        select(Transaction).where(
            Transaction.platform_id == platform.id,
            Transaction.id == payload.transaction_id,
        )
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=404,
            detail=f"Transaction {payload.transaction_id} not found"
        )
    
    # Create feedback record
    feedback = Feedback(
        platform_id=platform.id,
        transaction_id=payload.transaction_id,
        outcome="fraudulent" if payload.is_fraud else "legitimate",
        reported_by=payload.reported_by,
        reported_at=payload.reported_at,
    )
    
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    
    # Launch background task to update transaction features label
    background_tasks.add_task(
        update_transaction_label,
        transaction_id=payload.transaction_id,
        is_fraud=payload.is_fraud,
    )
    
    return FeedbackResponse(
        status="success",
        transaction_id=payload.transaction_id,
        message=f"Feedback received and recorded as {feedback.outcome}. Training data will be updated in the background.",
    )


@router.get("/v1/feedback", response_model=FeedbackListResponse)
def get_all_feedback(
    db: Session = Depends(get_session),
    platform: Platform = Depends(get_current_user),
):
    """
    Get all feedback submitted by the platform.
    
    Returns a list of all feedback entries for the authenticated platform,
    sorted by most recent first.
    
    Args:
        db: Database session
        platform: Current authenticated platform
    
    Returns:
        FeedbackListResponse containing total count and list of feedback items
    """
    feedbacks = db.exec(
        select(Feedback).where(
            Feedback.platform_id == platform.id
        ).order_by(desc(Feedback.reported_at))
    ).all()
    
    feedback_items = [
        FeedbackItem(
            id=feedback.id,
            transaction_id=feedback.transaction_id,
            is_fraud=feedback.outcome == "fraudulent" if feedback.outcome else False,
            reported_by=feedback.reported_by,
            reported_at=feedback.reported_at,
            created_at=feedback.reported_at,  # Using reported_at as created_at if not available
        )
        for feedback in feedbacks
    ]
    
    return FeedbackListResponse(
        total=len(feedback_items),
        feedbacks=feedback_items,
    )


@router.get("/v1/transactions")
def transactions(decision: str | None = None, db: Session = Depends(get_session), platform: Platform = Depends(get_current_user)):
    """Get transactions - requires JWT authentication."""
    statement = select(Transaction).where(Transaction.platform_id == platform.id)
    if decision:
        normalized_decision = decision.upper()
        statement = statement.where(Transaction.decision == normalized_decision)

    platform_transactions = sorted(
        db.exec(statement).all(),
        key=lambda transaction: transaction.created_at or transaction.timestamp,
        reverse=True,
    )

    return {
        "stats": _build_stats(platform_transactions),
        "transactions": [_format_transaction(transaction) for transaction in platform_transactions],
    }


@router.get("/v1/transactions/{transaction_id}")
def get_transaction(transaction_id: str, db: Session = Depends(get_session), platform: Platform = Depends(get_current_user)):
    transaction = db.exec(
        select(Transaction).where(
            Transaction.platform_id == platform.id,
            Transaction.id == transaction_id,
        )
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return _format_transaction(transaction)


@router.post("/v1/evaluation/demo", response_model=EvaluateResponse)
async def evaluation_demo(
    payload: EvaluateRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_session),
    platform: Platform = Depends(get_api_key_platform),
):
    """Demo evaluation endpoint using API key authentication."""
    return await evaluate(payload, db, request, background_tasks, platform)
