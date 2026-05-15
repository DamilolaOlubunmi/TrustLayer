# TrustLayer

**AI-powered fraud detection for Nigerian digital payment platforms**

TrustLayer is a real-time transaction evaluation system that protects payment platforms from fraud using ensemble machine learning models and intelligent LLM-based reasoning. It evaluates buyer risk, vendor risk, and applies Nigeria-specific fraud detection rules to make fast, confident decisions on whether to allow, review, or block each transaction. The system returns a decision within ~200ms and provides human-readable explanations for every flagged transaction.

## Project Structure

```
TrustLayer/
├── backend/                          # FastAPI server and ML models
│   ├── main.py                       # Entry point; sets up CORS, routes, and model loading
│   ├── requirements.txt              # Python dependencies
│   ├── app/
│   │   ├── models.py                 # SQLModel database schemas (transactions, feedback, profiles, features)
│   │   ├── database.py               # SQLAlchemy engine and session management
│   │   ├── schema.py                 # Pydantic request/response schemas
│   │   ├── pipeline.py               # Main evaluation pipeline orchestrator
│   │   ├── rules.py                  # Four Nigeria-specific fraud rule presets
│   │   ├── llm.py                    # Claude integration for uncertain decisions and explanations
│   │   ├── utils.py                  # ML model loader and training result logger
│   │   ├── background_tasks.py       # Async tasks (feature storage, profile updates, notifications)
│   │   ├── api/                      # API route handlers
│   │   │   ├── auth.py               # JWT and API key authentication
│   │   │   ├── profile_routes.py     # Authentication, user profile, API key management
│   │   │   ├── dashboard_routes.py   # Transaction evaluation and feedback endpoints
│   │   │   ├── review_routes.py      # Review token workflow for flagged transactions
│   │   │   └── squad_routes.py       # Squad payment provider integration
│   │   ├── services/                 # Business logic layer
│   │   │   ├── scoring_service.py    # Model inference, score aggregation, decision logic
│   │   │   ├── rules_service.py      # Rule preset evaluation
│   │   │   ├── validation_service.py # Missing signal detection
│   │   │   ├── notification_service.py # Whitelist and notification dispatch
│   │   │   └── email_service.py      # Email sending via Resend
│   │   ├── ml/                       # Machine learning
│   │   │   ├── features.py           # Feature engineering for buyer and vendor models
│   │   │   ├── shap_explain.py       # SHAP explainability for model predictions
│   │   │   ├── train_buyer.py        # XGBoost buyer fraud model training
│   │   │   ├── train_vendor.py       # XGBoost vendor fraud model training
│   │   │   ├── constants.py          # Feature names and category risk scores
│   │   │   └── ml_models/            # Pickled model artifacts (generated after training)
│   │   ├── integrations/             # Third-party integrations
│   │   │   ├── squad.py              # Squad payment provider API calls
│   │   │   └── squad_sms.py          # SMS functionality (stub)
│   │   └── .env                      # Environment variables
│
├── frontend/                         # React + Vite SPA
│   ├── package.json                  # Dependencies and build scripts
│   ├── vite.config.js                # Vite build configuration
│   ├── eslint.config.js              # Code quality rules
│   ├── index.html                    # HTML entry point
│   ├── src/
│   │   ├── main.jsx                  # React DOM render entry
│   │   ├── App.jsx                   # Route definitions and authentication wrapper
│   │   ├── api.js                    # Axios HTTP client and API wrapper functions
│   │   ├── index.css                 # Global styles (Tailwind)
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global auth state and token management
│   │   ├── pages/                    # Full-page components
│   │   │   ├── LandingPage.jsx       # Public homepage with demo
│   │   │   ├── LoginPage.jsx         # Email/password login form
│   │   │   ├── SignupPage.jsx        # Registration form
│   │   │   ├── DashboardShell.jsx    # Layout wrapper and data fetching
│   │   │   ├── DashboardPage.jsx     # Overview dashboard
│   │   │   ├── TransactionsPage.jsx  # Transaction list with search/filter
│   │   │   ├── TransactionDetailsPage.jsx # Single transaction detail view
│   │   │   ├── FlaggedPage.jsx       # Transactions needing review
│   │   │   ├── FeedbackPage.jsx      # Submit correction feedback
│   │   │   ├── SettingsPage.jsx      # Platform settings
│   │   │   └── ProfilePage.jsx       # User profile and API key management
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   └── ProtectedRoute.jsx # Redirect unauthenticated users to login
│   │   │   ├── Dashboard/
│   │   │   │   ├── StatCard.jsx      # KPI metric display
│   │   │   │   ├── TransactionTable.jsx # Table of transactions with inline details
│   │   │   │   ├── TransactionDetails.jsx # Modal detail panel
│   │   │   │   ├── DecisionBreakdown.jsx # Pie chart of decision split
│   │   │   │   ├── RiskChart.jsx     # Risk signal visualization
│   │   │   │   ├── TopBar.jsx        # Header with logout
│   │   │   │   └── Sidebar.jsx       # Navigation menu
│   │   │   ├── Landing/              # Landing page sections
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Hero.jsx
│   │   │   │   ├── DemoSection.jsx
│   │   │   │   └── ... other sections
│   │   │   └── common/               # Reusable UI components
│   │   │       ├── Badge.jsx         # Decision status pill
│   │   │       ├── Button.jsx        # Button component
│   │   │       ├── Input.jsx         # Text input
│   │   │       ├── ScorePill.jsx     # Score badge
│   │   │       └── Icons.jsx         # Icon components
│   │   ├── utilis/
│   │   │   └── utilis.jsx            # Helper functions (number formatting, time ago)
│   │   └── data/
│   │       └── mock/                 # Mock data for demo mode
│
├── data/                             # Sample datasets
│   ├── synthetic_buyer_fraud_data.csv
│   └── synthetic_vendor_fraud_data.csv
│
├── test.ipynb                        # Jupyter notebook for testing
└── README.md                         # This file

```

