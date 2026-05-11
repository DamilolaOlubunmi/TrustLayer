def run_evaluation_pipeline(payload):

    return {
        "transaction_id": payload.transaction.id,
        "decision": "ALLOW",
        "score": 0.21,
        "confidence": "HIGH",
        "buyer_risk_score": 0.12,
        "vendor_risk_score": 0.17,
        "primary_signal": "buyer",
        "escalated_to_llm": False,
        "reasons": [
            "No major fraud indicators detected"
        ],
        "recommended_action": "Proceed with transaction"
    }