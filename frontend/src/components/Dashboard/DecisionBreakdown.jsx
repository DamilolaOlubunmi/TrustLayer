import React from "react";
export default

function DecisionBreakdown({ transactions = [] }) {
  const total = transactions.length;
  const blocked = transactions.filter(t => t.decision === "BLOCK").length;
  const reviewed = transactions.filter(t => t.decision === "REVIEW").length;
  const allowed = transactions.filter(t => t.decision === "ALLOW").length;
  const pct = n => (total ? Math.round((n / total) * 100) : 0);
 
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="font-semibold text-[#022448] text-sm mb-4">Decision Breakdown</h3>
      {!total && <div className="text-xs text-gray-500 mb-3">No transactions yet.</div>}
      {/* Visual stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-3 gap-0.5">
        <div className="bg-emerald-500 rounded-l-full" style={{ width: `${pct(allowed)}%` }} />
        <div className="bg-amber-400" style={{ width: `${pct(reviewed)}%` }} />
        <div className="bg-red-500 rounded-r-full" style={{ width: `${pct(blocked)}%` }} />
      </div>
      <div className="flex justify-between text-xs">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /><span className="text-gray-500">ALLOW</span></div>
          <span className="font-bold text-gray-800">{pct(allowed)}%</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /><span className="text-gray-500">REVIEW</span></div>
          <span className="font-bold text-gray-800">{pct(reviewed)}%</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /><span className="text-gray-500">BLOCK</span></div>
          <span className="font-bold text-gray-800">{pct(blocked)}%</span>
        </div>
      </div>
    </div>
  );
}
