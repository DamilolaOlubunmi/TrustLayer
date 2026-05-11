
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 🔀 Toggle this to false when your backend is ready
const USE_MOCK_API = true;

// ─── Mock response data (the "Emeka Scenario" from the PRD) ──
const MOCK_BLOCK_RESPONSE = {
  transaction_id: 'txn_fm_00291',
  decision: 'BLOCK',
  score: 0.91,
  confidence: 'HIGH',
  buyer_risk_score: 0.45,
  vendor_risk_score: 0.94,
  primary_signal: 'vendor',
  escalated_to_llm: false,
  rule_preset_matched: 'fake_electronics_listing',
  reasons: [
    'Vendor account is 4 days old with zero completed transactions',
    'Listing price is 67% below category average',
    'Buyer arrived via external WhatsApp link',
  ],
  recommended_action: 'Block transaction and warn buyer',
};

const MOCK_REVIEW_RESPONSE = {
  transaction_id: 'txn_fm_00292',
  decision: 'REVIEW',
  score: 0.62,
  confidence: 'MEDIUM',
  buyer_risk_score: 0.38,
  vendor_risk_score: 0.72,
  primary_signal: 'vendor',
  escalated_to_llm: false,
  rule_preset_matched: 'new_vendor_high_value',
  reasons: [
    'Vendor has fewer than 5 completed transactions',
    'Transaction amount is significantly above buyer average',
    'Vendor account is under 14 days old',
  ],
  recommended_action: 'Request step-up verification before proceeding',
};

const MOCK_ALLOW_RESPONSE = {
  transaction_id: 'txn_fm_00293',
  decision: 'ALLOW',
  score: 0.12,
  confidence: 'HIGH',
  buyer_risk_score: 0.10,
  vendor_risk_score: 0.15,
  primary_signal: 'buyer',
  escalated_to_llm: false,
  rule_preset_matched: null,
  reasons: [
    'Vendor has a strong completion history',
    'Transaction amount is within normal range for this buyer',
    'Buyer account has no dispute history',
  ],
  recommended_action: 'Allow transaction to proceed normally',
};

// ─── Simulate latency so the loading state is visible ────────
const mockDelay = (ms = 1200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ─── Smart mock: pick response based on inputs ───────────────
const getMockResponse = (payload) => {
  const vendorAge = payload?.vendor?.account_age_days ?? 30;
  const amount = payload?.transaction?.amount ?? 0;

  // The "Emeka Scenario" from the PRD: 4-day vendor + large amount
  if (vendorAge <= 5 && amount >= 200000) return MOCK_BLOCK_RESPONSE;
  // Medium risk scenario
  if (vendorAge <= 14 && amount >= 100000) return MOCK_REVIEW_RESPONSE;
  // Safe transaction
  return MOCK_ALLOW_RESPONSE;
};

// ─── Public API ───────────────────────────────────────────────

/**
 * Evaluate a transaction for fraud risk.
 * @param {object} payload - The full /evaluate request body
 * @returns {Promise<object>} - The TrustLayer decision response
 */
export const evaluateTransaction = async (payload) => {
  if (USE_MOCK_API) {
    await mockDelay(1400);
    return getMockResponse(payload);
  }

  const res = await axios.post(`${BASE_URL}/evaluate`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

/**
 * Submit feedback on a transaction outcome.
 * @param {object} payload - { transaction_id, outcome, report_type, reported_by }
 */
export const submitFeedback = async (payload) => {
  if (USE_MOCK_API) {
    await mockDelay(600);
    return { status: 'recorded', transaction_id: payload.transaction_id };
  }

  const res = await axios.post(`${BASE_URL}/feedback`, payload);
  return res.data;
};

/**
 * Fetch recent transactions for the dashboard.
 */
export const getTransactions = async () => {
  if (USE_MOCK_API) {
    await mockDelay(800);
    return {
      stats: {
        total: 247,
        blocked: 18,
        reviewed: 31,
        allowed: 198,
        total_value_protected_ngn: 4200000,
      },
      transactions: [],
    };
  }

  const res = await axios.get(`${BASE_URL}/transactions`);
  return res.data;
};