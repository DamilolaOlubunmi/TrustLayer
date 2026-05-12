import { useState } from "react";
import { Search, Filter } from "lucide-react";
import TransactionTable from "../components/TransactionTable";
import { RECENT_TRANSACTIONS } from "../data/mockData";

const FILTERS = ["All", "ALLOW", "REVIEW", "BLOCK"];

export default function Transactions() {
  const [query, setQuery]   = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = RECENT_TRANSACTIONS.filter((txn) => {
    const matchDecision = filter === "All" || txn.decision === filter;
    const matchQuery    = !query || txn.id.toLowerCase().includes(query.toLowerCase());
    return matchDecision && matchQuery;
  });

  return (
    <div className="page-scroll fade-in">
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <p className="page-subtitle">All evaluated transactions · Last 30 days</p>
      </div>

      <div className="page-toolbar">
        {/* Search */}
        <div className="search-input-wrap">
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search transaction ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Decision filters */}
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "All" && <Filter size={13} />}
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <TransactionTable transactions={filtered} />
        {filtered.length === 0 && (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
            No transactions match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
