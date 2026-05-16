from app.rules import (
    fake_electronics_listing,
    new_vendor_high_value_txn,
    whatsapp_funnel_attack,
    advance_fee_pattern
)
from sqlmodel import Session

from app.schema import EvaluateRequest

def run_rule_presets(
    payload: EvaluateRequest,
    db: Session
) -> tuple[float | None, str | None]:
    """Run configured rule presets against the payload and return a floor and matched preset.

    Returns a tuple `(floor, matched_preset)` where `floor` is the numeric minimum
    score enforced by a triggered rule, or `None` when no rule triggered.
    """

    preset_results = {
        "fake_electronics_listing": lambda: fake_electronics_listing(payload),
        "new_vendor_high_value":    lambda: new_vendor_high_value_txn(payload),
        "whatsapp_funnel_attack":   lambda: whatsapp_funnel_attack(payload),
        "advance_fee_pattern":      lambda: advance_fee_pattern(payload, db),
    }

    triggered = {}
    for name, preset_fn in preset_results.items():
        floor = preset_fn()
        if floor is not None:
            triggered[name] = floor

    if not triggered:
        return None, None

    matched_preset = max(triggered, key=triggered.get)
    return triggered[matched_preset], matched_preset

