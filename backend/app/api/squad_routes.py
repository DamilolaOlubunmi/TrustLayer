import json
import logging

from fastapi import APIRouter, Request, HTTPException, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models import Transaction, Platform
from app.integrations.squad import validate_squad_signature

router = APIRouter(prefix="/api", tags=["squad"])
logger = logging.getLogger(__name__)


# main.py — new endpoint
@router.post("/v1/webhook/squad")
async def squad_webhook(request: Request, db: Session = Depends(get_session)):
    logger.info("Received Squad webhook")    

    body = await request.body()
    signature = request.headers.get("x-squad-encrypted-body")

    if not signature:
        logger.warning("Squad webhook rejected: missing x-squad-encrypted-body header")
        raise HTTPException(status_code=401, detail="Missing signature")

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        logger.warning("Squad webhook rejected: invalid JSON body")
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    # Correctly accessing top level fields
    event = payload.get("Event")
    transaction_ref = payload.get("TransactionRef")

    logger.info(
        "Squad webhook parsed: event=%s transaction_ref=%s payload_keys=%s",
        event,
        transaction_ref,
        list(payload.keys()),
    )

    # Correctly accessing nested Body fields
    body_data = payload.get("Body", {})
    amount = body_data.get("amount")
    currency = body_data.get("currency")
    transaction_type = body_data.get("transaction_type")

    # Look up transaction
    transaction = db.exec(
        select(Transaction).where(Transaction.id == transaction_ref)
    ).first()

    if not transaction:
        logger.warning(
            "Squad webhook rejected: transaction not found (transaction_ref=%s)",
            transaction_ref,
        )
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Get platform secret key
    platform = db.exec(
        select(Platform).where(Platform.id == transaction.platform_id)
    ).first()

    if not platform:
        logger.warning(
            "Squad webhook rejected: platform not found (transaction_ref=%s platform_id=%s)",
            transaction_ref,
            transaction.platform_id,
        )
        raise HTTPException(status_code=404, detail="Platform not found")

    if not platform.squad_secret_key:
        logger.warning(
            "Squad webhook rejected: platform missing Squad secret (transaction_ref=%s platform_id=%s)",
            transaction_ref,
            platform.id,
        )
        raise HTTPException(status_code=401, detail="Missing platform Squad secret")

    # Validate signature
    if not validate_squad_signature(body, signature, platform.squad_secret_key):
        logger.warning(
            "Squad webhook rejected: invalid signature (transaction_ref=%s platform_id=%s)",
            transaction_ref,
            platform.id,
        )
        raise HTTPException(status_code=401, detail="Invalid signature")

    if event != "charge_successful":
        logger.info(
            "Squad webhook ignored: unsupported event=%s transaction_ref=%s",
            event,
            transaction_ref,
        )
        return {"status": "ignored"}

    transaction.squad_status = "completed"
    transaction.payment_method = transaction_type
    transaction.amount = amount/100  # Convert from kobo to main currency unit
    transaction.currency = currency
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    logger.info(
        "Squad webhook processed successfully: event=%s transaction_ref=%s status=completed",
        event,
        transaction_ref,
    )

    return {
        "response_code": 200,
        "transaction_reference": transaction_ref,
        "response_description": "Success"
    }