## Prerequisites

- **Python 3.9+**
- **Node.js 18+** and npm 9+
- **SQLite 3** (included with Python)
- **Git**

## Local Setup

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourorg/trustlayer.git
   cd trustlayer
   ```

2. **Create a Python virtual environment**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create and configure `.env` file**
   
   Copy `.env.example` (or create a new `.env` file) in the `backend/` folder:
   ```bash
   cp .env.example .env
   # Or manually create with:
   cat > .env << 'EOF'
   ANTHROPIC_API_KEY=sk-ant-...                    # Claude API key for LLM escalation
   SQUAD_SECRET_KEY=your_squad_secret              # Squad payment provider secret
   DATABASE_URL=sqlite:///trustlayer.db            # SQLite database path (default works fine)
   RESEND_API_KEY=re_...                           # Email service provider key
   SQUAD_SMS_SENDER_ID=SBDA1294C8                  # SMS sender identifier
   JWT_SECRET=your-secret-jwt-key                  # Secret for JWT token signing (generated on first run if absent)
   EOF
   ```

   **Environment Variable Reference:**
   - `ANTHROPIC_API_KEY` — Required. API key from [Anthropic console](https://console.anthropic.com). Used by the LLM to make decisions when model confidence is low.
   - `SQUAD_SECRET_KEY` — Optional. Squad payment provider secret for payment initiation on approved transactions.
   - `DATABASE_URL` — Optional. Default: `sqlite:///trustlayer.db`. Can be any SQLAlchemy-compatible database URI.
   - `RESEND_API_KEY` — Optional. API key from [Resend](https://resend.com) for sending emails.
   - `SQUAD_SMS_SENDER_ID` — Optional. SMS sender ID for Squad integration.
   - `JWT_SECRET` — Optional. Secret key for signing JWT tokens. Will be auto-generated if not set.

5. **Initialize the database**
   
   The database tables are created automatically on first server start. No manual migration needed.

6. **Start the FastAPI server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   The backend will be available at `http://localhost:8000`
   - API docs: http://localhost:8000/docs (Swagger UI)
   - Health check: http://localhost:8000/health

### Frontend Setup

1. **Navigate to the frontend folder**
   ```bash
   cd ../frontend
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Configure the API URL (optional)**
   
   By default, the frontend connects to `http://localhost:8000`. To use a different backend URL, create a `.env.local` file:
   ```bash
   cat > .env.local << 'EOF'
   VITE_API_URL=http://localhost:8000
   EOF
   ```
   
   Or set it inline when running:
   ```bash
   VITE_API_URL=http://your-backend-url npm run dev
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## Running Backend and Frontend Together

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then navigate to:
- **Frontend:** http://localhost:5173
- **Backend docs:** http://localhost:8000/docs

## Testing with the Demo Scenario

TrustLayer includes a demo flow that consistently produces a **BLOCK** decision. Use this to verify your setup works end-to-end.

### Demo Scenario: Fake Electronics Listing

This scenario triggers the `fake_electronics_listing` rule preset, which flags transactions matching the pattern of a fraudster selling overpriced electronics on a new account.

**Demo Inputs:**

```json
{
  "transaction": {
    "id": "txn_demo_001",
    "amount": 50000,
    "currency": "NGN",
    "email": "buyer@demo.com",
    "timestamp": "2024-05-14T14:30:00Z",
    "payment_method": "card"
  },
  "buyer": {
    "id": "buyer_demo",
    "account_age_days": 45,
    "total_past_transactions": 3,
    "avg_transaction_amount": 30000,
    "past_dispute_count": 0
  },
  "vendor": {
    "id": "vendor_demo_fake",
    "account_age_days": 3,
    "total_completed_transactions": 0,
    "category": "electronics",
    "listing_price": 25000,
    "avg_category_price": 60000
  },
  "session": {
    "ip_country": "NG",
    "arrival_source": "organic_search",
    "time_on_page_seconds": 120,
    "device_type": "mobile"
  }
}
```

**Key Details:**
- **Vendor age:** 3 days (less than 7-day threshold)
- **Listing price:** ₦25,000 (41% below ₦60,000 category average)
- **Category:** electronics (high-risk)
- **Result:** Rule triggers with a 0.78 risk floor → **BLOCK decision**

### How to Test

#### Option A: Using the Dashboard UI

1. Go to http://localhost:5173
2. Sign up or log in
3. Click the API Key button and copy your API key
4. In a terminal, run:
   ```bash
   curl -X POST http://localhost:8000/api/v1/evaluate \
     -H "X-API-Key: your_api_key_here" \
     -H "Content-Type: application/json" \
     -d '{
       "transaction": {...},
       "buyer": {...},
       "vendor": {...},
       "session": {...}
     }'
   ```

#### Option B: Using the Swagger UI

1. Go to http://localhost:8000/docs
2. Click "Try it out" on the `POST /api/v1/evaluate` endpoint
3. Paste the demo JSON payload above
4. Click "Execute"
5. Verify the response shows `"decision": "BLOCK"`

#### Option C: Using Python

```python
import requests

