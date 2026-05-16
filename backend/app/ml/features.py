from datetime import datetime, timedelta

from fastapi import Request
from sqlmodel import Session, select, func

from app.ml.constants import BUYER_CATEGORY_RISK, VENDOR_CATEGORY_RISK
from app.models import BuyerProfile, VendorProfile, Transaction
from app.schema import EvaluateRequest
from app.utils import fetch_platform_id

def build_buyer_features(payload: EvaluateRequest, request: Request, db: Session) -> dict:
    """Build and return buyer-side feature vector for ML models.

    The function reads historical profile data when available and computes
    derived signals used by the buyer model.
    """

    if not payload.transaction or not payload.buyer:
        raise ValueError("Transaction and Buyer information must be provided to build buyer features.")

    transaction = payload.transaction
    buyer = payload.buyer
    session = payload.session if hasattr(payload, 'session') else {}
    platform_id = fetch_platform_id(request, db)

   

    buyer_profile = db.exec(
        select(BuyerProfile)
        .where(
            BuyerProfile.buyer_id == buyer.id,
            BuyerProfile.platform_id == platform_id
        )
    ).first()

    avg_amount = buyer.avg_transaction_amount or (
        buyer_profile.avg_amount if buyer_profile else 0
    )

    

    amount_deviation_ratio = transaction.amount / avg_amount if avg_amount else 1.0

   

    buyer_account_age_days = buyer.account_age_days

   

    buyer_total_past_txns = buyer.total_past_transactions if buyer.total_past_transactions else (
        buyer_profile.total_transactions_seen if buyer_profile else 0
    )



    is_first_transaction = 1 if buyer.total_past_transactions == 0 else (
        1 if buyer_profile and buyer_profile.total_transactions_seen == 0 else 0
    )
    



    buyer_dispute_count = buyer.past_dispute_count if buyer.past_dispute_count else (
        buyer_profile.total_disputes if buyer_profile else 0
    )


    timestamp = transaction.timestamp
    # Handles both datetime objects and ISO strings
    if isinstance(timestamp, str):
        timestamp = datetime.fromisoformat(timestamp)

    time_of_day_risk = (
        1 if timestamp.hour in range(0, 5)
        else 0
    )

    

    arrival_source_risk = 1 if session and session.arrival_source in ["whatsapp_link", "external_link"] else 0


    session_duration_flag = 1 if session and session.time_on_page_seconds < 15 else 0



    device_fp = session.device_fingerprint if session and session.device_fingerprint else ""

    is_mobile = 1 if session and session.device_type in ["mobile"] else 0


    category_risk_score = BUYER_CATEGORY_RISK.get(payload.vendor.category, BUYER_CATEGORY_RISK["unknown"]) if payload.vendor else BUYER_CATEGORY_RISK["unknown"]

    

    features = {
        "amount_deviation_ratio":
            amount_deviation_ratio,

        "buyer_account_age_days":
            buyer_account_age_days,

        "buyer_total_past_txns":
            buyer_total_past_txns,

        "is_first_transaction":
            is_first_transaction,

        "buyer_dispute_count":
            buyer_dispute_count,

        "time_of_day_risk":
            time_of_day_risk,

        "arrival_source_risk":
            arrival_source_risk,

        "session_duration_flag":
            session_duration_flag,

        "is_mobile":
            is_mobile,

        "category_risk_score":
            category_risk_score,
    }

    return features




def build_vendor_features(payload: EvaluateRequest, request: Request, db: Session) -> dict:
    """Build and return vendor-side feature vector for ML models.

    Uses vendor profile data and recent transaction statistics to compute
    signals consumed by the vendor model.
    """

    if not payload.transaction or not payload.buyer:
        raise ValueError("Transaction and Buyer information must be provided to build buyer features.")

    transaction = payload.transaction
    vendor = payload.vendor
    session = payload.session if hasattr(payload, 'session') else {}
    platform_id = fetch_platform_id(request, db)

    vendor_profile = db.exec(
        select(VendorProfile)
        .where(
            VendorProfile.vendor_id == vendor.id,
            VendorProfile.platform_id == platform_id
        )
    ).first()
    

    vendor_account_age_days = vendor.account_age_days

    

    completed_txns = vendor.total_completed_transactions if vendor.total_completed_transactions else (
        vendor_profile.total_completed_transactions if vendor_profile else 0
    )

    total_txns = vendor_profile.total_transactions_seen if vendor_profile else 0

    vendor_completion_rate = completed_txns / total_txns if total_txns > 0 else 0.0

    #

    listing_price = vendor.listing_price if vendor.listing_price else 0

    category_avg_price = vendor.avg_category_price if vendor.avg_category_price else "unknown"

    listing_price_ratio = (
        vendor.listing_price / vendor.avg_category_price
        if vendor.avg_category_price else 1.0
    )

    

    cutoff = datetime.now() - timedelta(hours=48)

    vendor_tx_velocity = db.exec(
        select(func.count(Transaction.id))
        .where(
            Transaction.vendor_id == payload.vendor.id,
            Transaction.created_at >= cutoff
        )
    ).one()

    vendor_fraud_flags = vendor_profile.total_fraud_flags if vendor_profile else 0



    
    category_risk_score = VENDOR_CATEGORY_RISK.get(payload.vendor.category, VENDOR_CATEGORY_RISK["unknown"]) if payload.vendor else VENDOR_CATEGORY_RISK["unknown"]




    has_completed_any_txn = (
        1 if vendor_profile and vendor_profile.total_completed_transactions > 0
        else 0
    )

    

    features = {
        "vendor_account_age_days":
            vendor_account_age_days,

        "vendor_completion_rate":
            vendor_completion_rate,

        "listing_price_ratio":
            listing_price_ratio,

        "vendor_tx_velocity":
            vendor_tx_velocity,

        "vendor_fraud_flags":
            vendor_fraud_flags,

        "category_risk_score":
            category_risk_score,

        "has_completed_any_txn":
            has_completed_any_txn,
    }

    return features