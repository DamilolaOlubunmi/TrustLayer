import { useState } from "react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useNavigate } from "react-router-dom";

export default

function SettingsPage() {
  const [buyerWeight, setBuyerWeight] = useState(40);
  const [reviewBoundary, setReviewBoundary] = useState(0.30);
  const [blockBoundary, setBlockBoundary] = useState(0.65);
  const [presets, setPresets] = useState({
    fake_electronics_listing: true,
    new_vendor_high_value: true,
    whatsapp_funnel_attack: true,
    advance_fee_pattern: true,
  });
 
  const vendorWeight = 100 - buyerWeight;
  const togglePreset = k => setPresets(p => ({ ...p, [k]: !p[k] }));
 
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure TrustLayer behaviour for your platform</p>
      </div>
 
      {/* Model Weights */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span>⚖️</span>
          <h2 className="font-semibold text-gray-900">Model Weights</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">Adjust how much weight TrustLayer assigns to buyer-side vs vendor-side risk signals. Weights must sum to 100%.</p>
        <div className="grid grid-cols-2 gap-8 mb-4">
          {[
            { label: "BUYER WEIGHT", value: buyerWeight, set: setBuyerWeight, suffix: "%" },
            { label: "VENDOR WEIGHT", value: vendorWeight, set: null },
          ].map(w => (
            <div key={w.label}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{w.label}</span>
                <span className="text-blue-600 font-bold">{w.value}%</span>
              </div>
              {w.set ? (
                <input type="range" min="10" max="90" value={buyerWeight} onChange={e => setBuyerWeight(+e.target.value)}
                  className="w-full accent-blue-600" />
              ) : (
                <input type="range" min="10" max="90" value={vendorWeight} disabled className="w-full accent-blue-600 opacity-50" />
              )}
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>LOW RISK FOCUS</span><span>HIGH RISK FOCUS</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700 mb-4">
          ℹ️ <strong>Default:</strong> 40% buyer / 60% vendor — reflects Nigeria's predominantly vendor-side fraud landscape.
        </div>
        <div className="flex justify-end">
          <Button>💾 Save Weights</Button>
        </div>
      </div>
 
      {/* Decision Thresholds */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span>⇌</span>
          <h2 className="font-semibold text-gray-900">Decision Thresholds</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">Set the score boundaries that determine when a transaction is allowed, flagged for review, or blocked.</p>
        {/* Visual threshold bar */}
        <div className="h-8 rounded-xl overflow-hidden flex mb-4 relative">
          <div className="bg-emerald-500 flex items-center justify-end pr-2" style={{ width: `${reviewBoundary * 100}%` }}>
            <div className="w-0.5 h-full bg-gray-800 absolute" style={{ left: `${reviewBoundary * 100}%` }} />
          </div>
          <div className="bg-amber-400 flex-1 relative">
            <div className="w-0.5 h-full bg-gray-800 absolute right-0" style={{ right: `${(1 - blockBoundary) * 100}%` }} />
          </div>
          <div className="bg-red-500" style={{ width: `${(1 - blockBoundary) * 100}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "ALLOW", range: `0.00 – ${reviewBoundary.toFixed(2)}`, color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
            { label: "REVIEW", range: `${reviewBoundary.toFixed(2)} – ${blockBoundary.toFixed(2)}`, color: "border-amber-200 bg-amber-50 text-amber-700" },
            { label: "BLOCK", range: `${blockBoundary.toFixed(2)} – 1.00`, color: "border-red-200 bg-red-50 text-red-700" },
          ].map(t => (
            <div key={t.label} className={`border rounded-lg p-3 text-center ${t.color}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1">{t.label}</div>
              <div className="text-sm font-mono font-semibold">{t.range}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            { label: "ALLOW / REVIEW boundary", value: reviewBoundary, set: setReviewBoundary },
            { label: "REVIEW / BLOCK boundary", value: blockBoundary, set: setBlockBoundary },
          ].map(b => (
            <div key={b.label}>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">{b.label}</label>
              <div className="flex">
                <input type="number" step="0.01" min="0" max="1" value={b.value}
                  onChange={e => b.set(+e.target.value)}
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span className="border border-l-0 border-gray-300 rounded-r-lg px-3 py-2 text-xs text-gray-400 bg-gray-50">SCORE</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button>💾 Save Thresholds</Button>
        </div>
      </div>
 
      {/* Rule Presets */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <span>📋</span>
          <h2 className="font-semibold text-gray-900">Rule Presets</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">Enable or disable Nigeria-specific fraud pattern rules. Disabling a preset does not affect the ML models.</p>
        <div className="space-y-4">
          {[
            { key: "fake_electronics_listing", label: "fake_electronics_listing", desc: "Detects high-value electronics listed at suspicious price points." },
            { key: "new_vendor_high_value", label: "new_vendor_high_value", desc: "Flags significant first-day transaction volumes for new accounts." },
            { key: "whatsapp_funnel_attack", label: "whatsapp_funnel_attack", desc: "Identifies traffic patterns originating from high-risk messaging links." },
            { key: "advance_fee_pattern", label: "advance_fee_pattern", desc: "Monitors for common phishing and pre-payment fraud signatures." },
          ].map(p => (
            <div key={p.key} className="flex items-center justify-between py-4 border-t border-gray-100 first:border-0 first:pt-0">
              <div>
                <div className="text-sm font-semibold text-gray-900 font-mono">{p.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={() => togglePreset(p.key)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 cursor-pointer ${presets[p.key] ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${presets[p.key] ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
          <Button>💾 Save Presets</Button>
        </div>
      </div>
    </div>
  );
}