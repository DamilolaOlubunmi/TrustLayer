# TrustLayer

A comprehensive fraud detection system that uses machine learning to identify suspicious transactions and protect both buyers and vendors in digital marketplaces.

## Overview

TrustLayer is an intelligent transaction verification platform that leverages dual-model machine learning to detect fraud from both buyer and vendor perspectives. The system analyzes transaction patterns, user behavior, and historical data to provide real-time fraud risk assessments.

## Features

- **Dual-Model Architecture**: Separate XGBoost classifiers for buyer-side and vendor-side fraud detection
- **Comprehensive Feature Engineering**: 10+ buyer features and 7+ vendor features for robust fraud signals
- **Real-Time Risk Scoring**: Instant fraud risk assessment for incoming transactions
- **Historical Analysis**: Integration with transaction database for pattern learning
- **SHAP Explainability**: Model interpretation and feature importance analysis
- **RESTful API**: Backend API for transaction processing and risk assessment
- **Interactive Dashboard**: Frontend UI for monitoring transactions and fraud alerts

## Architecture

```
TrustLayer/
├── backend/                 # Python Flask/FastAPI backend
│   ├── database.py          # SQLite database operations
│   ├── llm.py               # LLM integration module
│   ├── main.py              # Application entry point
│   ├── models.py            # Data models and schemas
│   ├── pipeline.py          # Transaction processing pipeline
│   ├── rules.py             # Business rules engine
│   └── ml/                  # Machine learning modules
│       ├── features.py      # Feature engineering
│       ├── shap_explain.py  # SHAP explainability
│       ├── train_buyer.py   # Buyer model training
│       └── train_vendor.py  # Vendor model training
├── frontend/                # React/Vue frontend
│   └── src/
│       ├── main.jsx         # Main entry point
│       ├── api.js           # API client
│       ├── components/      # Reusable UI components
│       │   ├── DecisionCard.jsx
│       │   ├── DemoWidgets.jsx
│       │   └── TxnTable.jsx
│       └── pages/           # Application pages
│           ├── Dashboard.jsx
│           └── Landing.jsx
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Installation

### Prerequisites

- Python 3.8+
- Node.js 14+
- SQLite3

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TrustLayer
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the database**
   ```bash
   python backend/database.py
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Usage

### Training Models

#### Train Buyer Fraud Detection Model
```bash
cd backend/ml
python train_buyer.py
```

#### Train Vendor Fraud Detection Model
```bash
python train_vendor.py
```

### Running the Backend Server

```bash
python backend/main.py
```

The server will start on `http://localhost:5000` (or configured port).

### Transaction Analysis

The system processes transactions through the following pipeline:

1. **Data Ingestion**: Transaction data is received via API
2. **Feature Engineering**: Buyer and vendor features are extracted
3. **Risk Scoring**: Both models independently evaluate fraud risk
4. **Decision Making**: Combined risk assessment drives final decision
5. **Logging**: Results are stored for future model training

## Machine Learning Models

### Model A: Buyer Fraud Detection

**Purpose**: Identify transactions initiated by fraudulent buyers

**Features**:
- `amount_deviation_ratio` - Transaction amount vs buyer's average
- `buyer_account_age_days` - Account tenure
- `buyer_total_past_txns` - Transaction history
- `is_first_transaction` - First-time buyer flag
- `buyer_dispute_count` - Historical disputes
- `time_of_day_risk` - Off-hours purchase risk
- `arrival_source_risk` - Traffic source (direct vs external)
- `session_duration_flag` - Time spent before purchase
- `is_mobile` - Device type
- `category_risk_score` - High-risk product categories

**Model Type**: XGBoost Classifier  
**Training Split**: 80/20 train-test with stratification

### Model B: Vendor Fraud Detection

**Purpose**: Identify transactions from suspicious vendors

**Features**:
- `vendor_account_age_days` - Vendor account tenure
- `vendor_completion_rate` - Historical completion rate
- `listing_price_ratio` - Price vs category average
- `vendor_tx_velocity` - Transaction frequency (last 24h)
- `vendor_fraud_flags` - Flagged fraud indicators
- `category_risk_score` - High-risk vendor categories
- `has_completed_any_txn` - Completion history