url = "http://localhost:8000/api/v1/evaluate"
headers = {
    "X-API-Key": "your_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "transaction": {...},
    "buyer": {...},
    "vendor": {...},
    "session": {...}
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

**Expected Response:**
```json
{
  "transaction_id": "txn_demo_001",
  "decision": "BLOCK",
  "score": 0.78,
  "confidence": "HIGH",
  "buyer_risk_score": 0.45,
  "vendor_risk_score": 0.85,
  "primary_signal": "vendor",
  "escalated_to_llm": false,
  "rule_preset_matched": "fake_electronics_listing",
  "reasons": ["Suspicious pricing pattern on new vendor account"],
  "recommended_action": "Block transaction and warn buyer"
}
```

## Building for Production

### Backend

1. Build a Docker image (if available):
   ```bash
   docker build -t trustlayer-backend:latest .
   docker run -p 8000:8000 trustlayer-backend:latest
   ```

2. Or run directly with Uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

### Frontend

```bash
npm run build
npm run preview  # Preview the production build locally
```

The `dist/` folder contains static assets ready to deploy to any static host (Vercel, Netlify, S3, etc.).

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: No module named 'app'` | Ensure you're in the `backend/` directory when running `uvicorn` |
| `CORS error when frontend calls backend` | Check `VITE_API_URL` matches the backend URL and that CORS is enabled in `main.py` |
| `ANTHROPIC_API_KEY not found` | Add `ANTHROPIC_API_KEY` to `.env` in the `backend/` folder |
| `Can't find node_modules` | Run `npm install` in the `frontend/` folder |
| Database lock error | Delete `trustlayer.db` and restart the server to reinitialize |
| Port 8000 already in use | Run on a different port: `uvicorn main:app --port 9000` |

## Documentation

- **Backend Details:** See [backend/README.md](backend/README.md)
- **Frontend Details:** See [frontend/README.md](frontend/README.md)

## License

Proprietary — TrustLayer Inc.
