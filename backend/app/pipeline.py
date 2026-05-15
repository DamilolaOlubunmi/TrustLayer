import asyncio
from datetime import datetime, timezone

import shortuuid
from fastapi import HTTPException, Request
from sqlmodel import Session, select

from app.models import (
    Transaction,
    Platform,
    Settings,
)
from app.schema import EvaluateRequest, EvaluateResponse
from app.ml.features import build_buyer_features, build_vendor_features
from app.ml.shap_explain import explain
from app.llm import explain_with_llm, escalate_to_llm
from app.integrations.squad import initiate_payment
from app.utils import Models

from app.background_tasks import save_features_to_store, update_profiles, send_review_notification
from app.services.rules_service import run_rule_presets
from app.services.validation_service import run_validation_gate
from app.services.scoring_service import run_models, aggregate_scores, determine_confidence, determine_decision
from app.services.notification_service import get_active_whitelist_entry


LLM_LOWER = 0.35
LLM_UPPER = 0.65


async def evaluate(
    payload: EvaluateRequest,
    db: Session,
    request: Request,
    background_tasks,
    platform: Platform
) -> EvaluateResponse:
    
    if not payload.transaction or not payload.buyer or not payload.vendor:
        raise HTTPException(400, "Transaction, Buyer, and Vendor information must be provided")
    
    if not payload.transaction.id:
        payload.transaction.id = f"txn_{int(datetime.now().timestamp() * 1000)}{shortuuid.uuid()}"
    else:
        payload.transaction.id += f"_{shortuuid.uuid()[:12]}"  # Append unique suffix to ensure uniqueness across retries
    
    platform_settings = db.exec(
    select(Settings).where(
        Settings.platform_id == platform.id
        )
    ).first()


    if not platform_settings:
        raise HTTPException(
            500,
            "Platform settings missing"
        )
    
    reasons: list[str] = []
    squad_data: dict[str, object] = {}
    decision: str | None = None
    is_fraud: bool = False  # Default to False, will set to True if BLOCK or REVIEW later

    # ── 1. Whitelist check ────────────────────
    whitelist_entry = get_active_whitelist_entry(
        db,
        platform_id=platform.id,
        buyer_id=payload.buyer.id,
        vendor_id=payload.vendor.id,
        payment_method=payload.transaction.payment_method,
        amount=payload.transaction.amount,
        current_time=datetime.now(timezone.utc),
    )

    if whitelist_entry:
        transaction = Transaction(
            id=payload.transaction.id,
            platform_id=platform.id,
            amount=payload.transaction.amount,
            currency=payload.transaction.currency,
            timestamp=payload.transaction.timestamp,
            payment_method=payload.transaction.payment_method,
            
            buyer_id=payload.buyer.id,
            vendor_id=payload.vendor.id,
            buyer_account_age_days=payload.buyer.account_age_days,
            vendor_account_age_days=payload.vendor.account_age_days,
            buyer_total_past_txns=payload.buyer.total_past_transactions,
            buyer_avg_amount=payload.buyer.avg_transaction_amount,
            vendor_completed_txns=payload.vendor.total_completed_transactions,
            buyer_dispute_count=payload.buyer.past_dispute_count,
            vendor_category=payload.vendor.category,
            listing_price=payload.vendor.listing_price,
            avg_category_price=payload.vendor.avg_category_price,

            final_score=0.0,
            confidence="HIGH",
            decision="ALLOW",
            primary_signal="whitelist",
            rule_preset_matched=None,
            escalated_to_llm=0,
            reasons=["Matched active temporary whitelist"],
            squad_status="whitelisted",
            created_at=datetime.now(timezone.utc),
        )
        try:
            db.add(transaction)
            db.commit()
        except Exception as e:
            db.rollback()
            print("SAVE ERROR:", repr(e))
            raise HTTPException(500, f"Failed to save transaction: {str(e)}")
        
        if platform.squad_secret_key and platform_settings.callback_url:
            try:
                squad_data = await initiate_payment(
                    squad_secret_key=platform.squad_secret_key,
                    transaction_ref=payload.transaction.id,
                    amount=payload.transaction.amount, # Since squad accepts payments in kobo
                    email=payload.transaction.email,
                    callback_url=platform_settings.callback_url,
                )
            except Exception as e:
                squad_data = {"error": f"Squad integration failed: {str(e)}"}

        background_tasks.add_task(
            update_profiles,
            payload,
            0.0,
            platform,
        )
        background_tasks.add_task(
            save_features_to_store,
            payload.transaction.id,
            buyer_features=build_buyer_features(payload, request, db),
            vendor_features=build_vendor_features(payload, request, db),
            is_fraud=is_fraud
        )

        return EvaluateResponse(
            transaction_id=payload.transaction.id,
            decision="ALLOW",
            score=0.0,
            confidence="HIGH",
            buyer_risk_score=0.0,
            vendor_risk_score=0.0,
            primary_signal="whitelist",
            escalated_to_llm=False,
            rule_preset_matched=None,
            reasons=["Matched active temporary whitelist"],
            recommended_action="Proceed with payment",
            missing_signals=[],
            squad_response=squad_data,
        )

    # ── 2. Validation gate ────────────────────
    missing_signals = run_validation_gate(payload)

    # ── 3. Rule presets ───────────────────────
    rule_floor, matched_preset = run_rule_presets(payload, db)

    # ── 4. Feature engineering ────────────────
    buyer_features  = build_buyer_features(payload, request, db)
    vendor_features = build_vendor_features(payload, request, db)

    # ── 5. Run models in parallel ─────────────
    buyer_score, vendor_score = run_models(buyer_features, vendor_features)

    # ── 6. Aggregate scores ───────────────────
    final_score, primary_signal = aggregate_scores(
        buyer_score, vendor_score, rule_floor, platform_settings
    )

    # ── 7. Confidence ─────────────────────────
    confidence = determine_confidence(
        buyer_score, vendor_score, missing_signals
    )

    # ── 8. Decision ───────────────────────────
    escalated_to_llm = False

    if confidence == "LOW" and LLM_LOWER <= final_score <= LLM_UPPER:
        # LOW confidence path — LLM decides and explains
        # Can't parallelise with Squad here since LLM makes the decision
        # Squad call depends on what LLM decides
        llm_result = await escalate_to_llm(payload, buyer_score, vendor_score)
        decision = str(llm_result.get("decision") or "REVIEW")
        confidence = str(llm_result.get("confidence") or confidence)
        llm_reasons = llm_result.get("reasons")
        reasons = llm_reasons if isinstance(llm_reasons, list) else [str(llm_reasons)]
        escalated_to_llm = True

        if decision == "ALLOW" and platform.squad_secret_key and platform_settings.callback_url:
            try:
                squad_data = await initiate_payment(
                    squad_secret_key=platform.squad_secret_key,
                    transaction_ref=payload.transaction.id,
                    amount=payload.transaction.amount,
                    email=payload.transaction.email,
                    callback_url=platform_settings.callback_url,
                )
            except Exception as e:
                squad_data = {"error": f"Squad integration failed: {str(e)}"}
                
        elif decision == "ALLOW":
            squad_data = {"error": "Transaction approved, but Squad credentials are not configured"}

        else:
            is_fraud = True
            reasons = reasons or ["Transaction flagged by LLM for review or blocking"]
            squad_data = {"error": "Transaction not approved by LLM, so Squad not called"}


    else:
        # HIGH/MEDIUM confidence path — SHAP + LLM explain
        # Run LLM explain and Squad initiate in parallel
        dominant_model    = Models.vendor_model if vendor_score > buyer_score else Models.buyer_model
        dominant_features = vendor_features if vendor_score > buyer_score else buyer_features
        shap_signals      = explain(dominant_features, dominant_model)

        decision = determine_decision(final_score, platform_settings)

        # Build coroutines based on decision
        llm_coroutine = explain_with_llm(shap_signals, payload, decision, final_score, confidence)

        if decision == "ALLOW" and platform.squad_secret_key and platform_settings.callback_url:
            squad_coroutine = initiate_payment(
                squad_secret_key=platform.squad_secret_key,
                transaction_ref=payload.transaction.id,
                amount=payload.transaction.amount,
                email=payload.transaction.email,
                callback_url=platform_settings.callback_url,
            )

            # Run both in parallel
            results = await asyncio.gather(
                llm_coroutine,
                squad_coroutine,
                return_exceptions=True
            )

            reasons = results[0] if isinstance(results[0], list) else ["error: could not generate explanation for this"]
            squad_data = results[1] if isinstance(results[1], dict) else {"error": f"Squad integration failed: {str(results[1])}"}

        elif decision == "ALLOW":
            try:
                llm_reasons = await llm_coroutine
                reasons = llm_reasons if isinstance(llm_reasons, list) else [str(llm_reasons)]
            except Exception as e:
                reasons = [f"error: could not generate explanation for this", "LLM error: " + str(e)]
            squad_data = {"error": "Transaction approved, but Squad credentials are not configured"}

        else:
            # BLOCK or REVIEW — no Squad call needed    
            # Just run LLM alone
            is_fraud = True
            try:
                llm_reasons = await llm_coroutine
                reasons = llm_reasons if isinstance(llm_reasons, list) else [str(llm_reasons)]
            except Exception as e:
                reasons = [f"error: could not generate explanation for this", "LLM error: " + str(e)]
            squad_data = {"error": "Transaction not approved by LLM, so Squad not called"}

    # ── 9. Recommended action ─────────────────
    recommended_action_map = {
        "ALLOW":  "Proceed with payment",
        "REVIEW": "Trigger step-up authentication or queue for manual review",
        "BLOCK":  "Block transaction and warn buyer"
    }
    recommended_action = recommended_action_map[decision]

    # ── 10. Save transaction ──────────────────
    transaction = Transaction(
        id=payload.transaction.id,
        platform_id=platform.id,
        amount=payload.transaction.amount,
        currency=payload.transaction.currency,
        timestamp=payload.transaction.timestamp,
        payment_method=payload.transaction.payment_method,

        buyer_id=payload.buyer.id,
        vendor_id=payload.vendor.id,
        buyer_account_age_days=payload.buyer.account_age_days,
        vendor_account_age_days=payload.vendor.account_age_days,
        buyer_total_past_txns=payload.buyer.total_past_transactions,
        buyer_avg_amount=payload.buyer.avg_transaction_amount,
        vendor_completed_txns=payload.vendor.total_completed_transactions,
        buyer_dispute_count=payload.buyer.past_dispute_count,
        vendor_category=payload.vendor.category,
        listing_price=payload.vendor.listing_price,
        avg_category_price=payload.vendor.avg_category_price,

        buyer_score=round(buyer_score, 4),
        vendor_score=round(vendor_score, 4),
        final_score=final_score,
        confidence=confidence,
        decision=decision,
        primary_signal=primary_signal,
        rule_preset_matched=matched_preset,
        escalated_to_llm=int(escalated_to_llm),
        reasons=reasons,
        squad_status="initiated" if decision == "ALLOW" and squad_data else None,
        created_at=datetime.now(timezone.utc)
    )

    try:
        db.add(transaction)
        db.commit()
    except Exception as e:
        db.rollback()
        print("SAVE ERROR:", repr(e))
        raise HTTPException(500, f"Failed to save transaction: {str(e)}")

    # ── 11. Background tasks ──────────────────
    background_tasks.add_task(
        save_features_to_store,
        payload.transaction.id,
        buyer_features,
        vendor_features,
        is_fraud
    )
    background_tasks.add_task(
        update_profiles,
        payload,
        final_score,
        platform
    )

    if decision == "REVIEW":
        background_tasks.add_task(
            send_review_notification,
            payload.transaction.id,
            payload,
            final_score,
            reasons,
            platform
        )

    # ── 12. Return response ───────────────────
    return EvaluateResponse(
        transaction_id=payload.transaction.id,
        decision=decision,
        score=final_score,
        confidence=confidence,
        buyer_risk_score=round(buyer_score, 4),
        vendor_risk_score=round(vendor_score, 4),
        primary_signal=primary_signal,
        escalated_to_llm=escalated_to_llm,
        rule_preset_matched=matched_preset,
        reasons=reasons,
        recommended_action=recommended_action,
        missing_signals=missing_signals,
        squad_response=squad_data  
    )
    