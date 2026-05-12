import TransactionTable from "../components/TransactionTable";
import { FLAGGED_TRANSACTIONS } from "../data/mockData";

export default function Flagged() {
  return (
    <div className="page-scroll fade-in">
      <div className="page-header">
        <h1 className="page-title">Flagged</h1>
        <p className="page-subtitle">
          {FLAGGED_TRANSACTIONS.length} transactions requiring attention
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">BLOCK & REVIEW Transactions</span>
          <span
            style={{
              fontSize: "0.72rem",
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "2px 8px",
              borderRadius: 20,
              fontWeight: 600,
            }}
          >
            {FLAGGED_TRANSACTIONS.length} flagged
          </span>
        </div>
        <TransactionTable transactions={FLAGGED_TRANSACTIONS} />
      </div>
    </div>
  );
}
