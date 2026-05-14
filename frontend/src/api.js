
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ACCESS_TOKEN_KEY = 'trustlayer_access_token';
const API_KEY_KEY = 'trustlayer_api_key';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const computeStats = (transactions) => {
  const total = transactions.length;
  const blocked = transactions.filter((tx) => tx.decision === 'BLOCK').length;
  const reviewed = transactions.filter((tx) => tx.decision === 'REVIEW').length;
  const allowed = transactions.filter((tx) => tx.decision === 'ALLOW').length;
  const totalValueProtected = transactions
    .filter((tx) => tx.decision !== 'ALLOW')
    .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

  return {
    total,
    blocked,
    reviewed,
    allowed,
    total_value_protected_ngn: totalValueProtected,
  };
};

export const normalizeTransaction = (record = {}) => {
  const source = record.transaction ?? record;
  const buyer = record.buyer ?? source.buyer ?? {};
  const vendor = record.vendor ?? source.vendor ?? {};
  const session = record.session ?? source.session ?? {};
  const reviewToken = source.review_token ?? record.review_token ?? null;
  const reviewExpiresAt = source.review_expires_at ?? record.review_expires_at ?? null;

  return {
    id: source.id ?? source.transaction_id ?? record.id ?? record.transaction_id ?? '',
    amount: toNumber(source.amount ?? record.amount),
    currency: source.currency ?? record.currency ?? 'NGN',
    timestamp: source.timestamp ?? source.created_at ?? record.timestamp ?? record.created_at ?? new Date().toISOString(),
    payment_method: source.payment_method ?? record.payment_method ?? null,
    decision: source.decision ?? record.decision ?? 'REVIEW',
    score: toNumber(source.score ?? source.final_score ?? record.score ?? record.final_score),
    confidence: source.confidence ?? record.confidence ?? 'MEDIUM',
    buyer_risk_score: toNumber(source.buyer_risk_score ?? source.buyer_score ?? record.buyer_risk_score ?? record.buyer_score),
    vendor_risk_score: toNumber(source.vendor_risk_score ?? source.vendor_score ?? record.vendor_risk_score ?? record.vendor_score),
    primary_signal: source.primary_signal ?? record.primary_signal ?? null,
    escalated_to_llm: Boolean(source.escalated_to_llm ?? record.escalated_to_llm ?? false),
    rule_preset_matched: source.rule_preset_matched ?? record.rule_preset_matched ?? null,
    buyer: {
      id: buyer.id ?? source.buyer_id ?? record.buyer_id ?? '',
      account_age_days: toNumber(buyer.account_age_days ?? source.buyer_account_age_days ?? record.buyer_account_age_days),
      total_past_transactions: buyer.total_past_transactions ?? buyer.total_past_txns ?? null,
      avg_transaction_amount: buyer.avg_transaction_amount ?? buyer.avg_amount ?? null,
      past_dispute_count: buyer.past_dispute_count ?? buyer.dispute_count ?? null,
    },
    vendor: {
      id: vendor.id ?? source.vendor_id ?? record.vendor_id ?? '',
      account_age_days: toNumber(vendor.account_age_days ?? source.vendor_account_age_days ?? record.vendor_account_age_days),
      total_completed_transactions: vendor.total_completed_transactions ?? vendor.completed_transactions ?? null,
      category: vendor.category ?? source.vendor_category ?? record.vendor_category ?? null,
      listing_price: vendor.listing_price ?? source.listing_price ?? record.listing_price ?? null,
      avg_category_price: vendor.avg_category_price ?? source.avg_category_price ?? record.avg_category_price ?? null,
    },
    session: {
      ...session,
      arrival_source: session.arrival_source ?? source.arrival_source ?? null,
      time_on_page_seconds: session.time_on_page_seconds ?? source.time_on_page_seconds ?? null,
    },
    shap_signals: source.shap_signals ?? record.shap_signals ?? [],
    reasons: source.reasons ?? record.reasons ?? [],
    recommended_action: source.recommended_action ?? record.recommended_action ?? '',
    squad_status: source.squad_status ?? record.squad_status ?? null,
    review_token: reviewToken,
    review_expires_at: reviewExpiresAt,
  };
};

export const normalizeTransactionsResponse = (response = {}) => {
  const transactions = Array.isArray(response.transactions)
    ? response.transactions.map(normalizeTransaction)
    : [];

  return {
    stats: response.stats ?? response.stat ?? computeStats(transactions),
    transactions,
  };
};

export const loginRequest = async (payload) => {
  const response = await apiClient.post('/api/login', payload);
  return response.data;
};

export const signupRequest = async (payload) => {
  const response = await apiClient.post('/api/signup', payload);
  return response.data;
};

export const getCurrentProfile = async () => {
  const response = await apiClient.get('/api/profile');
  return response.data;
};

export const updateProfileRequest = async (payload) => {
  const response = await apiClient.put('/api/profile', payload);
  return response.data;
};

export const changePasswordRequest = async (payload) => {
  const response = await apiClient.post('/api/profile/change-password', payload);
  return response.data;
};

export const getApiKeyRequest = async () => {
  const response = await apiClient.get('/api/api-key');
  return response.data;
};

export const regenerateApiKeyRequest = async () => {
  const response = await apiClient.post('/api/profile/regenerate-api-key');
  return response.data;
};

export const updateSquadSecretRequest = async (payload) => {
  const response = await apiClient.put('/api/profile/squad-secret', payload);
  return response.data;
};

export const getSettingsRequest = async () => {
  const response = await apiClient.get('/api/settings');
  return response.data;
};

export const updateSettingsRequest = async (payload) => {
  const response = await apiClient.patch('/api/settings', payload);
  return response.data;
};

export const getTransactionsRequest = async (params = {}) => {
  const response = await apiClient.get('/api/v1/transactions', { params });
  return normalizeTransactionsResponse(response.data);
};

export const getTransactionRequest = async (transactionId) => {
  const response = await apiClient.get(`/api/v1/transactions/${transactionId}`);
  return normalizeTransaction(response.data);
};

export const submitFeedbackRequest = async (payload) => {
  const response = await apiClient.post('/api/v1/feedback', payload);
  return response.data;
};

export const evaluateTransactionRequest = async (payload, apiKey = localStorage.getItem(API_KEY_KEY)) => {
  const headers = apiKey ? { 'X-API-Key': apiKey } : {};
  const response = await axios.post(`${BASE_URL}/api/v1/evaluate`, payload, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  return response.data;
};

const reviewActionRequest = async (token, action, apiKey = localStorage.getItem(API_KEY_KEY)) => {
  const headers = apiKey ? { 'X-API-Key': apiKey } : {};
  const response = await axios.post(`${BASE_URL}/api/review/${token}/${action}`, null, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  return response.data;
};

export const allowReviewRequest = (token, apiKey) => reviewActionRequest(token, 'allow', apiKey);
export const blockReviewRequest = (token, apiKey) => reviewActionRequest(token, 'block', apiKey);

export const evaluateTransaction = evaluateTransactionRequest;
export const submitFeedback = submitFeedbackRequest;
export const getTransactions = getTransactionsRequest;

export const storageKeys = {
  accessToken: ACCESS_TOKEN_KEY,
  apiKey: API_KEY_KEY,
};
