from __future__ import annotations

import logging
import os
import uuid

import httpx

logger = logging.getLogger(__name__)

SQUAD_SMS_ENDPOINT = os.getenv(
    "SQUAD_SMS_ENDPOINT",
    "https://sandbox-api-d.squadco.com/sms/send/instant",
)


async def send_sms(
    squad_secret_key: str,
    phone_number: str,
    message: str,
) -> dict:
    """Send an SMS using Squad's SMS API."""

    headers = {
        "Authorization": f"Bearer {squad_secret_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "sender_id": os.getenv("SQUAD_SMS_SENDER_ID", uuid.uuid4().hex[:20]),
        "messages": [
            {
                "phone_number": phone_number,
                "message": message,
            }
        ],
    }

    timeout = httpx.Timeout(15.0, connect=5.0)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                SQUAD_SMS_ENDPOINT,
                json=payload,
                headers=headers,
            )
    except httpx.HTTPError:
        logger.exception("Squad SMS request failed for %s", phone_number)
        raise

    if response.status_code >= 400:
        logger.error(
            "Squad SMS HTTP failure for %s: %s",
            phone_number,
            response.text,
        )
        response.raise_for_status()

    try:
        data = response.json()
    except ValueError as exc:
        logger.exception("Squad SMS returned invalid JSON for %s", phone_number)
        raise RuntimeError("Invalid JSON response from Squad SMS") from exc

    if not data.get("status") and data.get("message") != "success":
        logger.error("Squad SMS reported failure for %s: %s", phone_number, data)
        raise RuntimeError(f"Squad SMS failed: {data}")

    return data
