import React from "react";
export default

function TransactionTable({ transactions, onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {["ID", "AMOUNT", "DECISION", "SCORE", "SIGNAL", "TIME"].map(h => (
              <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider py-3 px-4 first:pl-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            // Each row: clicking it calls onRowClick with this transaction's data
            // This is how data flows UP from table to the parent page
            <tr
              key={tx.id}
              onClick={() => onRowClick(tx)}
              className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer transition-colors"
            >
              <td className="py-3.5 px-4 pl-0 font-mono text-xs text-gray-700 font-medium">{tx.id}</td>
              <td className="py-3.5 px-4 text-sm font-medium text-gray-800">{formatNGN(tx.amount)}</td>
              <td className="py-3.5 px-4"><Badge decision={tx.decision} /></td>
              <td className="py-3.5 px-4"><ScorePill score={tx.score} /></td>
              <td className="py-3.5 px-4 text-xs text-gray-500 font-mono">{tx.primary_signal || "—"}</td>
              <td className="py-3.5 px-4 text-xs text-gray-400">{timeAgo(tx.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}