**Model Type**: XGBoost Classifier  
**Training Split**: 80/20 train-test with stratification

## API Endpoints

### Transaction Assessment
```
POST /api/assess-transaction
Content-Type: application/json

{
  "transaction": {
    "id": "txn_123",
    "amount": 150.00,
    "timestamp": "2026-05-14T10:30:00Z"
  },
  "buyer": {
    "id": "buyer_456",
    "account_age_days": 180
  },
  "vendor": {
    "id": "vendor_789",
    "account_age_days": 365,
    "category": "electronics"
  },
  "session": {
    "arrival_source": "direct",
    "time_on_page_seconds": 45,
    "device_fingerprint": "mobile_device"
  },
  "buyer_profile": {
    "avg_transaction_amount": 120.00,
    "total_past_transactions": 25,
    "past_dispute_count": 0
  },
  "vendor_profile": {
    "total_completed_transactions": 500,
    "total_transactions": 525,
    "category_avg_price": 140.00,
    "tx_last_24h": 5,
    "fraud_flags": 0
  }
}

Response:
{
  "transaction_id": "txn_123",
  "buyer_risk_score": 0.23,
  "vendor_risk_score": 0.15,
  "combined_risk_score": 0.19,
  "recommendation": "APPROVE",
  "buyer_explanation": "Low risk - established buyer with clean history",
  "vendor_explanation": "Trusted vendor with high completion rate"
}
```

## Database Schema

### transactions table
- `id` - Primary key
- `transaction_id` - Unique transaction identifier
- `amount` - Transaction amount
- `timestamp` - Transaction timestamp
- `buyer_id`, `buyer_account_age_days` - Buyer information
- `vendor_id`, `vendor_account_age_days`, `vendor_category` - Vendor information
- `arrival_source`, `time_on_page_seconds`, `device_fingerprint` - Session data
- `avg_transaction_amount`, `total_past_transactions`, `past_dispute_count` - Buyer profile
- `label` - Ground truth (0=legitimate, 1=fraudulent)

## Configuration

Key configuration files:
- `backend/models.py` - Data schemas and validation
- `backend/rules.py` - Business rules for decision making
- `backend/pipeline.py` - Transaction processing pipeline

## Monitoring & Explainability

The system includes SHAP (SHapley Additive exPlanations) integration for model interpretability:

```bash
python backend/ml/shap_explain.py
```

This generates feature importance scores and individual prediction explanations for transparency and debugging.

## Development

### Project Structure
- **Backend**: Python with Flask/FastAPI
- **Frontend**: React/Vue.js
- **ML Framework**: XGBoost
- **Database**: SQLite
- **Explainability**: SHAP

### Running Tests

```bash
pytest backend/tests/
```

### Code Quality

Install development dependencies:
```bash
pip install -r requirements.txt
```

## Performance Metrics

Model evaluation includes:
- **Accuracy** - Overall correct predictions
- **Precision** - True positive rate among predicted frauds
- **Recall** - Detection rate of actual frauds
- **F1 Score** - Harmonic mean for balanced evaluation
- **Training Time** - Model training duration

## Troubleshooting

### Models not found
Ensure models are trained before starting the server:
```bash
cd backend/ml
python train_buyer.py
python train_vendor.py
```

### Database connection errors
Verify SQLite database exists:
```bash
python backend/database.py
```

### API errors
Check request payload matches schema in `backend/models.py`

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## Future Enhancements

- [ ] Real-time model retraining pipeline
- [ ] Advanced anomaly detection algorithms
- [ ] Multi-factor authentication integration
- [ ] Distributed processing for high-volume transactions
- [ ] Advanced SHAP visualizations
- [ ] Webhook notifications for fraud alerts
- [ ] Historical trend analysis dashboard

## License

[Specify your license here]

## Support

For issues, questions, or contributions, please contact the development team or open an issue in the repository.

---

**Last Updated**: May 2026
