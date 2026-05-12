// Mock data — mirrors TrustLayer API response shapes from the PRD/System Design

export const STATS = {
  transactionsEvaluated: 1247,
  transactionsBlocked: 89,
  flaggedForReview: 134,
  valueProtected: 18400000,   // in kobo → display as ₦18.4M
  trend: "+12%",
};

export const DECISION_BREAKDOWN = {
  allow:  { count: 1024, pct: 82 },
  review: { count: 134,  pct: 11 },
  block:  { count: 89,   pct: 7  },
};

export const TOP_RISK_SIGNALS = [
  { name: "account_age_days",   count: 47, icon: "clock"   },
  { name: "price_ratio",        count: 38, icon: "tag"      },
  { name: "source_risk",        count: 29, icon: "shield"   },
  { name: "deviation_ratio",    count: 21, icon: "activity" },
];

export const RECENT_TRANSACTIONS = [
  {
    id: "txn_fm_00291",
    amount: 125000,
    decision: "BLOCK",
    score: 0.91,
    signal: "source_risk",
    time: "2m ago",
    buyerScore: 0.45,
    vendorScore: 0.94,
    preset: "fake_electronics_listing",
    reasons: [
      "Vendor account is 4 days old with zero completed transactions",
      "Listing price is 67% below category average",
      "Buyer arrived via external WhatsApp link",
    ],
  },
  {
    id: "txn_fm_00290",
    amount: 14500,
    decision: "ALLOW",
    score: 0.12,
    signal: null,
    time: "5m ago",
    buyerScore: 0.10,
    vendorScore: 0.13,
    preset: null,
    reasons: ["No significant risk signals detected"],
  },
  {
    id: "txn_fm_00289",
    amount: 89000,
    decision: "REVIEW",
    score: 0.58,
    signal: "deviation_ratio",
    time: "12m ago",
    buyerScore: 0.52,
    vendorScore: 0.61,
    preset: null,
    reasons: [
      "Transaction amount is 3.6× buyer's average spend",
      "Vendor has fewer than 5 completed transactions",
    ],
  },
  {
    id: "txn_fm_00288",
    amount: 5200,
    decision: "ALLOW",
    score: 0.09,
    signal: null,
    time: "15m ago",
    buyerScore: 0.08,
    vendorScore: 0.10,
    preset: null,
    reasons: ["Low risk — established buyer and vendor profiles"],
  },
  {
    id: "txn_fm_00287",
    amount: 340000,
    decision: "BLOCK",
    score: 0.87,
    signal: "account_age_days",
    time: "22m ago",
    buyerScore: 0.31,
    vendorScore: 0.96,
    preset: "new_vendor_high_value",
    reasons: [
      "Vendor account created 6 days ago — no prior activity",
      "High-value transaction with an unverified vendor",
      "Advance-fee pattern detected across recent transactions",
    ],
  },
  {
    id: "txn_fm_00286",
    amount: 21000,
    decision: "ALLOW",
    score: 0.21,
    signal: "price_ratio",
    time: "28m ago",
    buyerScore: 0.19,
    vendorScore: 0.23,
    preset: null,
    reasons: ["Minor price deviation within acceptable range"],
  },
  {
    id: "txn_fm_00285",
    amount: 67500,
    decision: "REVIEW",
    score: 0.63,
    signal: "account_age_days",
    time: "35m ago",
    buyerScore: 0.41,
    vendorScore: 0.72,
    preset: "whatsapp_funnel_attack",
    reasons: [
      "Buyer arrived via WhatsApp link with less than 15 seconds on page",
      "Vendor is 22 days old — limited transaction history",
    ],
  },
  {
    id: "txn_fm_00284",
    amount: 9800,
    decision: "ALLOW",
    score: 0.07,
    signal: null,
    time: "41m ago",
    buyerScore: 0.06,
    vendorScore: 0.08,
    preset: null,
    reasons: ["Trusted buyer and vendor — no risk signals"],
  },
  {
    id: "txn_fm_00283",
    amount: 285000,
    decision: "BLOCK",
    score: 0.93,
    signal: "price_ratio",
    time: "55m ago",
    buyerScore: 0.38,
    vendorScore: 0.97,
    preset: "fake_electronics_listing",
    reasons: [
      "Listing price is 71% below electronics category average",
      "Vendor has zero completed transactions",
      "Late-night transaction from unverified vendor",
    ],
  },
  {
    id: "txn_fm_00282",
    amount: 44000,
    decision: "ALLOW",
    score: 0.18,
    signal: null,
    time: "1h ago",
    buyerScore: 0.17,
    vendorScore: 0.19,
    preset: null,
    reasons: ["Established vendor profile — moderate buyer history"],
  },
];

// Chart data — decision distribution over 7 days
export const DECISION_CHART_DATA = [
  { day: "Mon", allow: 148, review: 19, block: 11 },
  { day: "Tue", allow: 162, review: 24, block: 14 },
  { day: "Wed", allow: 131, review: 18, block: 8  },
  { day: "Thu", allow: 189, review: 31, block: 20 },
  { day: "Fri", allow: 175, review: 22, block: 15 },
  { day: "Sat", allow: 112, review: 10, block: 9  },
  { day: "Sun", allow: 107, review: 10, block: 12 },
];

// Flagged items (for Flagged page)
export const FLAGGED_TRANSACTIONS = RECENT_TRANSACTIONS.filter(
  (t) => t.decision === "BLOCK" || t.decision === "REVIEW"
);

// Feedback queue
export const FEEDBACK_QUEUE = [
  { id: "txn_fm_00291", amount: 125000, decision: "BLOCK", outcome: null, time: "2m ago" },
  { id: "txn_fm_00287", amount: 340000, decision: "BLOCK", outcome: null, time: "22m ago" },
  { id: "txn_fm_00289", amount: 89000,  decision: "REVIEW", outcome: null, time: "12m ago" },
  { id: "txn_fm_00285", amount: 67500,  decision: "REVIEW", outcome: null, time: "35m ago" },
  { id: "txn_fm_00283", amount: 285000, decision: "BLOCK", outcome: null, time: "55m ago" },
];
