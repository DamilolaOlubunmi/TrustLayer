# squad.py
import httpx
import hmac
import hashlib

from app.integrations.http_client import http_client

SQUAD_SANDBOX_URL = "https://sandbox-api-d.squadco.com"
SQUAD_LIVE_URL = "https://api-d.squadco.com"

async def initiate_payment(
    squad_secret_key: str,
    transaction_ref: str,
    amount: int,            # in kobo — same as what came into /evaluate
    email: str,
    callback_url: str,      # where Squad redirects user after payment
    currency: str = "NGN",
) -> dict:
    
    headers = {
        "Authorization": f"Bearer {squad_secret_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "transaction_ref": transaction_ref,
        "amount": amount * 100, # Convert to kobo for Squad
        "email": email,
        "currency": currency,
        "initiate_type": "inline",
        "callback_url": callback_url,
    }

    # async with httpx.AsyncClient(timeout=120.0) as client:
    response = await http_client.post(
        f"{SQUAD_SANDBOX_URL}/transaction/initiate",
        json=payload,
        headers=headers
    )
    
    try:
        data = response.json()
    except Exception:
        raise Exception("Invalid response from Squad")
    
    if data.get("status") != 200 or response.status_code != 200:
        raise Exception(f"Squad initiate failed: {data.get('message')}")
    
    return data



def validate_squad_signature(body: bytes, encrypted_body_header: str | None, secret_key: str) -> bool:

    if not encrypted_body_header or not secret_key:
        return False

    # The x-squad-encrypted-body header is the HMAC of the entire body
    computed = hmac.new(
        secret_key.encode("utf-8"),
        body,                         # hash the entire raw body
        hashlib.sha512
    ).hexdigest().upper()
    
    return hmac.compare_digest(computed, encrypted_body_header.upper())

