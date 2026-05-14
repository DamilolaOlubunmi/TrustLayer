from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class Transaction(BaseModel):
    id: str
    amount: int
    currency: str
    email: str
    timestamp: datetime
    payment_method: str


class Buyer(BaseModel):
    id: str
    account_age_days: int
    total_past_transactions: Optional[int] = None
    avg_transaction_amount: Optional[int] = None
    past_dispute_count: Optional[int] = None


class Vendor(BaseModel):
    id: str
    account_age_days: int
    total_completed_transactions: Optional[int] = None
    category: Optional[str] = None
    listing_price: Optional[int] = None
    avg_category_price: Optional[int] = None


class Session(BaseModel):
    ip_country: Optional[str] = None
    ip_address: Optional[str] = None
    arrival_source: Optional[str] = None
    time_on_page_seconds: Optional[int] = None
    browser: Optional[str] = None
    device_type: Optional[str] = None
    device_fingerprint: Optional[str] = None

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
    rule_preset_matched: Optional[str] = None
    reasons: List[str]
    recommended_action: str
    missing_signals: Optional[List[str]] = None
    squad_response: Optional[dict] = None  # Include full Squad response for debugging  



class FeedbackRequest(BaseModel):
    transaction_id: str
    outcome: str
    reported_by: str
    reported_at: datetime

class FeedbackResponse(BaseModel):
    status: str
    transaction_id: str 

class TransactionListItem(BaseModel):
    id: str
    amount: str
    decision: str
    score: float
    rule_preset_matched: Optional[str] = None
    reasons: Optional[List[str]] = None
    created_at: datetime

class Stats(BaseModel):
    total: int
    blocked: int
    reviewed: int
    allowed: int
    total_value_protected: int

class TransactionListResponse(BaseModel):
    stat: Stats
    transactions: List[TransactionListItem]

# Auth schemas

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class APIKeyResponse(BaseModel):
    id: str
    api_key: str  # Only shown once at creation
    name: Optional[str] = None
    created_at: datetime


class APIKeyListResponse(BaseModel):
    id: str
    name: Optional[str] = None
    created_at: datetime
    last_used_at: Optional[datetime] = None
    is_active: bool
    token_type: str = "bearer"


class UpdateProfileRequest(BaseModel):
    username: Optional[str]
    email: Optional[EmailStr]
    phone_number: Optional[str]


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class SquadSecretUpdateRequest(BaseModel):
    squad_secret_key: str


class SettingsResponse(BaseModel):
    buyer_weight: float
    vendor_weight: float
    block_threshold: float
    review_threshold: float
    active_presets: Optional[List[str]] = None
    notify_email: bool
    notify_sms: bool
    notify_phone: bool
    callback_url: Optional[str] = None
    created_at: datetime


class SettingsUpdateRequest(BaseModel):
    buyer_weight: Optional[float] = None
    vendor_weight: Optional[float] = None
    block_threshold: Optional[float] = None
    review_threshold: Optional[float] = None
    active_presets: Optional[List[str]] = None
    notify_email: Optional[bool] = None
    notify_sms: Optional[bool] = None
    notify_phone: Optional[bool] = None
    callback_url: Optional[str] = None


class TrainingResultResponse(BaseModel):
    id: int
    platform_id: Optional[str]
    model_type: str
    training_status: str
    training_data_size: Optional[int]
    accuracy: Optional[float]
    precision: Optional[float]
    recall: Optional[float]
    f1_score: Optional[float]
    confusion_matrix: Optional[dict]
    hyperparameters: Optional[dict]
    metrics: Optional[dict]
    error_message: Optional[str]
    trained_at: Optional[datetime]
    created_at: datetime


class TrainingResultCreateRequest(BaseModel):
    model_type: str
    training_data_size: Optional[int] = None
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    confusion_matrix: Optional[dict] = None
    hyperparameters: Optional[dict] = None
    metrics: Optional[dict] = None
    error_message: Optional[str] = None


class TrainingResultUpdateRequest(BaseModel):
    training_status: Optional[str] = None
    training_data_size: Optional[int] = None
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    confusion_matrix: Optional[dict] = None
    hyperparameters: Optional[dict] = None
    metrics: Optional[dict] = None
    error_message: Optional[str] = None
    trained_at: Optional[datetime] = None


class ReviewDecisionResponse(BaseModel):
    transaction_id: str
    platform_id: str
    decision: str
    final_score: float
    reasons: List[str]
    expires_at: datetime
    reviewed_at: Optional[datetime] = None
    notified_at: Optional[datetime] = None
    status: str


class ReviewActionResponse(BaseModel):
    status: str
    transaction_id: str
    decision: str
    reviewed_at: datetime
    whitelist_created: bool = False


class TransactionWhitelistResponse(BaseModel):
    id: int
    buyer_id: str
    vendor_id: str
    platform_id: str
    payment_method: str
    max_amount: float
    expires_at: datetime
    created_at: datetime
