from datetime import datetime


MODEL_A_FEATURES = [
    'amount_deviation_ratio',
    'buyer_account_age_days',
    'buyer_total_past_txns',
    'is_first_transaction',
    'buyer_dispute_count',
    'time_of_day_risk',
    'arrival_source_risk',
    'session_duration_flag',
    'is_mobile',
    'category_risk_score',
]

MODEL_B_FEATURES = [
    'vendor_account_age_days',
    'vendor_completion_rate',
    'listing_price_ratio',
    'vendor_tx_velocity',
    'vendor_fraud_flags',
    'category_risk_score',
    'has_completed_any_txn',
]



def build_buyer_features(payload, buyer_profile):

    transaction = payload["transaction"]
    buyer = payload["buyer"]
    vendor = payload["vendor"]
    session = payload.get("session", {})

   

    amount = transaction["amount"]

    avg_amount = buyer_profile.get(
        "avg_transaction_amount",
        amount
    )

    

    amount_deviation_ratio = (
        amount / max(avg_amount, 1)
    )

   

    buyer_account_age_days = (
        buyer["account_age_days"]
    )

   

    buyer_total_past_txns = (
        buyer_profile.get(
            "total_past_transactions",
            0
        )
    )



    is_first_transaction = (
        1 if buyer_total_past_txns == 0
        else 0
    )



    buyer_dispute_count = (
        buyer_profile.get(
            "past_dispute_count",
            0
        )
    )


    timestamp = transaction["timestamp"]

    # Handles both datetime objects and ISO strings
    if isinstance(timestamp, str):
        timestamp = datetime.fromisoformat(timestamp)

    hour = timestamp.hour

    time_of_day_risk = (
        1 if 0 <= hour <= 5
        else 0
    )

    

    arrival_source = session.get(
        "arrival_source",
        "direct"
    )

    risky_sources = [
        "whatsapp",
        "external_link"
    ]

    arrival_source_risk = (
        1 if arrival_source in risky_sources
        else 0
    )



    time_on_page = session.get(
        "time_on_page_seconds",
        999
    )

    session_duration_flag = (
        1 if time_on_page < 10
        else 0
    )



    device_fp = session.get(
        "device_fingerprint",
        ""
    )

    is_mobile = (
        1 if "mobile" in device_fp.lower()
        else 0
    )



    category = vendor.get(
        "category",
        ""
    )

    high_risk_categories = [
        "electronics",
        "crypto",
        "gift_cards"
    ]

    category_risk_score = (
        1 if category in high_risk_categories
        else 0
    )

    

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




def build_vendor_features(payload, vendor_profile):

    vendor = payload["vendor"]

    

    vendor_account_age_days = (
        vendor["account_age_days"]
    )

    

    completed_txns = vendor_profile.get(
        "total_completed_transactions",
        0
    )

    total_txns = vendor_profile.get(
        "total_transactions",
        max(completed_txns, 1)
    )

    vendor_completion_rate = (
        completed_txns / max(total_txns, 1)
    )

    #

    listing_price = vendor.get(
        "listing_price",
        0
    )

    category_avg_price = vendor_profile.get(
        "category_avg_price",
        max(listing_price, 1)
    )

    listing_price_ratio = (
        listing_price / max(category_avg_price, 1)
    )

    

    vendor_tx_velocity = vendor_profile.get(
        "tx_last_24h",
        0
    )



    vendor_fraud_flags = vendor_profile.get(
        "fraud_flags",
        0
    )



    category = vendor.get(
        "category",
        ""
    )

    risky_categories = [
        "electronics",
        "crypto",
        "gift_cards"
    ]

    category_risk_score = (
        1 if category in risky_categories
        else 0
    )



    has_completed_any_txn = (
        1 if completed_txns > 0
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