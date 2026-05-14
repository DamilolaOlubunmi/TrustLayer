import Button from "../common/Button";
import Badge from "../common/Badge";
import { formatNGN } from "../../utilis/utilis";

function ShapWaterfall({ signals = [] }) {
  if (!signals.length) {
    return <div className="text-sm text-gray-500">No risk breakdown data returned by the backend.</div>;
  }

  const maxVal = Math.max(...signals.map((signal) => Math.abs(signal.value || 0)), 1);

  return (
    <div className="space-y-3">
      {signals.map((signal) => {
        const width = (Math.abs(signal.value || 0) / maxVal) * 70;
        const positive = (signal.value || 0) > 0;

        return (
          <div key={signal.feature} className="flex items-center gap-3">
            <div className="w-44 text-xs font-mono text-gray-600 text-right shrink-0">{signal.feature}</div>
            <div className="flex-1 flex items-center gap-2">
              <div className={`h-3 rounded-sm ${positive ? "bg-red-400" : "bg-emerald-400"}`} style={{ width: `${Math.max(width * 3, 2)}px` }} />
            </div>
            <div className={`text-xs font-mono font-semibold w-12 text-right ${positive ? "text-red-600" : "text-emerald-600"}`}>
              {(positive ? "+" : "")}{(signal.value || 0).toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React from "react";
export default

function TransactionDetail({ tx, onClose }) {
  if (!tx) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />
      {/* Panel */}
      <div className="w-full max-w-2xl bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4 flex items-start justify-between sticky top-0 bg-white z-10">
          <div>
            <button onClick={onClose} className="text-xs text-blue-600 hover:underline flex items-center gap-1 mb-2 cursor-pointer">
              <span>←</span> Back to Transactions
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#022448] font-mono">{tx.id}</h2>
              <Badge decision={tx.decision} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{new Date(tx.timestamp).toLocaleString("en-NG")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => {}}>Download JSON</Button>
            <Button onClick={() => {}}>Mark as Resolved</Button>
          </div>
        </div>
 
        <div className="p-6 space-y-6">
          {/* AI Reasoned banner */}
          {tx.escalated_to_llm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-blue-800">
              <span>🤖</span>
              <span>AI Reasoned — models were uncertain; <strong>Claude</strong> made the final decision.</span>
            </div>
          )}
 
          {/* Score cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Final Score", value: tx.score.toFixed(2), color: tx.score >= 0.66 ? "text-red-600" : tx.score >= 0.31 ? "text-amber-600" : "text-emerald-600" },
              { label: "Buyer Risk Score", value: tx.buyer_risk_score.toFixed(2), color: "text-gray-800" },
              { label: "Vendor Risk Score", value: tx.vendor_risk_score.toFixed(2), color: tx.vendor_risk_score >= 0.7 ? "text-red-600" : "text-gray-800" },
              { label: "Confidence", value: tx.confidence, color: tx.confidence === "HIGH" ? "text-emerald-600" : tx.confidence === "LOW" ? "text-red-500" : "text-amber-600" },
            ].map(c => (
              <div key={c.label} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{c.label}</div>
                <div className={`text-2xl font-bold font-mono ${c.color}`}>{c.value}</div>
              </div>
            ))}
          </div>
 
          {/* Risk Breakdown (SHAP waterfall) */}
          {tx.shap_signals && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-[#022448] mb-4">Risk Breakdown</h3>
              <ShapWaterfall signals={tx.shap_signals} />
            </div>
          )}
 
          {/* Detail cards row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Transaction Details</div>
              <div className="space-y-2">
                {[
                  ["Amount", formatNGN(tx.amount)],
                  ["Payment Method", tx.payment_method || "Card"],
                  ["Arrival Source", tx.session?.arrival_source || "—"],
                  ["Time on Page", tx.session?.time_on_page_seconds ? `${tx.session.time_on_page_seconds}s` : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-gray-800 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Vendor Profile</div>
              <div className="space-y-2">
                {[
                  ["ID", <span className="text-blue-600 font-mono">{tx.vendor?.id}</span>],
                  ["Account Age", <span className={tx.vendor?.account_age_days < 14 ? "text-red-600 font-semibold" : ""}>{tx.vendor?.account_age_days} days</span>],
                  ["Completed Txns", tx.vendor?.total_completed_transactions],
                  ["Category", tx.vendor?.category || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-gray-800 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          {/* Rule Preset */}
          {tx.rule_preset_matched && (
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mb-2">Rule Preset Matched</div>
              <span className="bg-[#0f172a] text-white text-xs font-mono px-2 py-1 rounded">{tx.rule_preset_matched}</span>
            </div>
          )}
 
          {/* Plain English Explanation — this is the AI-generated part! */}
          <div className="border border-gray-200 rounded-xl p-5 bg-[#0f172a]/2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs">✦</span>
              </div>
              <h3 className="font-semibold text-[#022448]">Plain English Explanation</h3>
            </div>
            <ul className="space-y-3">
              {(tx.reasons || []).map((reason, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  {/* Render **bold** markdown */}
                  <span dangerouslySetInnerHTML={{ __html: reason.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                </li>
              ))}
            </ul>
          </div>
 
          {/* Report Outcome */}
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Report Outcome</div>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Fraudulent</option>
              <option>Legitimate</option>
              <option>Disputed — Unresolved</option>
            </select>
            <Button className="w-full justify-center">Report Outcome</Button>
            <p className="text-xs text-gray-400 text-center mt-2">Reporting outcomes improves model accuracy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
