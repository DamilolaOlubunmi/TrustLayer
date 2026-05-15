from typing import Optional, List
from datetime import datetime, timezone

from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column
from sqlalchemy.types import JSON

# =========================
# Platform (Your Customer)
# =========================
class Platform(SQLModel, table=True):
    __tablename__ = "platforms"

    id: str = Field(primary_key=True)  # use UUID
    name: str
    email: str  # REQUIRED
    squad_secret_key: Optional[str] = None  # For Squad integration
    phone_number: Optional[str] = None
    password_hash: Optional[str] = None
    is_active: bool = Field(default=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationship
    api_key: List["APIKey"] = Relationship(back_populates="platform")
    transactions: List["Transaction"] = Relationship(back_populates="platform")
    feedbacks: List["Feedback"] = Relationship(back_populates="platform")
    buyers: List["BuyerProfile"] = Relationship(back_populates="platform")
    vendors: List["VendorProfile"] = Relationship(back_populates="platform")
    review_decisions: List["ReviewDecision"] = Relationship(back_populates="platform")
    whitelist_entries: List["TransactionWhitelist"] = Relationship(back_populates="platform")
    # One-to-one relationship: each platform has a settings record
    settings: Optional["Settings"] = Relationship(back_populates="platform")


# =========================
# API Keys (Auth)
# =========================
class APIKey(SQLModel, table=True):
    __tablename__ = "api_keys"

    id: str = Field(primary_key=True)  # public key id (e.g. key_xxx)
    platform_id: str = Field(foreign_key="platforms.id", unique=True)  # One key per platform

    key: str  # plaintext key - can be retrieved anytime
    key_hash: str  # store hashed version for validation
    name: Optional[str] = None  # optional label

    created_at: datetime = Field(default_factory=datetime.now)
    last_used_at: Optional[datetime] = None

    is_active: bool = Field(default=True)

    # Relationship
    platform: Optional[Platform] = Relationship(back_populates="api_key")



# =========================
# Transactions Table
# =========================
class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"

    id: str = Field(primary_key=True)
    platform_id: str = Field(foreign_key="platforms.id")
    # Transaction fields
    amount: Optional[int] = None
    currency: str = Field(default="NGN")
    timestamp: Optional[datetime] = None
    payment_method: Optional[str] = None

    # Buyer fields
    buyer_id: Optional[str] = None
    buyer_account_age_days: Optional[int] = None
    buyer_total_past_txns: Optional[int] = None
    buyer_avg_amount: Optional[float] = None
    buyer_dispute_count: Optional[int] = None

    # Vendor fields
    vendor_id: Optional[str] = None
    vendor_account_age_days: Optional[int] = None
    vendor_completed_txns: Optional[int] = None
    vendor_category: Optional[str] = None
    listing_price: Optional[float] = None
    avg_category_price: Optional[float] = None

    # Session fields
    arrival_source: Optional[str] = None
    time_on_page_seconds: Optional[int] = None

    # Decision output
    buyer_score: Optional[float] = None
    vendor_score: Optional[float] = None
    final_score: Optional[float] = None
    confidence: Optional[str] = None
    decision: Optional[str] = None
    primary_signal: Optional[str] = None
    rule_preset_matched: Optional[str] = None
    escalated_to_llm: int = Field(default=0)

    # JSON field (queryable)
    reasons: Optional[List[str]] = Field(
        default=None,
        sa_column=Column(JSON)
    )

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    squad_status: Optional[str] = Field(default="Incomplete")  # new field to track Squad payment status

    # Relationships
    feedbacks: List["Feedback"] = Relationship(back_populates="transaction")
    platform: Optional["Platform"] = Relationship(back_populates="transactions")
    review_decision: Optional["ReviewDecision"] = Relationship(back_populates="transaction")


# =========================
# Feedback Table
# =========================
class Feedback(SQLModel, table=True):
    __tablename__ = "feedback"

    id: Optional[int] = Field(default=None, primary_key=True)
    platform_id: str = Field(foreign_key="platforms.id")

    transaction_id: Optional[str] = Field(
        default=None,
        foreign_key="transactions.id"
    )

    outcome: Optional[str] = None  # fraudulent | legitimate | disputed_unresolved
    report_type: Optional[str] = None
    reported_by: Optional[str] = None
    reported_at: Optional[datetime] = None

    # Relationship
    transaction: Optional["Transaction"] = Relationship(back_populates="feedbacks")
    platform: Optional["Platform"] = Relationship(back_populates="feedbacks")


# =========================
# Vendor Profile Table
# =========================
class VendorProfile(SQLModel, table=True):
    __tablename__ = "vendor_profile"

    vendor_id: str = Field(primary_key=True)
    platform_id: str = Field(foreign_key="platforms.id")

    total_transactions_seen: int = Field(default=0)
    total_completed_transactions: int = Field(default=0)
    total_fraud_flags: int = Field(default=0)
    avg_risk_score: float = Field(default=0)

    last_seen: Optional[datetime] = None

    platform: Optional["Platform"] = Relationship(back_populates="vendors")


# =========================
# Buyer Profile Table
# =========================
class BuyerProfile(SQLModel, table=True):
    __tablename__ = "buyer_profile"

    buyer_id: str = Field(primary_key=True)
    platform_id: str = Field(foreign_key="platforms.id")

    total_transactions_seen: int = Field(default=0)
    total_disputes: int = Field(default=0)
    avg_amount: float = Field(default=0)
    avg_risk_score: float = Field(default=0)

    last_seen: Optional[datetime] = None

    platform: Optional["Platform"] = Relationship(back_populates="buyers")


class TransactionFeatures(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    transaction_id: str = Field(foreign_key="transactions.id", index=True)

    # Model A — buyer features
    amount_deviation_ratio: Optional[float] = None
    buyer_account_age_days: Optional[int] = None
    buyer_tx_velocity: Optional[float] = None
    buyer_dispute_rate: Optional[float] = None
    is_first_transaction: Optional[int] = None
    time_of_day_risk: Optional[int] = None
    arrival_source_risk: Optional[int] = None
    session_duration_flag: Optional[int] = None

    # Model B — vendor features
    vendor_account_age_days: Optional[int] = None
    vendor_completion_rate: Optional[float] = None
    listing_price_ratio: Optional[float] = None
    vendor_tx_velocity: Optional[float] = None
    vendor_fraud_flags: Optional[int] = None
    category_risk_score: Optional[float] = None
    has_completed_any_txn: Optional[int] = None

    is_fraud: Optional[int] = None  # Label for training

    created_at: datetime = Field(default_factory=datetime.now)


# =========================
# Platform Settings Table
# =========================
class Settings(SQLModel, table=True):
    __tablename__ = "settings"

    id: int | None = Field(default=None, primary_key=True)
    platform_id: str = Field(foreign_key="platforms.id", unique=True)

    # Weighting for score aggregation
    buyer_weight: float = Field(default=0.5)
    vendor_weight: float = Field(default=0.5)

    # Decision thresholds (0-1)
    block_threshold: float = Field(default=0.8)
    review_threshold: float = Field(default=0.6)

    # Presets the platform wants active (stored as JSON list)
    active_presets: Optional[list] = Field(default=None, sa_column=Column(JSON))

    # Notification preferences
    notify_email: bool = Field(default=False)
    notify_sms: bool = Field(default=False)
    notify_phone: bool = Field(default=False)

    callback_url: Optional[str] = Field(default="https://goggle.com")  # For redirecting to custom checkout flow

    created_at: datetime = Field(default_factory=datetime.now)

    # Relationship
    platform: Optional[Platform] = Relationship(back_populates="settings")


# =========================
# Training Results Table
# =========================
class TrainingResult(SQLModel, table=True):
    __tablename__ = "training_results"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Training metadata
    model_type: str  # "buyer", "vendor", or "general"
    training_status: str = Field(default="in_progress")  # in_progress | success | failed
    training_data_size: Optional[int] = None  # Number of samples used

    # Performance metrics
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    roc_auc: Optional[float] = None
    pr_auc: Optional[float] = None

    # Additional data (stored as JSON)
    confusion_matrix: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    hyperparameters: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    metrics: Optional[dict] = Field(default=None, sa_column=Column(JSON))

    # Error handling
    error_message: Optional[str] = None

    # Timestamps
    trained_time_seconds: Optional[int] = None  # When training completed (in seconds)
    created_at: datetime = Field(default_factory=datetime.now)  # When record was created


class ReviewDecision(SQLModel, table=True):
    __tablename__ = "review_decisions"

    id: Optional[int] = Field(default=None, primary_key=True)
    transaction_id: str = Field(foreign_key="transactions.id", unique=True, index=True)
    platform_id: str = Field(foreign_key="platforms.id", index=True)

    decision: str = Field(default="REVIEW")
    review_token: str = Field(index=True, unique=True)
    expires_at: datetime
    notified_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationship
    transaction: Optional["Transaction"] = Relationship(back_populates="review_decision")
    platform: Optional["Platform"] = Relationship(back_populates="review_decisions")


class TransactionWhitelist(SQLModel, table=True):
    __tablename__ = "transaction_whitelist"

    id: Optional[int] = Field(default=None, primary_key=True)
    buyer_id: str = Field(index=True)
    vendor_id: str = Field(index=True)
    platform_id: str = Field(foreign_key="platforms.id", index=True)
    payment_method: str = Field(index=True)
    max_amount: float = Field(index=True)
    expires_at: datetime = Field(index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    platform: Optional["Platform"] = Relationship(back_populates="whitelist_entries")