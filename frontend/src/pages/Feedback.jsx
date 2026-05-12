import { useState } from "react";
import DecisionBadge from "../components/DecisionBadge";
import { FEEDBACK_QUEUE } from "../data/mockData";
import { CheckCircle } from "lucide-react";

function formatNGN(kobo) {
  return "₦" + kobo.toLocaleString("en-NG");
}

const OUTCOME_OPTIONS = [
  { value: "",                    label: "Select outcome…" },
  { value: "fraudulent",          label: "Fraudulent"      },
  { value: "legitimate",          label: "Legitimate"      },
  { value: "disputed_unresolved", label: "Disputed — Unresolved" },
];

export default function Feedback() {
  const [queue, setQueue] = useState(FEEDBACK_QUEUE.map((t) => ({ ...t, outcome: "" })));
  const [submitted, setSubmitted] = useState({});

  const handleSubmit = (id) => {
    const item = queue.find((t) => t.id === id);
    if (!item?.outcome) return;
    setSubmitted((prev) => ({ ...prev, [id]: item.outcome }));
  };

  const pending = queue.filter((t) => !submitted[t.id]);

  return (
    <div className="page-scroll fade-in">
      <div className="page-header">
        <h1 className="page-title">Feedback</h1>
        <p className="page-subtitle">
          Report transaction outcomes to improve model accuracy
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <CheckCircle size={24} style={{ color: "#22c55e" }} />
            </div>
            <div className="empty-state-title">All outcomes reported</div>
            <p className="empty-state-desc">
              Great work — the model will retrain with the new labels on the next batch cycle.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Awaiting Outcome Labels</span>
            <span
              style={{
                fontSize: "0.72rem",
                background: "#fffbeb",
                color: "#92400e",
                padding: "2px 8px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              {pending.length} pending
            </span>
          </div>
          <table className="txn-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Decision</th>
                <th>Outcome</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {queue.map((txn) => {
                const done = submitted[txn.id];
                return (
                  <tr key={txn.id} style={done ? { opacity: 0.45 } : {}}>
                    <td className="txn-id">{txn.id}</td>
                    <td className="txn-amount">{formatNGN(txn.amount)}</td>
                    <td><DecisionBadge decision={txn.decision} /></td>
                    <td>
                      {done ? (
                        <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 600 }}>
                          ✓ {done}
                        </span>
                      ) : (
                        <select
                          style={{
                            padding: "6px 10px",
                            border: "1px solid var(--border)",
                            borderRadius: 7,
                            fontSize: "0.8rem",
                            background: "var(--surface-card)",
                            color: "var(--text-primary)",
                            outline: "none",
                            cursor: "pointer",
                          }}
                          value={txn.outcome}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQueue((prev) =>
                              prev.map((t) => t.id === txn.id ? { ...t, outcome: val } : t)
                            );
                          }}
                        >
                          {OUTCOME_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      {!done && (
                        <button
                          className="btn-primary"
                          style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                          onClick={() => handleSubmit(txn.id)}
                          disabled={!txn.outcome}
                        >
                          Submit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
