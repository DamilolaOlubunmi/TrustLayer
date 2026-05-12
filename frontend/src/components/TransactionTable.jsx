import DecisionBadge from "./DecisionBadge";

/**
 * Formats kobo amount → ₦ with commas
 * 125000 kobo → ₦125,000
 */
function formatNGN(kobo) {
  return "₦" + kobo.toLocaleString("en-NG");
}

function scoreClass(score) {
  if (score >= 0.66) return "score-high";
  if (score >= 0.31) return "score-mid";
  return "score-low";
}

/**
 * Props:
 *  transactions – array from mockData
 *  onRowClick   – (txn) => void
 *  limit        – number of rows to show (default all)
 */
export default function TransactionTable({ transactions, onRowClick, limit }) {
  const rows = limit ? transactions.slice(0, limit) : transactions;

  return (
    <table className="txn-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Amount</th>
          <th>Decision</th>
          <th>Score</th>
          <th>Signal</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((txn) => (
          <tr key={txn.id} onClick={() => onRowClick && onRowClick(txn)}>
            <td className="txn-id">{txn.id}</td>
            <td className="txn-amount">{formatNGN(txn.amount)}</td>
            <td><DecisionBadge decision={txn.decision} /></td>
            <td className={`txn-score ${scoreClass(txn.score)}`}>
              {txn.score.toFixed(2)}
            </td>
            <td className="txn-signal">{txn.signal ?? <span style={{color:"#cbd5e1"}}>—</span>}</td>
            <td className="txn-time">{txn.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
