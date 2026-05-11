from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Transaction(BaseModel):
    id: str
    amount: int
    currency: str
    timestamp: datetime
    payment_method: str


class Buyer(BaseModel):
    id: str
    account_age_days: int


class Vendor(BaseModel):
    id: str
    account_age_days: int


class Session(BaseModel):
    ip_country: Optional[str] = None


class EvaluateRequest(BaseModel):
    transaction: Transaction
    buyer: Buyer
    vendor: Vendor
    session: Optional[Session] = None


class EvaluateResponse(BaseModel):
    transaction_id: str
    decision: str
    score: float
    confidence: str
    buyer_risk_score: float
    vendor_risk_score: float
    primary_signal: str
    escalated_to_llm: bool
    reasons: List[str]
    recommended_action: str


class FeedbackRequest(BaseModel):
    transaction_id: str
    outcome: str
    reported_by: str
    reported_at: datetime