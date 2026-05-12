import os
import json

import anthropic
from dotenv import load_dotenv
from typing import Any

from app.schema import EvaluateRequest

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

def explain_with_llm(shap_signals: list, payload: EvaluateRequest) -> dict | Any:
    """
    shap_signals: [{"feature": "vendor_account_age", "value": 0.28}, ...]
    Returns: ["Vendor account is 4 days old...", "Listing price is 67%..."]
    """
    prompt = f"""
    You are a fraud analyst writing a clear explanation for a platform operator.
    The following signals drove a fraud risk decision for a Nigerian marketplace
    transaction.
    Convert each signal into one plain-English sentence a non-technical person can
    understand.
    Return ONLY a JSON array of strings. No preamble.
    Transaction context:
    - Amount: NGN {payload.transaction.amount:,}
    - Vendor account age: {payload.vendor.account_age_days} days
    - Buyer average spend: NGN {payload.buyer.get("avg_transaction_amount", "unknown"):,}
    Top risk signals (feature name: SHAP contribution):
    {json.dumps(shap_signals, indent=2)}
    """

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    message = client.messages.create(
    model="claude-haiku-4-5",
    max_tokens=3000,
    messages=[{
        "role": "user",
        "content": prompt
    }]
    )
    return message.content[0].text

def escalate_to_llm(payload: EvaluateRequest, buyer_score: float, vendor_score: float) -> dict | Any:
    
    system_prompt = """
    You are TrustLayer, an AI fraud analyst specialising in Nigerian digital payment fraud. 
    You are called as the decision-maker of last resort when the ML models are uncertain 
    about a transaction. Your job is to reason through the full transaction context and 
    return a final fraud decision.

    You have deep knowledge of the following Nigerian fraud patterns:
    - Fake electronics listings: new vendor accounts pricing 50-70% below market to 
      collect payment then disappear
    - WhatsApp funnel attacks: victims lured via WhatsApp to fraudulent listings, 
      pressured into fast payment
    - Advance fee fraud: victim groomed into making repeated increasing payments for 
      a promised reward that never materialises
    - Fake logistics vendors: new accounts posing as delivery services, collecting 
      payment for shipments that never move
    - Supplier impersonation: fraudster creates account mimicking a known supplier, 
      redirects payment to a new account
    - Service non-delivery: freelancer or service vendor collects upfront payment 
      then becomes unreachable

    Key signals that strongly indicate fraud in the Nigerian context:
    - Vendor account age under 14 days with zero completed transactions
    - Listing price more than 40% below category average
    - Buyer arrived via WhatsApp link or unrecognised external source
    - Transaction amount significantly higher than buyer's historical average
    - Late night transaction (midnight to 4am) involving a new vendor
    - Multiple increasing payments from same buyer to same vendor in under 7 days

    You must return ONLY a valid JSON object. No preamble, no explanation outside the 
    JSON, no markdown formatting. The JSON must match this exact structure:
    {
        "decision": "ALLOW" | "REVIEW" | "BLOCK",
        "confidence": "LOW" | "MEDIUM" | "HIGH",
        "reasons": ["string", "string", "string"],
        "primary_signal": "buyer" | "vendor"
    }

    Rules for your decision:
    - BLOCK if you identify clear fraud pattern matches or multiple compounding signals
    - REVIEW if signals are suspicious but not conclusive — err toward REVIEW over ALLOW 
      when uncertain
    - ALLOW only if you can identify no meaningful fraud signals after reasoning through 
      all context
    - reasons must be plain English sentences a non-technical platform operator can read 
      and act on — maximum 3 sentences
    - Your confidence reflects how certain you are given the available data, not the 
      fraud probability itself
    """

    user_prompt = f"""
    The ML models returned uncertain scores for this transaction and could not reach a 
    confident decision. Reason through the full context and return your verdict.

    ML MODEL SCORES (both uncertain — this is why you are being called):
    - Buyer risk score: {buyer_score:.2f}
    - Vendor risk score: {vendor_score:.2f}

    TRANSACTION:
    - Amount: NGN {payload.transaction.amount:,}
    - Payment method: {payload.transaction.payment_method}
    - Timestamp: {payload.transaction.timestamp}

    BUYER:
    - Account age: {payload.buyer.account_age_days} days
    - Total past transactions: {payload.buyer.total_past_transactions or "unknown"}
    - Average past spend: NGN {payload.buyer.avg_transaction_amount:,} if payload.buyer.avg_transaction_amount else "unknown"}
    - Past dispute count: {payload.buyer.past_dispute_count or "unknown"}

    VENDOR:
    - Account age: {payload.vendor.account_age_days} days
    - Completed transactions: {payload.vendor.total_completed_transactions or "unknown"}
    - Category: {payload.vendor.category or "unknown"}
    - Listing price: NGN {payload.vendor.listing_price:,} if payload.vendor.listing_price else "unknown"}
    - Category average price: NGN {payload.vendor.avg_category_price:,} if payload.vendor.avg_category_price else "unknown"}

    SESSION:
    - Arrival source: {payload.session.arrival_source if payload.session else "unknown"}
    - Time on page: {payload.session.time_on_page_seconds if payload.session else "unknown"} seconds
    - Device type: {payload.session.device_type if payload.session else "unknown"}
    - IP country: {payload.session.ip_country if payload.session else "unknown"}
    - VPN detected: {payload.session.ip_is_vpn if payload.session else "unknown"}

    Return your verdict as a JSON object only.
    """

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )

    raw = response.content[0].text.strip()
    return json.loads(raw)