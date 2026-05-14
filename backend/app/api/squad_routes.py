import json

from fastapi import APIRouter, Request, HTTPException, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models import Transaction, Platform
from backend.app.integrations.squad import validate_squad_signature

router = APIRouter(prefix="/api", tags=["squad"])


# main.py — new endpoint
@router.post("/v1/webhook/squad")
async def squad_webhook(request: Request, db: Session = Depends(get_session)):

    body = await request.body()
    signature = request.headers.get("x-squad-signature")
    
    payload = json.loads(body)

    # Correctly accessing top level fields
    event = payload.get("Event")
    transaction_ref = payload.get("TransactionRef")

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
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Get platform secret key
    platform = db.exec(
        select(Platform).where(Platform.id == transaction.platform_id)
    ).first()

    # Validate signature
    if not validate_squad_signature(body, signature, platform.squad_secret_key):
        raise HTTPException(status_code=401, detail="Invalid signature")

    if event != "charge_successful":
        return {"status": "ignored"}

    transaction.squad_status = "completed"
    transaction.payment_method = transaction_type
    transaction.amount = amount
    transaction.currency = currency
    
    db.add(transaction)
    db.commit()

    return {
        "response_code": 200,
        "transaction_reference": transaction_ref,
        "response_description": "Success"
    }