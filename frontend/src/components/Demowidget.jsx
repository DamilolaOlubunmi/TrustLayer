import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { evaluateTransaction } from '../api';
import DecisionCard from './DecisionCard';

// ─── Emeka Scenario defaults (PRD Section 10.2) ──────────────
// Pre-filled values that produce a BLOCK decision with score 0.91
const EMEKA_DEFAULTS = {
  amount: '280000',
  vendorAge: '4',
  buyerAvgSpend: '24500',
  vendorCompletedTxns: '0',
  listingPrice: '280000',
  avgCategoryPrice: '847000',
  arrivalSource: 'whatsapp_link',
};

const ARRIVAL_SOURCE_OPTIONS = [
  { value: 'organic', label: 'Organic / Direct' },
  { value: 'external_link', label: 'External Link' },
  { value: 'whatsapp_link', label: 'WhatsApp Link (suspicious)' },
  { value: 'social_ad', label: 'Social Media Ad' },
];

// ─── Format number with commas while typing ──────────────────
const formatAmount = (val) => {
  const digits = val.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function DemoWidget() {
  const [form, setForm] = useState(EMEKA_DEFAULTS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Build the full /evaluate payload from form values ─────
  const buildPayload = () => {
    const rawAmount = parseInt(form.amount.replace(/,/g, ''), 10) || 0;
    return {
      transaction: {
        id: `txn_demo_${Date.now()}`,
        amount: rawAmount,
        currency: 'NGN',
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
    };
  };

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = buildPayload();
      const response = await evaluateTransaction(payload);
      setResult(response);
    } catch (err) {
      setError('Could not reach the TrustLayer API. Make sure your backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Input component for reuse ──────────────────────────────
  const Input = ({ label, field, type = 'text', prefix }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={form[field]}
          onChange={(e) => {
            const val = type === 'number' ? e.target.value : e.target.value;
            handleChange(field, val);
          }}
          className={`w-full border border-slate-200 rounded-lg py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-300 font-mono ${
            prefix ? 'pl-7 pr-3' : 'px-3'
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* ── Left: Form ────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="space-y-4">
          {/* Transaction Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Transaction Amount (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                ₦
              </span>
              <input
                type="text"
                value={formatAmount(form.amount)}
                onChange={(e) =>
                  handleChange('amount', e.target.value.replace(/,/g, ''))
                }
                placeholder="280,000"
                className="w-full border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>
          </div>

          {/* Vendor Age + Completed Txns side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Vendor Account Age (days)
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
                Vendor Completed Transactions
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                ₦
              </span>
              <input
                type="text"
                value={formatAmount(form.buyerAvgSpend)}
                onChange={(e) =>
                  handleChange('buyerAvgSpend', e.target.value.replace(/,/g, ''))
                }
                placeholder="24,500"
                className="w-full border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>
          </div>

          {/* Listing Price vs Category Average */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Listing Price vs Market (%)
            </label>
            <div className="relative">
              <select
                value={
                  form.listingPrice && form.avgCategoryPrice
                    ? 'custom'
                    : 'custom'
                }
                disabled
                className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm text-slate-600 bg-slate-50 font-mono appearance-none"
              >
                <option>
                  {form.listingPrice && form.avgCategoryPrice
                    ? `${Math.round(
                        (1 -
                          parseInt(form.listingPrice, 10) /
                            parseInt(form.avgCategoryPrice, 10)) *
                          100
                      )}% below market (suspicious)`
                    : 'Enter prices above'}
                </option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  ₦
                </span>
                <input
                  type="text"
                  value={formatAmount(form.listingPrice)}
                  onChange={(e) =>
                    handleChange('listingPrice', e.target.value.replace(/,/g, ''))
                  }
                  placeholder="Listing price"
                  className="w-full border border-slate-100 rounded-lg py-2 pl-6 pr-2 text-xs text-slate-600 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono"
                />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  ₦
                </span>
                <input
                  type="text"
                  value={formatAmount(form.avgCategoryPrice)}
                  onChange={(e) =>
                    handleChange(
                      'avgCategoryPrice',
                      e.target.value.replace(/,/g, '')
                    )
                  }
                  placeholder="Category average"
                  className="w-full border border-slate-100 rounded-lg py-2 pl-6 pr-2 text-xs text-slate-600 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono"
                />
              </div>
            </div>
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
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Evaluate Button */}
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-display font-semibold text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Evaluate Transaction
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Right: Result ─────────────────────────────────── */}
      <div className="min-h-[200px]">
        {!result && !loading && !error && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400 font-medium">
              Fill in the form and click Evaluate
            </p>
            <p className="text-xs text-slate-300 mt-1">
              The pre-filled values are the "Emeka Scenario" — a known fraud pattern.
            </p>
          </div>
        )}

        {loading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-slate-200 rounded-xl bg-slate-50">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-600">
              TrustLayer is evaluating...
            </p>
            <p className="text-xs text-slate-400 mt-1">Running dual ML models + SHAP analysis</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <p className="font-semibold mb-1">Connection failed</p>
            <p>{error}</p>
          </div>
        )}

        {result && !loading && <DecisionCard result={result} />}
      </div>
    </div>
  );
}