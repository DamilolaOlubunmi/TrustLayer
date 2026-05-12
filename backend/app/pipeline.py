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


def evaluate(payload, db):
    # 1. validate
    # 2. run rules
    # 3. build features
    # 4. run Model A + Model B in parallel
    # 5. aggregate scores
    # 6. determine confidence
    # 7. if LOW → llm.escalate_to_llm()
    # 8. if HIGH/MED → shap.explain() → llm.explain_with_llm()
    # 9. build response
    # 10. save to db
    pass