import React from "react";
export default

function TopRiskSignals({ transactions }) {
  // Count how many times each signal appears across transactions
  const counts = {};
  transactions.forEach(tx => {
    (tx.shap_signals || []).slice(0, 1).forEach(s => {
      if (s.value > 0) counts[s.feature] = (counts[s.feature] || 0) + 1;
    });
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const icons = { vendor_account_age_days: "🕐", listing_price_ratio: "💰", arrival_source_risk: "🔗", amount_deviation_ratio: "📊", category_risk_score: "🛡️" };
 
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 text-sm mb-4">Top Risk Signals</h3>
      <div className="space-y-3">
        {sorted.map(([feature, count]) => (
          <div key={feature} className="flex items-center gap-3">
            <span className="text-base">{icons[feature] || "⚠️"}</span>
            <div className="flex-1 text-xs font-mono text-gray-700 truncate">{feature}</div>
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
 
// ShapWaterfall: Visual bar chart for SHAP feature contributions
function ShapWaterfall({ signals }) {
  const maxVal = Math.max(...signals.map(s => Math.abs(s.value)));
  return (
    <div className="space-y-3">
      {signals.map(s => {
        const width = (Math.abs(s.value) / maxVal) * 70;
        const positive = s.value > 0;
        return (
          <div key={s.feature} className="flex items-center gap-3">
            <div className="w-44 text-xs font-mono text-gray-600 text-right flex-shrink-0">{s.feature}</div>
            <div className="flex-1 flex items-center gap-2">
              {positive ? (
                <div className="flex items-center">
                  <div className="bg-red-400 h-3 rounded-sm" style={{ width: `${width * 3}px` }} />
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="bg-emerald-400 h-3 rounded-sm" style={{ width: `${Math.abs(width) * 3}px` }} />
                </div>
              )}
            </div>
            <div className={`text-xs font-mono font-semibold w-12 text-right ${positive ? "text-red-600" : "text-emerald-600"}`}>
              {positive ? "+" : ""}{s.value.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}