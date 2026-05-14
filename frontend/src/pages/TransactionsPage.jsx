import { useState } from "react";
import Button from "../components/common/Button";
import TransactionTable from "../components/Dashboard/TransactionTable";

export default 

function TransactionsPage({ transactions, onSelectTx }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
 
  const filtered = transactions.filter(t => {
    const term = search.toLowerCase();
    const matchSearch =
      t.id.toLowerCase().includes(term) ||
      (t.vendor?.id || "").toLowerCase().includes(term);
    const matchFilter = filter === "All" || t.decision === filter;
    return matchSearch && matchFilter;
  });
 
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#022448]">Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
          <span>🕐</span> All evaluated transactions · Updated just now
        </p>
      </div>
 
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Filters */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              placeholder="Search by transaction ID or vendor"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none cursor-pointer">
            {["All", "ALLOW", "REVIEW", "BLOCK"].map(o => <option key={o}>{o === "All" ? "Decision: All" : o}</option>)}
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none cursor-pointer">
            <option>Date Range: Last 7 days</option>
          </select>
          <Button variant="primary">⬇ Export CSV</Button>
        </div>
 
        <div className="p-6">
          <TransactionTable transactions={filtered} onRowClick={onSelectTx} />
          <div className="flex justify-between items-center mt-6 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing <strong>1–{filtered.length}</strong> of <strong>{filtered.length}</strong> transactions</p>
            <div className="flex gap-2">
              <Button variant="secondary" className="text-xs py-1.5">‹ Previous</Button>
              <Button variant="secondary" className="text-xs py-1.5">Next ›</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
