from app.schema import EvaluateRequest

def run_validation_gate(payload: EvaluateRequest) -> list[str]:
    missing = []

    if not payload.buyer.total_past_transactions:
        missing.append("buyer_total_past_transactions")
    if not payload.buyer.avg_transaction_amount:
        missing.append("buyer_avg_transaction_amount")
    if not payload.buyer.past_dispute_count:
        missing.append("buyer_dispute_count")
    if not payload.vendor.total_completed_transactions:
        missing.append("vendor_total_completed_transactions")
    if not payload.vendor.listing_price:
        missing.append("vendor_listing_price")
    if not payload.vendor.avg_category_price:
        missing.append("vendor_avg_category_price")
    if not payload.session:
        missing.append("session_block")
    elif not payload.session.device_fingerprint:
        missing.append("device_fingerprint")

    return missing
