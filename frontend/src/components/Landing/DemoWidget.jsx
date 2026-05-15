import { useState } from 'react';
import { ArrowRight, Loader2, TrendingDown, TrendingUp, Minus, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { evaluateTransaction, submitFeedback } from '../../api';
import DecisionCard from './DecisionCard';

// ─── Preset scenarios wired to the api.js mock thresholds ────
const SCENARIOS = [
  {
    id: 'emeka',
    label: '🚨 Emeka (Fraud)',
    description: 'Classic fake electronics listing',
    expectedOutcome: 'BLOCK',
    values: {
      amount: '280000',
      vendorAge: '4',
      buyerAvgSpend: '24500',
      vendorCompletedTxns: '0',
      listingPrice: '280000',
      avgCategoryPrice: '847000',
      arrivalSource: 'whatsapp_link',
    },
  },
  {
    id: 'review',
    label: '⚠️ New Vendor',
    description: 'High-value order, unproven seller',
    expectedOutcome: 'REVIEW',
    values: {
      amount: '120000',
      vendorAge: '10',
      buyerAvgSpend: '30000',
      vendorCompletedTxns: '3',
      listingPrice: '120000',
      avgCategoryPrice: '135000',
      arrivalSource: 'external_link',
    },
  },
  {
    id: 'allow',
    label: '✅ Trusted Seller',
    description: 'Established vendor, normal spend',
    expectedOutcome: 'ALLOW',
    values: {
      amount: '45000',
      vendorAge: '180',
      buyerAvgSpend: '40000',
      vendorCompletedTxns: '94',
      listingPrice: '45000',
      avgCategoryPrice: '48000',
      arrivalSource: 'organic',
    },
  },
];

const ARRIVAL_SOURCE_OPTIONS = [
  { value: 'organic',       label: 'Organic / Direct' },
  { value: 'external_link', label: 'External Link' },
  { value: 'whatsapp_link', label: 'WhatsApp Link (suspicious)' },
  { value: 'social_ad',     label: 'Social Media Ad' },
];

const formatAmount = (val) => {
  const digits = val.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

function getPriceComparison(listingPrice, avgCategoryPrice) {
  const listing = parseInt(listingPrice, 10);
  const avg     = parseInt(avgCategoryPrice, 10);
  if (!listing || !avg || avg === 0) return null;
  const diff    = Math.round((1 - listing / avg) * 100);
  const absDiff = Math.abs(diff);
  if (diff > 5)  return { pct: absDiff, label: `${absDiff}% below market average`, severity: diff >= 30 ? 'high' : 'medium', direction: 'below' };
  if (diff < -5) return { pct: absDiff, label: `${absDiff}% above market average`, severity: 'low', direction: 'above' };
  return { pct: 0, label: 'At market average', severity: 'low', direction: 'at' };
}

// ─── Mirror api.js getMockResponse logic for live hint ───────
function getLiveOutcome(form) {
  const vendorAge = parseInt(form.vendorAge, 10) || 0;
  const amount    = parseInt(form.amount.replace(/,/g, ''), 10) || 0;
  if (vendorAge <= 5  && amount >= 200000) return 'BLOCK';
  if (vendorAge <= 14 && amount >= 100000) return 'REVIEW';
  return 'ALLOW';
}

const outcomeHintConfig = {
  BLOCK:  { pill: 'bg-red-50 border-red-200 text-red-700',     dot: 'bg-red-500',     label: 'Likely BLOCK'  },
  REVIEW: { pill: 'bg-amber-50 border-amber-200 text-amber-700', dot: 'bg-amber-400', label: 'Likely REVIEW' },
  ALLOW:  { pill: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500', label: 'Likely ALLOW' },
};

const severityStyles = {
  high:   'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  low:    'bg-emerald-50 border-emerald-200 text-emerald-700',
};

export default function DemoWidget() {
  const [form, setForm]               = useState(SCENARIOS[0].values);
  const [activeScenario, setActiveScenario] = useState('emeka');
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [feedback, setFeedback]       = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const priceComparison = getPriceComparison(form.listingPrice, form.avgCategoryPrice);
  const liveOutcome     = getLiveOutcome(form);
  const outcomeHint     = outcomeHintConfig[liveOutcome];

  const SeverityIcon = priceComparison?.direction === 'below'
    ? TrendingDown
    : priceComparison?.direction === 'above'
    ? TrendingUp
    : Minus;

  const handleScenario = (scenario) => {
    setActiveScenario(scenario.id);
    setForm(scenario.values);
    setResult(null);
    setError(null);
    setFeedback(null);
    setFeedbackSent(false);
  };

  const handleChange = (field, value) => {
    setActiveScenario(null);
    setForm((prev) => ({ ...prev, [field]: value }));
    setResult(null);
    setFeedback(null);
    setFeedbackSent(false);
  };

  const buildPayload = () => ({
    transaction: {
      id: `txn_demo_${Date.now()}`,
      amount: parseInt(form.amount.replace(/,/g, ''), 10) || 0,
      currency: 'NGN',
      email: 'user@demo.ng',
      timestamp: new Date().toISOString(),
      payment_method: 'card',
    },
    buyer: {
      id: 'usr_demo_buyer',
      account_age_days: 187,
      total_past_transactions: 6,
      avg_transaction_amount: parseInt(form.buyerAvgSpend.replace(/,/g, ''), 10) || 0,
      past_dispute_count: 0,
    },
    vendor: {
      id: 'vnd_demo_vendor',
      account_age_days: parseInt(form.vendorAge, 10) || 0,
      total_completed_transactions: parseInt(form.vendorCompletedTxns, 10) || 0,
      category: 'electronics',
      listing_price: parseInt(form.listingPrice.replace(/,/g, ''), 10) || 0,
      avg_category_price: parseInt(form.avgCategoryPrice.replace(/,/g, ''), 10) || 0,
    },
    session: {
      arrival_source: form.arrivalSource,
      time_on_page_seconds: 9,
      device_type: 'mobile',
    },
  });

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setFeedback(null);
    setFeedbackSent(false);
    try {
      const response = await evaluateTransaction(buildPayload());
      setResult(response);
    } catch (err) {
      setError('Could not reach the TrustLayer API. Make sure your backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (type) => {
    setFeedback(type);
    try {
      await submitFeedback({
        transaction_id: result.transaction_id,
        outcome: type === 'correct' ? 'confirmed' : 'disputed',
        report_type: type === 'incorrect' ? 'false_positive' : null,
        reported_by: 'demo_user',
      });
    } catch (e) {
      console.error('Feedback error', e);
    } finally {
      setFeedbackSent(true);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setFeedback(null);
    setFeedbackSent(false);
  };

  return (
    <div className="space-y-5">

      {/* ── Scenario Presets ──────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2.5">
          Try a scenario
        </p>
        <div className="grid grid-cols-3 gap-2">
          {SCENARIOS.map((s) => {
            const hint     = outcomeHintConfig[s.expectedOutcome];
            const isActive = activeScenario === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleScenario(s)}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-400 bg-blue-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <p className={`text-xs font-semibold mb-0.5 ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
                  {s.label}
                </p>
                <p className="text-[10px] text-slate-400 mb-1.5 leading-snug">{s.description}</p>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${hint.pill}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hint.dot}`} />
                  {s.expectedOutcome}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form + Result grid ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Left: Form ────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">

          {/* Transaction Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Transaction Amount (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₦</span>
              <input
                type="text"
                value={formatAmount(form.amount)}
                onChange={(e) => handleChange('amount', e.target.value.replace(/,/g, ''))}
                placeholder="280,000"
                className="w-full border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>
          </div>

          {/* Vendor Age + Completed Txns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Vendor Age (days)
              </label>
              <input
                type="number"
                min="0"
                value={form.vendorAge}
                onChange={(e) => handleChange('vendorAge', e.target.value)}
                placeholder="4"
                className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Vendor Completed Txns
              </label>
              <input
                type="number"
                min="0"
                value={form.vendorCompletedTxns}
                onChange={(e) => handleChange('vendorCompletedTxns', e.target.value)}
                placeholder="0"
                className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>
          </div>

          {/* Buyer Average Spend */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Buyer's Average Spend (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">₦</span>
              <input
                type="text"
                value={formatAmount(form.buyerAvgSpend)}
                onChange={(e) => handleChange('buyerAvgSpend', e.target.value.replace(/,/g, ''))}
                placeholder="24,500"
                className="w-full border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>
          </div>

          {/* Listing Price vs Category Average */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Listing Price vs Market
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <p className="text-[10px] text-slate-400 mb-1 font-medium">Listing price</p>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₦</span>
                  <input
                    type="text"
                    value={formatAmount(form.listingPrice)}
                    onChange={(e) => handleChange('listingPrice', e.target.value.replace(/,/g, ''))}
                    placeholder="280,000"
                    className="w-full border border-slate-200 rounded-lg py-2 pl-6 pr-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 mb-1 font-medium">Category average</p>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₦</span>
                  <input
                    type="text"
                    value={formatAmount(form.avgCategoryPrice)}
                    onChange={(e) => handleChange('avgCategoryPrice', e.target.value.replace(/,/g, ''))}
                    placeholder="847,000"
                    className="w-full border border-slate-200 rounded-lg py-2 pl-6 pr-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Price comparison pill */}
            {priceComparison ? (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${severityStyles[priceComparison.severity]}`}>
                <SeverityIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{priceComparison.label}</span>
                {priceComparison.severity === 'high' && (
                  <span className="ml-auto font-semibold uppercase tracking-wide text-[10px]">Suspicious</span>
                )}
              </div>
            ) : (
              <div className="px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 text-xs text-slate-400">
                Enter both prices to see comparison
              </div>
            )}
          </div>

          {/* Arrival Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Arrival Source
            </label>
            <select
              value={form.arrivalSource}
              onChange={(e) => handleChange('arrivalSource', e.target.value)}
              className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {ARRIVAL_SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Live outcome hint */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${outcomeHint.pill}`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${outcomeHint.dot}`} />
            <span>{outcomeHint.label} based on current inputs</span>
          </div>

          {/* Evaluate Button */}
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-display font-semibold text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Evaluating...</>
            ) : (
              <><ArrowRight className="w-4 h-4" />Evaluate Transaction</>
            )}
          </button>
        </div>

        {/* ── Right: Result ──────────────────────────────── */}
        <div className="min-h-[200px] space-y-3">
          {!result && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Fill in the form and click Evaluate</p>
              <p className="text-xs text-slate-300 mt-1">
                The pre-filled values are the "Emeka Scenario" — a known fraud pattern.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center text-center p-8 border border-slate-200 rounded-xl bg-slate-50">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-600">TrustLayer is evaluating...</p>
              <p className="text-xs text-slate-400 mt-1">Running dual ML models + SHAP analysis</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <p className="font-semibold mb-1">Connection failed</p>
              <p>{error}</p>
            </div>
          )}

          {result && !loading && (
            <>
              <DecisionCard result={result} />

              {/* Feedback row */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                {!feedbackSent ? (
                  <>
                    <p className="text-xs text-slate-500 font-medium">Was this decision correct?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFeedback('correct')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          feedback === 'correct'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" /> Yes
                      </button>
                      <button
                        onClick={() => handleFeedback('incorrect')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          feedback === 'incorrect'
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" /> No
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">
                    {feedback === 'correct'
                      ? '✅ Thanks — decision confirmed.'
                      : '⚠️ Feedback recorded as false positive.'}
                  </p>
                )}
              </div>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}