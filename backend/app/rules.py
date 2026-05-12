from sqlmodel import Session, select

from app.schema import EvaluateRequest
from datetime import datetime, timedelta
from app.models import Transaction

def fake_electroncis_listing(payload: EvaluateRequest) -> float | None:
    if payload.vendor:
        vendor = payload.vendor
        if (
            vendor.account_age_days < 7 and 
            vendor.listing_price < (vendor.avg_category_price * 0.5) and 
            vendor.category == "electronics"
            ):
            return 0.78
    
    return None

def new_vendor_high_value_txn(payload: EvaluateRequest) -> float | None:
    if payload.vendor and payload.transaction:
        vendor = payload.vendor
        transaction = payload.transaction
        if (
            vendor.account_age_days < 14 and 
            vendor.total_completed_transactions == 0 and
            transaction.amount > 100000
            ):
            return 0.70
    
    return None

def advance_fee_pattern(payload: EvaluateRequest, db: Session) -> float | None:
    if payload.buyer and payload.vendor:
        buyer_id = payload.buyer.id
        vendor_id = payload.vendor.id

        cutoff = (datetime.now() - timedelta(days=7)).isoformat()

        rows = db.exec(
            select(Transaction)
            .where(
                Transaction.buyer_id == buyer_id,
                Transaction.vendor_id == vendor_id,
                Transaction.created_at >= cutoff
            )
            .order_by(Transaction.created_at.asc())
        ).all()

        if len(rows) > 2:
            amounts = [row.amount for row in rows]
            is_increasing = all(amounts[i] < amounts[i + 1] for i in range(len(amounts) - 1))
            if is_increasing:
                return 0.80

    return None

def whatsapp_funnel_attack(payload: EvaluateRequest) -> float | None:
    if payload.vendor and payload.session:
        vendor = payload.vendor
        session = payload.session
        if (
            session.arrival_source == "whatsapp_link" and
            vendor.account_age_days < 30 and
            session.time_on_page_seconds < 15
        ):
            return 0.65
    
    return None