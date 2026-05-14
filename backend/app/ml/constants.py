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

BUYER_CATEGORY_RISK = {
    'electronics': 0.8, 'phones': 0.8,
    'fashion':     0.4, 'clothing': 0.4,
    'services':    0.6, 'gig': 0.6,
    'logistics':   0.5, 'food': 0.3,
    'unknown':     0.5,
}

VENDOR_CATEGORY_RISK = {
    'electronics': 0.8, 'phones': 0.8,
    'fashion':     0.4, 'clothing': 0.4,
    'services':    0.7, 'gig': 0.7,
    'logistics':   0.8, 'food': 0.2,
    'unknown':     0.5,
}