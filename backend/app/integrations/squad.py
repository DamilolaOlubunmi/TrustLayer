# squad.py
import httpx
import hmac
import hashlib

import uuid

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
        "amount": amount,
        "email": email,
        "currency": currency,
        "initiate_type": "inline",
        "callback_url": callback_url,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
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



def validate_squad_signature(body: bytes, encrypted_body_header: str, secret_key: str) -> bool:

    # The x-squad-encrypted-body header is the HMAC of the entire body
    computed = hmac.new(
        secret_key.encode("utf-8"),
        body,                         # hash the entire raw body
        hashlib.sha512
    ).hexdigest().upper()
    
    return hmac.compare_digest(computed, encrypted_body_header.upper())


async def send_sms(
    squad_secret_key: str,
    phone_number: str,
    message: str
) -> dict:

    headers = {
        "Authorization": f"Bearer {squad_secret_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "sender_id": uuid.uuid4().hex[:20], 
        "messages": [
            {
                "phone_number": phone_number,
                "message": message
            }
        ]
    }

    async with httpx.AsyncClient(
        timeout=30.0
    ) as client:

        response = await client.post(
            f"{SQUAD_SANDBOX_URL}/sms/send/instant",
            json=payload,
            headers=headers
        )

    if response.status_code != 200:
        raise Exception(
            f"Squad SMS HTTP Error: {response.text}"
        )

    data = response.json()

    if not data.get("status"):
        raise Exception(
            f"Squad SMS failed: {data.get('errors')}"
        )

    return data