import { timeAgo, formatNGN } from "../utilis/utilis";
import Button from "../components/common/Button"; 
import { useState } from "react";

export default

function FlaggedPage({ transactions, onSelectTx }) {
  const flagged = transactions.filter(t => t.decision === "REVIEW");
  const resolved = 87;
  const pending = flagged.length;
 
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Flagged for Review</h1>
        <p className="text-sm text-gray-500 mt-0.5">Transactions requiring manual review or step-up authentication · Last 30 days</p>
      </div>
 
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-4">
        <p className="text-amber-800 text-sm">
          ⚠️ These transactions were not blocked but carry elevated risk. Resolve each one or report the outcome to improve our detection algorithms.
        </p>
      </div>
 
      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input placeholder="Search by transaction ID" className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer">
          <option>Risk Preset: All</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer">
          <option>Score Range: 0.31–0.80</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer">
          <option>Date Range: Last 7 days</option>
        </select>
      </div>
 
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["ID", "AMOUNT", "SCORE", "PRIMARY SIGNAL", "PRESET MATCHED", "FLAGGED AT", "STATUS", "ACTIONS"].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {flagged.map(tx => (
              <tr key={tx.id} onClick={() => onSelectTx(tx)} className="border-t border-gray-100 hover:bg-blue-50/40 cursor-pointer transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs text-gray-700">{tx.id}</td>
                <td className="py-3.5 px-4 text-sm font-medium">{formatNGN(tx.amount)}</td>
                <td className="py-3.5 px-4">
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded">{tx.score.toFixed(2)}</span>
                </td>
                <td className="py-3.5 px-4 text-xs text-gray-600">{tx.primary_signal}</td>
                <td className="py-3.5 px-4">
                  {tx.rule_preset_matched ? (
                    <span className="bg-gray-100 text-gray-700 text-xs font-mono px-2 py-0.5 rounded">{tx.rule_preset_matched}</span>
                  ) : "—"}
                </td>
                <td className="py-3.5 px-4 text-xs text-gray-500">{timeAgo(tx.timestamp)}</td>
                <td className="py-3.5 px-4">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full">Pending</span>
                </td>
                <td className="py-3.5 px-4">
                  <button className="text-blue-600 text-xs hover:underline cursor-pointer">Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
          <div className="flex gap-4 text-sm">
            <span>Total Flagged: <strong>{pending + resolved}</strong></span>
            <span className="text-emerald-600">Resolved: <strong>{resolved}</strong></span>
            <span className="text-amber-600">Pending: <strong>{pending}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-600 hover:underline cursor-pointer">⬇ Export CSV</button>
            <div className="flex gap-2">
              <Button variant="secondary" className="text-xs py-1.5">‹</Button>
              <span className="text-xs text-gray-500 px-2 self-center">Page 1 of 12</span>
              <Button variant="secondary" className="text-xs py-1.5">›</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}