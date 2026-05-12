# TrustLayer API Backend

A FastAPI-based fraud detection and risk assessment platform that evaluates transactions, manages platform integrations, and provides comprehensive authentication and API key management.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Schemas](#schemas)
3. [Database Models](#database-models)
4. [Authentication & Security](#authentication--security)
5. [API Endpoints](#api-endpoints)
6. [Business Rules](#business-rules)
7. [Setup & Installation](#setup--installation)
8. [Environment Configuration](#environment-configuration)

---

## Architecture Overview

The backend is structured around a **FastAPI** application with the following layers:

- **API Layer** (`app/api/`) - HTTP endpoints organized by domain (auth, dashboard)
- **Database Layer** (`app/database.py`, `app/models.py`) - SQLModel ORM with SQLAlchemy
- **Business Logic Layer** (`app/rules.py`, `app/pipeline.py`) - Fraud detection rules and evaluation pipeline
- **ML Layer** (`app/ml/`) - Machine learning model features, training, and explanations

---

## Schemas

Schemas are Pydantic models used for request/response validation in API endpoints.

### Transaction Schema
```python
class Transaction(BaseModel):
    id: str                  # Unique transaction identifier
    amount: int              # Transaction amount
    currency: str            # Currency code (default: NGN)
    timestamp: datetime      # When transaction occurred
    payment_method: str      # Payment method used
```
**Function**: Defines transaction input structure for evaluation requests.

### Buyer Schema
```python
class Buyer(BaseModel):
    id: str                           # Unique buyer identifier
    account_age_days: int             # Days since account creation
    total_past_transactions: int      # Total transactions by buyer
    avg_transaction_amount: int       # Average transaction amount
    past_dispute_count: int           # Number of past disputes
```
**Function**: Captures buyer profile data used in risk scoring.

### Vendor Schema
```python
class Vendor(BaseModel):
    id: str                            # Unique vendor identifier
    account_age_days: int              # Days since account creation
    total_completed_transactions: int  # Completed transactions
    category: str                      # Vendor category (e.g., electronics)
    listing_price: int                 # Price of current listing
    avg_category_price: int            # Average price in category
```
**Function**: Stores vendor profile data for risk assessment.

### Session Schema
```python
class Session(BaseModel):
    ip_country: str              # IP geolocation country
    ip_address: str              # IP address
    arrival_source: str          # Source of traffic (e.g., whatsapp_link)
    time_on_page_seconds: int    # Time spent on page
    browser: str                 # Browser type
    device_type: str             # Device type (mobile/desktop)
    device_fingerprint: str      # Device fingerprint
```
**Function**: Session/behavioral data for fraud pattern detection.

### EvaluateRequest Schema
```python
class EvaluateRequest(BaseModel):
    transaction: Transaction          # Transaction details
    buyer: Buyer                       # Buyer information
    vendor: Vendor                     # Vendor information
    session: Optional[Session] = None  # Optional session data
```
**Function**: Request payload for transaction evaluation endpoint. Combines all transaction context.

### EvaluateResponse Schema
```python
class EvaluateResponse(BaseModel):
    transaction_id: str          # Transaction ID
    decision: str                # Decision (ALLOW/BLOCK/REVIEW)
    score: float                 # Overall risk score (0-1)
    confidence: str              # Confidence level (HIGH/MEDIUM/LOW)
    buyer_risk_score: float      # Buyer-specific risk score
    vendor_risk_score: float     # Vendor-specific risk score
    primary_signal: str          # Primary risk signal (buyer/vendor/session)
    escalated_to_llm: bool       # Whether escalated to LLM for analysis
    rule_preset_matched: str     # Business rule that triggered decision
    reasons: List[str]           # Human-readable reasons for decision
    recommended_action: str      # Recommended action to take
```
**Function**: Response payload with fraud evaluation results and reasoning.

### FeedbackRequest Schema
```python
class FeedbackRequest(BaseModel):
    transaction_id: str  # ID of transaction to provide feedback for
    outcome: str         # Outcome (fraudulent/legitimate/disputed_unresolved)
    reported_by: str     # User/platform reporting feedback
    reported_at: datetime # When feedback was submitted
```
**Function**: Allows platforms to report actual transaction outcomes for model improvement.

### SignupRequest Schema
```python
class SignupRequest(BaseModel):
    email: EmailStr               # Platform email (validated)
    password: str                 # Platform password
    username: Optional[str] = None # Display name
```
**Function**: Platform registration payload.

### TokenResponse Schema
```python
class TokenResponse(BaseModel):
    access_token: str              # JWT bearer token
    token_type: str = "bearer"     # Token type (always "bearer")
```
**Function**: Returns JWT token after successful authentication.

### APIKeyResponse Schema
```python
class APIKeyResponse(BaseModel):
    id: str                # Unique API key ID (e.g., key_xxx)
    api_key: str           # Plaintext API key (shown only once)
    name: Optional[str]    # Optional label for the key
    created_at: datetime   # When API key was created
```
**Function**: Response when generating/regenerating API keys.

### UpdateProfileRequest Schema
```python
class UpdateProfileRequest(BaseModel):
    username: Optional[str]      # New username
    email: Optional[EmailStr]    # New email
```
**Function**: Payload for updating platform profile information.

### ChangePasswordRequest Schema
```python
class ChangePasswordRequest(BaseModel):
    old_password: str  # Current password for verification
    new_password: str  # New password to set
```
**Function**: Payload for password change requests.

---

## Database Models

Database models use **SQLModel** and **SQLAlchemy** for ORM functionality.

### Platform Model
```python
class Platform(SQLModel, table=True):
    id: str                           # UUID primary key
    name: str                         # Platform/company name
    email: str                        # Contact email (unique)
    password_hash: Optional[str]      # Argon2 hashed password
    is_active: bool = True            # Account status
    created_at: datetime              # Account creation time
    
    # Relationships
    api_keys: List[APIKey]            # One-to-many with API keys
    transactions: List[Transaction]   # One-to-many with transactions
    feedbacks: List[Feedback]         # One-to-many with feedback
    buyers: List[BuyerProfile]        # One-to-many with buyer profiles
    vendors: List[VendorProfile]      # One-to-many with vendor profiles
```
**Function**: Core platform/customer entity. Each integration has one Platform record.

### APIKey Model
```python
class APIKey(SQLModel, table=True):
    id: str                           # Primary key (e.g., key_xxx)
    platform_id: str (UNIQUE)         # Foreign key to Platform (one per platform)
    key: str                          # Plaintext API key (URL-safe base64)
    key_hash: str                     # SHA256 hash for validation
    name: Optional[str]               # Optional label
    created_at: datetime              # Key creation time
    last_used_at: Optional[datetime]  # Last usage timestamp
    is_active: bool = True            # Key status
    
    # Relationship
    platform: Platform                # Back-reference to Platform
```
**Function**: API key storage with one key per platform. Plaintext key stored for user retrieval, hash used for validation. `last_used_at` tracks usage for security audits.

### Transaction Model
```python
class Transaction(SQLModel, table=True):
    id: str                           # Primary key
    platform_id: str (FK)             # Which platform submitted this
    
    # Transaction Details
    amount: Optional[int]             # Transaction amount
    currency: str = "NGN"             # Currency code
    timestamp: Optional[datetime]     # When transaction occurred
    payment_method: Optional[str]     # Payment method
    
    # Buyer Details
    buyer_id: Optional[str]           # Buyer identifier
    buyer_account_age_days: Optional[int]      # Buyer account age
    buyer_total_past_txns: Optional[int]       # Buyer transaction count
    buyer_avg_amount: Optional[int]            # Buyer average amount
    buyer_dispute_count: Optional[int]         # Buyer dispute history
    
    # Vendor Details
    vendor_id: Optional[str]                   # Vendor identifier
    vendor_account_age_days: Optional[int]     # Vendor account age
    vendor_completed_txns: Optional[int]       # Vendor completed transactions
    vendor_category: Optional[str]             # Vendor category
    listing_price: Optional[int]               # Item listing price
    avg_category_price: Optional[int]          # Category average price
    
    # Session Details
    arrival_source: Optional[str]     # Traffic source
    time_on_page_seconds: Optional[int]        # User session duration
    
    # Evaluation Results
    buyer_score: Optional[float]      # Computed buyer risk (0-1)
    vendor_score: Optional[float]     # Computed vendor risk (0-1)
    final_score: Optional[float]      # Final aggregated score
    confidence: Optional[str]         # Confidence level
    decision: Optional[str]           # ALLOW/BLOCK/REVIEW
    primary_signal: Optional[str]     # buyer/vendor/session
    rule_preset_matched: Optional[str] # Rule that triggered
    escalated_to_llm: int = 0         # Whether escalated (0/1)
    reasons: Optional[dict] (JSON)    # JSON array of reasoning
    
    created_at: datetime              # When record was created
    
    # Relationships
    feedbacks: List[Feedback]         # One-to-many with feedback
    platform: Platform                # Back-reference to Platform
```
**Function**: Core transaction record. Stores both input context and evaluation output. JSON `reasons` field is queryable.

### Feedback Model
```python
class Feedback(SQLModel, table=True):
    id: Optional[int]                 # Auto-increment primary key
    platform_id: str (FK)             # Submitting platform
    transaction_id: Optional[str] (FK) # Related transaction
    
    outcome: Optional[str]            # fraudulent/legitimate/disputed_unresolved
    report_type: Optional[str]        # Type of report
    reported_by: Optional[str]        # User who reported
    reported_at: Optional[datetime]   # When reported
    
    # Relationships
    transaction: Transaction          # Back-reference to Transaction
    platform: Platform                # Back-reference to Platform
```
**Function**: Stores feedback on transaction outcomes. Used to improve models and measure system accuracy.

### VendorProfile Model
```python
class VendorProfile(SQLModel, table=True):
    vendor_id: str (PK)               # Vendor identifier
    platform_id: str (FK)             # Platform vendor belongs to
    
    total_transactions_seen: int = 0  # Transactions processed
    total_fraud_flags: int = 0        # Fraud incidents
    avg_risk_score: float = 0.0       # Average risk score
    last_seen: Optional[datetime]     # Last transaction time
    
    # Relationship
    platform: Platform                # Back-reference to Platform
```
**Function**: Aggregated vendor risk profile. Tracks vendor-level fraud metrics for pattern detection.

### BuyerProfile Model
```python
class BuyerProfile(SQLModel, table=True):
    buyer_id: str (PK)                # Buyer identifier
    platform_id: str (FK)             # Platform buyer belongs to
    
    total_transactions_seen: int = 0  # Transactions processed
    total_disputes: int = 0           # Disputes filed
    avg_amount: int = 0               # Average transaction amount
    avg_risk_score: float = 0.0       # Average risk score
    last_seen: Optional[datetime]     # Last transaction time
    
    # Relationship
    platform: Platform                # Back-reference to Platform
```
**Function**: Aggregated buyer risk profile. Tracks buyer-level patterns like dispute frequency.

### TransactionFeatures Model
```python
class TransactionFeatures(SQLModel, table=True):
    id: Optional[int]                 # Auto-increment PK
    transaction_id: str (FK, indexed) # Related transaction
    
    # Buyer (Model A) Features
    amount_deviation_ratio: Optional[float]    # Deviation from buyer average
    buyer_account_age_days: Optional[int]      # Account age
    buyer_tx_velocity: Optional[float]         # Transactions per day
    buyer_dispute_rate: Optional[float]        # Dispute percentage
    is_first_transaction: Optional[int]        # Boolean flag
    time_of_day_risk: Optional[int]            # Risk based on time
    arrival_source_risk: Optional[int]         # Risk based on source
    session_duration_flag: Optional[int]       # Boolean for short sessions
    
    # Vendor (Model B) Features
    vendor_account_age_days: Optional[int]     # Account age
    vendor_completion_rate: Optional[float]    # Transaction completion %
    listing_price_ratio: Optional[float]       # Price vs category average
    vendor_tx_velocity: Optional[float]        # Transactions per day
    vendor_fraud_flags: Optional[int]          # Historical fraud count
    category_risk_score: Optional[float]       # Category-level risk
    has_completed_any_txn: Optional[int]       # Boolean
    
    created_at: str (ISO format)      # Feature computation timestamp
```
**Function**: ML feature engineering storage. Pre-computed features for Model A (buyer) and Model B (vendor) risk scoring.

---

## Authentication & Security

### Password Hashing
- **Algorithm**: Argon2 (via `passlib`)
- **No Length Limit**: Argon2 supports unlimited password length (unlike bcrypt's 72-byte limit)
- **Functions**:
  - `get_password_hash(password: str) -> str` - Hash a plaintext password
  - `verify_password(plain_password: str, hashed_password: str) -> bool` - Verify password against hash

### JWT Token Management
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Default Expiry**: 24 hours (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- **Functions**:
  - `create_access_token(subject: str, expires_delta: Optional[timedelta]) -> str` - Generate JWT
  - `decode_access_token(token: str) -> dict` - Decode and validate JWT
  - **Throws**: `HTTPException(401)` if invalid/expired

### API Key Management
- **Storage**: Plain key + SHA256 hash
- **Generation**: 32-byte URL-safe base64 (`secrets.token_urlsafe(32)`)
- **Flow**: 
  1. Created automatically at platform signup
  2. Plaintext stored in DB for user retrieval anytime
  3. Hash used for authentication on every request
  4. `last_used_at` updated on each API call
- **Regeneration**: New key replaces old one; old key immediately invalid
- **One Per Platform**: Unique constraint on `platform_id`

### Dependency Injection
- `get_current_user(token: str, session: Session) -> Platform` - JWT authentication, returns authenticated Platform
- `get_api_key_platform(api_key: str, session: Session) -> Platform` - API key auth, returns associated Platform

---

## API Endpoints

### Authentication Endpoints

#### `POST /api/signup`
**Auth**: None  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "username": "company_name"
}
```
**Response**: `TokenResponse`
```json
{
  "access_token": "eyJ0eXAi...",
  "token_type": "bearer"
}
```
**Function**: Register new platform. Automatically creates:
- Platform record with UUID
- API key (accessible via GET `/api/api-key`)
- JWT token for immediate use

**Validation**:
- Email must be unique and valid
- Username, email, password all required
- Returns 400 if email already registered

---

#### `POST /api/login`
**Auth**: None  
**Request Body** (JSON):
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "username": "ignored"
}
```
**Response**: `TokenResponse`
**Function**: Authenticate with email/password, return JWT token. For JSON-based frontend requests.

**Error Handling**:
- Returns 401 if credentials invalid
- Compares plaintext password against Argon2 hash

---

#### `POST /api/token`
**Auth**: None  
**Request Body** (Form-encoded): `username`, `password`  
**Response**: `TokenResponse`  
**Function**: Form-based login for Swagger UI OAuth2 flow. Same as `/login` but accepts form data.

---

### Profile Management Endpoints

#### `GET /api/profile`
**Auth**: JWT Bearer Token  
**Response**:
```json
{
  "id": "platform-uuid",
  "email": "user@example.com",
  "name": "company_name"
}
```
**Function**: Retrieve authenticated platform's profile information.

---

#### `PATCH /api/profile`
**Auth**: JWT Bearer Token  
**Request Body**:
```json
{
  "username": "new_name",
  "email": "newemail@example.com"
}
```
**Response**:
```json
{
  "status": "success",
  "profile": {
    "id": "platform-uuid",
    "email": "newemail@example.com",
    "name": "new_name"
  }
}
```
**Function**: Update platform name and/or email. Validates email uniqueness.

---

#### `POST /api/profile/change-password`
**Auth**: JWT Bearer Token  
**Request Body**:
```json
{
  "old_password": "current_password",
  "new_password": "new_secure_password"
}
```
**Response**: `{"status": "success"}`  
**Function**: Change password. Verifies old password before updating.

**Error Handling**:
- Returns 400 if old password incorrect

---

#### `DELETE /api/profile`
**Auth**: JWT Bearer Token  
**Response**: `{"status": "deleted"}`  
**Function**: Permanently delete platform account and all associated data (cascading delete).

---

### API Key Management Endpoints

#### `GET /api/api-key`
**Auth**: JWT Bearer Token  
**Response**: `APIKeyResponse`
```json
{
  "id": "key_abc123def456",
  "api_key": "h7KJP9mL2vN4x6zQ8pR1tU3wS5yB0dE-FgHjIkLmNoPqRsTuVwXyZa",
  "name": null,
  "created_at": "2026-05-12T10:30:00"
}
```
**Function**: Retrieve the platform's current API key anytime (plaintext for copying).

---

#### `POST /api/api-key/regenerate`
**Auth**: JWT Bearer Token  
**Response**: `APIKeyResponse` (with new key)  
**Function**: Invalidate current API key and generate a new one. Useful if key is compromised. Old key immediately stops working.

---

### Transaction Evaluation Endpoints

#### `POST /api/v1/evaluate`
**Auth**: API Key (`X-API-Key` header)  
**Request Body**: `EvaluateRequest`
```json
{
  "transaction": {
    "id": "txn_123",
    "amount": 50000,
    "currency": "NGN",
    "timestamp": "2026-05-12T10:30:00",
    "payment_method": "card"
  },
  "buyer": {
    "id": "buyer_456",
    "account_age_days": 30,
    "total_past_transactions": 5,
    "avg_transaction_amount": 45000,
    "past_dispute_count": 0
  },
  "vendor": {
    "id": "vendor_789",
    "account_age_days": 60,
    "total_completed_transactions": 50,
    "category": "electronics",
    "listing_price": 50000,
    "avg_category_price": 45000
  },
  "session": {
    "ip_country": "NG",
    "ip_address": "192.168.1.1",
    "arrival_source": "direct",
    "time_on_page_seconds": 120,
    "browser": "Chrome",
    "device_type": "mobile",
    "device_fingerprint": "abc123"
  }
}
```
**Response**: `EvaluateResponse`
```json
{
  "transaction_id": "txn_123",
  "decision": "ALLOW",
  "score": 0.21,
  "confidence": "HIGH",
  "buyer_risk_score": 0.12,
  "vendor_risk_score": 0.17,
  "primary_signal": "buyer",
  "escalated_to_llm": false,
  "rule_preset_matched": null,
  "reasons": ["No major fraud indicators detected"],
  "recommended_action": "Proceed with transaction"
}
```
**Function**: Evaluate transaction for fraud risk. Runs business rules, ML models, and returns decision with reasoning.

**Authentication**: Requires valid API key in `X-API-Key` header

---

#### `POST /api/v1/evaluation/demo`
**Auth**: None (Public)  
**Request Body**: `EvaluateRequest`  
**Response**: `EvaluateResponse`  
**Function**: Public demo endpoint for testing evaluation without API key. Returns same format as authenticated `/evaluate`.

---

#### `POST /api/v1/feedback`
**Auth**: JWT Bearer Token  
**Request Body**: `FeedbackRequest`
```json
{
  "transaction_id": "txn_123",
  "outcome": "fraudulent",
  "reported_by": "platform_admin",
  "reported_at": "2026-05-12T11:00:00"
}
```
**Response**:
```json
{
  "status": "success",
  "transaction_id": "txn_123"
}
```
**Function**: Submit feedback on transaction outcome. Used for model training and accuracy tracking.

---

#### `GET /api/v1/transactions`
**Auth**: JWT Bearer Token  
**Response**:
```json
{
  "transactions": []
}
```
**Function**: Retrieve list of transactions for authenticated platform. (Currently returns empty; full implementation pending)

---

### Health Check Endpoints

#### `GET /`
**Auth**: None  
**Response**: `{"message": "TrustLayer API running"}`  
**Function**: Verify API is running.

---

#### `GET /health`
**Auth**: None  
**Response**: `{"status": "ok"}`  
**Function**: Health check endpoint for monitoring/load balancers.

---

## Business Rules

Business rules are scoring functions in `app/rules.py` that detect fraud patterns. Each returns a risk score (0-1) or `None` if pattern not detected.

### Rule: `fake_electronics_listing(payload: EvaluateRequest) -> float | None`
**Pattern**: Suspicious electronics vendor
**Triggers when**:
- Vendor account age < 7 days
- Listing price < 50% of category average
- Vendor category is "electronics"

**Score**: `0.78` (high risk)  
**Reason**: New electronics vendors pricing suspiciously low = likely scam attempt

---

### Rule: `new_vendor_high_value_txn(payload: EvaluateRequest) -> float | None`
**Pattern**: Brand new vendor handling high-value transaction
**Triggers when**:
- Vendor account age < 14 days
- Vendor has zero completed transactions
- Transaction amount > 100,000

**Score**: `0.70` (high risk)  
**Reason**: No transaction history + high value = fraud risk

---

### Rule: `advance_fee_pattern(payload: EvaluateRequest, db: Session) -> float | None`
**Pattern**: Escalating transaction amounts (advance fee scam)
**Triggers when**:
- Same buyer/vendor pair has 3+ transactions in last 7 days
- Each transaction amount strictly increasing

**Score**: `0.80` (very high risk)  
**Reason**: Classic advance fee scam pattern: small transaction → next larger → request for advance

---

### Rule: `whatsapp_funnel_attack(payload: EvaluateRequest) -> float | None`
**Pattern**: Fast funneling via WhatsApp link
**Triggers when**:
- User arrived via WhatsApp link
- Vendor account age < 30 days
- User spent < 15 seconds on page

**Score**: `0.65` (medium-high risk)  
**Reason**: Fast conversion from WhatsApp = pressure tactic/scam funnel

---

## Functions

### Core Functions

#### `create_db_and_tables()` (database.py)
**Purpose**: Initialize database schema. Creates all SQLModel tables.  
**Called**: On app startup via lifespan context manager  
**Implementation**: Uses SQLAlchemy `SQLModel.metadata.create_all(engine)`

---

#### `get_session() -> Generator[Session, None, None]` (database.py)
**Purpose**: Dependency injection function for database session.  
**Usage**: `def endpoint(session: Session = Depends(get_session)): ...`  
**Implementation**: Yields SQLModel Session, auto-closes on request end

---

#### `run_evaluation_pipeline(payload: EvaluateRequest)` (pipeline.py)
**Purpose**: Main evaluation entry point. Currently returns mock response.  
**Planned steps**:
1. Validate input payload
2. Run business rules (`app/rules.py`)
3. Extract features for ML models
4. Run Model A (buyer risk) + Model B (vendor risk) in parallel
5. Aggregate scores
6. Determine confidence level
7. If LOW confidence → escalate to LLM for manual review
8. Generate SHAP explanations
9. Build response with reasoning
10. Store results to database
11. Return EvaluateResponse

---

#### `_create_api_key_for_platform(session: Session, platform_id: str) -> APIKey` (profile_routes.py)
**Purpose**: Helper to generate and store API key for a platform.  
**Called**: During signup automatically  
**Returns**: APIKey model instance  
**Implementation**:
- Generates 32-byte URL-safe base64 key
- Computes SHA256 hash for validation
- Creates APIKey record with both plaintext and hash
- Commits to database

---

### Rule Functions
See [Business Rules](#business-rules) section for detailed documentation of all rule functions.

---

## Setup & Installation

### Prerequisites
- Python 3.12+
- pip or poetry
- SQLite (default) or PostgreSQL/MySQL

### Installation

1. **Clone repository**:
```bash
git clone https://github.com/DamilolaOlubunmi/TrustLayer.git
cd TrustLayer/backend
```

2. **Create virtual environment**:
```bash
python3.12 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Set environment variables** (see below)

5. **Run development server**:
```bash
cd backend
uvicorn app.main:app --reload
```

Server runs at `http://localhost:8000`  
Swagger UI at `http://localhost:8000/docs`

---

## Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL=sqlite:///./trustlayer.db
# Or for PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost/trustlayer

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=False  # Set to True for development
```

### Key Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./trustlayer.db` | Database connection string |
| `JWT_SECRET` | `change-me-in-prod` | Secret key for JWT signing (CHANGE IN PRODUCTION) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT token expiry in minutes |

---

## Security Considerations

1. **Change `JWT_SECRET` in production** - Generate a strong random secret
2. **Use HTTPS** - Always use HTTPS in production for JWT/API key transmission
3. **API Key Rotation** - Encourage platforms to regenerate keys periodically
4. **Password Policy** - Enforce strong passwords (consider adding validation)
5. **Rate Limiting** - Add rate limiting to prevent brute force attacks (currently not implemented)
6. **Database Security** - Use managed database services with encryption at rest
7. **CORS Configuration** - Configure CORS for frontend domain only (currently open)

---

## Database Schema

```
platforms (id[PK], email[UNIQUE], name, password_hash, is_active)
├── api_keys (id[PK], platform_id[FK,UNIQUE], key, key_hash, is_active)
├── transactions (id[PK], platform_id[FK], buyer_id, vendor_id, ...)
│   └── feedbacks (id[PK], transaction_id[FK], ...)
├── buyer_profiles (buyer_id[PK], platform_id[FK], ...)
└── vendor_profiles (vendor_id[PK], platform_id[FK], ...)

transaction_features (id[PK], transaction_id[FK,INDEXED], ...)
```

---

## Development Workflow

### Adding New Endpoints
1. Define request/response schemas in `app/schema.py`
2. Create route in `app/api/<domain>_routes.py`
3. Register router in `app/main.py` with `app.include_router()`
4. Test via Swagger UI at `/docs`

### Adding New Business Rules
1. Create function in `app/rules.py` returning `float | None`
2. Integrate into `app/pipeline.py` in `evaluate()` function
3. Call with `payload` and optional `db` Session

### Testing
Run with:
```bash
pytest
```
(Test suite currently not fully implemented)

---

## Deployment

### Using Docker
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Using Gunicorn (Production)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
```

### Environment-specific Configuration
- **Development**: Use SQLite, `DEBUG=True`, `JWT_SECRET` can be simple
- **Production**: Use PostgreSQL, `DEBUG=False`, generate strong `JWT_SECRET`, enable CORS restrictively

---

## API Documentation

Auto-generated Swagger UI available at `/docs`  
ReDoc available at `/redoc`

---

## Support

For issues or questions, refer to the main TrustLayer repository or contact the development team.
