import concurrent.futures

from app.models import Settings
from app.utils import Models


def run_models(
    buyer_features:  dict,
    vendor_features: dict
) -> tuple[float, float]:
    """Run buyer and vendor models in parallel and return their positive-class probabilities.

    Args:
        buyer_features: Feature vector for buyer model.
        vendor_features: Feature vector for vendor model.

    Returns:
        Tuple of (buyer_score, vendor_score) as floats in range [0,1].
    """
    import numpy as np

    buyer_model  = Models.buyer_model
    vendor_model = Models.vendor_model

    
    buyer_array  = np.array(list(buyer_features.values())).reshape(1, -1)
    vendor_array = np.array(list(vendor_features.values())).reshape(1, -1)


    with concurrent.futures.ThreadPoolExecutor() as executor:
        buyer_future  = executor.submit(
            buyer_model.predict_proba, buyer_array
        )
        vendor_future = executor.submit(
            vendor_model.predict_proba, vendor_array
        )
        buyer_score  = buyer_future.result()[0][1]
        vendor_score = vendor_future.result()[0][1]

    return float(buyer_score), float(vendor_score)



def aggregate_scores(
    buyer_score:  float,
    vendor_score: float,
    rule_floor:   float | None,
    platform_settings: Settings
) -> tuple[float, str]:

    """Combine buyer and vendor scores into a final score and primary signal.

    Uses platform settings for weighting and applies any rule floor.
    Returns (final_score, primary_signal).
    """

    buyer_weight  = platform_settings.buyer_weight  or 0.40
    vendor_weight = platform_settings.vendor_weight or 0.60

    final_score    = (buyer_weight * buyer_score) + (vendor_weight * vendor_score)
    final_score    = max(final_score, rule_floor) if rule_floor else final_score
    final_score    = round(min(final_score, 1.0), 4)
    primary_signal = "vendor" if vendor_score > buyer_score else "buyer"

    return final_score, primary_signal


# ─────────────────────────────────────────────
# STEP 5 — Confidence
# ─────────────────────────────────────────────
def determine_confidence(
    buyer_score:     float,
    vendor_score:    float,
    missing_signals: list[str]
) -> str:
    """Determine a confidence level ('LOW'|'MEDIUM'|'HIGH') for the final score.

    Considers the gap between model scores and any critical missing signals.
    """

    score_gap        = abs(buyer_score - vendor_score)
    critical_missing = {
        "buyer_avg_transaction_amount",
        "vendor_listing_price",
        "session_block"
    }
    has_critical_missing = bool(
        critical_missing.intersection(set(missing_signals))
    )

    if has_critical_missing or score_gap > 0.50:
        return "LOW"
    elif score_gap > 0.20 or len(missing_signals) > 5:
        return "MEDIUM"
    else:
        return "HIGH"   


# ─────────────────────────────────────────────
# STEP 6 — Decision
# ─────────────────────────────────────────────
def determine_decision(
    final_score: float,
    platform_settings: Settings
) -> str:
    """Map the numeric final_score into a decision string based on thresholds.

    Returns one of 'BLOCK', 'REVIEW', or 'ALLOW'.
    """

    block_threshold  = platform_settings.block_threshold  or 0.70
    review_threshold = platform_settings.review_threshold or 0.40

    if final_score >= block_threshold:
        return "BLOCK"
    elif final_score >= review_threshold:
        return "REVIEW"
    else:
        return "ALLOW"

