from typing import Optional, List
from datetime import datetime

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
    password_hash: Optional[str] = None
    is_active: bool = Field(default=True)

    created_at: datetime = Field(default_factory=datetime.now)

    # Relationship
    api_keys: List["APIKey"] = Relationship(back_populates="platform")
    transactions: List["Transaction"] = Relationship(back_populates="platform")
    feedbacks: List["Feedback"] = Relationship(back_populates="platform")
    buyers: List["BuyerProfile"] = Relationship(back_populates="platform")
    vendors: List["VendorProfile"] = Relationship(back_populates="platform")


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
    platform: Optional[Platform] = Relationship(back_populates="api_keys")



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
    buyer_avg_amount: Optional[int] = None
    buyer_dispute_count: Optional[int] = None

    # Vendor fields
    vendor_id: Optional[str] = None
    vendor_account_age_days: Optional[int] = None
    vendor_completed_txns: Optional[int] = None
    vendor_category: Optional[str] = None
    listing_price: Optional[int] = None
    avg_category_price: Optional[int] = None

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
    reasons: Optional[dict] = Field(
        default=None,
        sa_column=Column(JSON)
    )

    created_at: datetime = Field(default_factory=datetime.now)

    # Relationships
    feedbacks: List["Feedback"] = Relationship(back_populates="transaction")
    platform: Optional["Platform"] = Relationship(back_populates="transactions")


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
    avg_amount: int = Field(default=0)
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

    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())