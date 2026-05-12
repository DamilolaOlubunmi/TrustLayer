# TrustLayer Frontend

> "Decides whether money should move before it actually does."

TrustLayer is an AI-powered pre-transaction risk control platform built for Nigerian and West African payment ecosystems. The frontend provides both a public-facing landing page and a merchant dashboard for visualising transaction risk analysis, fraud signals, AI explanations, and platform analytics.

This frontend was developed for the Squad Hackathon 2026 under the theme:

**Smart Systems: The Intelligent Economy**

The platform evaluates transactions before money moves by combining:
- Dual XGBoost ML models
- SHAP explainability
- Nigeria-specific fraud rules
- LLM-assisted reasoning
- Real-time transaction risk scoring

---

# Product Overview

Traditional payment gateways verify whether a payment is technically valid.

TrustLayer goes further by asking:

> "Should this transaction happen at all?"

The system sits between a platform's checkout flow and the payment processor. Before a payment is executed, TrustLayer evaluates both buyer and vendor risk signals and returns one of three decisions:

- **ALLOW** → Payment proceeds
- **REVIEW** → Additional verification required
- **BLOCK** → Transaction stopped before payment execution

The frontend visualises these decisions in real time through interactive dashboards and live evaluation widgets.

---

# System Design Overview

## Architecture

The TrustLayer MVP architecture consists of:

```text
Frontend (React + Vite + Tailwind)
        ↓
FastAPI Backend API
        ↓
ML Inference Pipeline
 ├── Buyer Risk Model (XGBoost)
 ├── Vendor Risk Model (XGBoost)
 ├── SHAP Explainability
 ├── LLM Reasoning Layer
 └── Nigeria Fraud Rule Engine
        ↓
SQLite / PostgreSQL Storage
```

## Core Components

| Component | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend API | FastAPI |
| ML Models | XGBoost |
| Explainability | SHAP |
| AI Reasoning | Anthropic Claude API |
| Database | SQLite / PostgreSQL |
| Charts | Recharts |
| HTTP Requests | Axios |

---

# Frontend Dashboard

A modern React-based frontend dashboard built with Vite for monitoring transactions, flagged activities, analytics, and platform feedback.

This project includes:
- A landing page for product introduction
- Interactive dashboard pages
- Transaction monitoring interface
- Flagged activity tracking
- Feedback management
- Settings management
- Reusable UI components and charts

---

# Tech Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Recharts
- Axios
- Lucide React Icons

---

# Project Structure

```bash
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── data/
│   ├── pages/
│   ├── App.jsx
│   ├── api.js
│   ├── main.jsx
│   ├── index.css
│   └── dashboard.css
├── package.json
├── vite.config.js
└── README.md
```

---

# Features

## Public Landing Page

The landing page introduces TrustLayer to developers and judges.

Features include:
- Hero section with product pitch
- Fraud statistics and Nigerian market context
- How-it-works transaction flow
- Integration overview
- Live API demo widget
- Platform analytics stats
- Developer-focused call-to-actions

## Live Demo Widget

The live demo widget allows users to simulate a transaction risk evaluation.

Users can input:
- Transaction amount
- Vendor account age
- Buyer spending behaviour
- Listing price
- Arrival source
- Vendor transaction history

The frontend sends this payload to the `/evaluate` endpoint and displays:
- Risk decision
- Confidence level
- Buyer risk score
- Vendor risk score
- Risk preset matched
- AI-generated explanations
- Recommended action

## Merchant Dashboard

## Landing Page
- Product introduction
- Hero section
- Platform statistics
- Features overview
- Integration showcase
- Call-to-action sections

## Dashboard
- Transaction overview
- Decision analytics
- Charts and statistics
- Activity monitoring
- Merchant dashboard interface

## Transactions Page
- Transaction table display
- Monitoring and tracking
- Transaction analytics

## Flagged Activities
- Suspicious transaction tracking
- Fraud/flagged activity overview
- Status indicators

## Feedback System
- User or merchant feedback management
- Dashboard integration

## Settings
- Dashboard customization options
- User configuration interface

---

# Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Move into the project folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

# Running the Project

Start the development server:

```bash
npm run dev
```

The application will run on:

```bash
http://localhost:5173
```

---

# Build for Production

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

# Routing

| Route | Description |
|---|---|
| `/` | Landing page |
| `/dashboard` | Main dashboard |

Dashboard navigation includes:
- Overview
- Transactions
- Flagged
- Feedback
- Settings

---

# UI Components

Reusable components include:

- Sidebar
- Topbar
- Stat Cards
- Decision Charts
- Decision Badges
- Transaction Tables

---

# Styling

The project uses:

- Tailwind CSS
- Custom dashboard CSS
- Responsive layouts
- Modern component-based UI design

---

# API Integration

## POST `/evaluate`

Evaluates a transaction before payment execution.

### Example Response

```json
{
  "transaction_id": "txn_abc123",
  "decision": "BLOCK",
  "score": 0.91,
  "confidence": "HIGH",
  "buyer_risk_score": 0.45,
  "vendor_risk_score": 0.94,
  "primary_signal": "vendor",
  "escalated_to_llm": false,
  "rule_preset_matched": "fake_electronics_listing",
  "reasons": [
    "Vendor account is 4 days old with zero completed transactions",
    "Listing price is 67% below category average",
    "Buyer arrived via external WhatsApp link"
  ],
  "recommended_action": "Block transaction and warn buyer"
}
```

## GET `/transactions`

Returns transaction history and dashboard statistics.

## POST `/feedback`

Stores transaction outcomes for continuous learning and future model retraining.

---

# Fraud Detection Logic

TrustLayer combines:

- Buyer-side risk analysis
- Vendor-side risk analysis
- Rule-based fraud detection
- AI reasoning
- Explainable ML outputs

## Nigeria-Specific Fraud Presets

Examples include:

- Fake electronics listings
- WhatsApp funnel scams
- Advance-fee fraud patterns
- New high-value vendor attacks

## Decision Thresholds

| Score Range | Decision |
|---|---|
| 0.00 – 0.30 | ALLOW |
| 0.31 – 0.65 | REVIEW |
| 0.66 – 1.00 | BLOCK |

---

# Future Improvements

Potential enhancements:

- Authentication system
- Real backend API integration
- Real-time transaction updates
- Notifications system
- Advanced analytics
- Dark mode support
- Export reports functionality

---

# Author

Developed as part of a modern dashboard and analytics frontend project using React and Vite.

