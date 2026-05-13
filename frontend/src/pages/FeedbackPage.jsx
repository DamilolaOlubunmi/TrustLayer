import { useState } from "react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { formatNGN, timeAgo } from "../utilis/utilis";
import Badge from "../components/common/Badge";
import { MOCK_FEEDBACK } from "../data/mock/transactions";
import { useNavigate } from "react-router-dom";

export default

function FeedbackPage() {
  const [txId, setTxId] = useState("");
  const [outcome, setOutcome] = useState("fraudulent");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
 
  const handleSubmit = () => {
    if (!txId) return;
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setTxId(""); setNotes(""); }, 2500);
  };
 
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
        <p className="text-sm text-gray-500 mt-0.5">Correct TrustLayer's decisions to improve model accuracy over time</p>
      </div>
 
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
        <span className="text-blue-600 mt-0.5">ℹ️</span>
        <p className="text-sm text-blue-800">Reporting incorrect decisions helps TrustLayer learn. Every label you submit is used to retrain the model for your platform.</p>
      </div>
 
      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-4 text-emerald-800 text-sm font-medium">
          ✓ Feedback recorded. The model will be updated in the next retraining batch.
        </div>
      )}
 
      {/* Feedback form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Report a Transaction Outcome</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input label="Transaction ID" placeholder="e.g. txn_fm_00291" value={txId} onChange={setTxId} />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Outcome Label</label>
            <select value={outcome} onChange={e => setOutcome(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option value="fraudulent">Fraudulent — TrustLayer missed this</option>
              <option value="legitimate">Legitimate — TrustLayer was wrong to block</option>
              <option value="disputed">Disputed — Outcome unresolved</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Optional Notes</label>
          <textarea
            placeholder="Any additional context..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSubmit}>Submit</Button>
          <Button variant="secondary" onClick={() => { setTxId(""); setNotes(""); }}>Cancel</Button>
        </div>
      </div>
 
      {/* Feedback history table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Reported Feedback</h2>
          <div className="flex gap-2">
            <button className="text-gray-400 hover:text-gray-600 cursor-pointer">☰</button>
            <button className="text-gray-400 hover:text-gray-600 cursor-pointer">⬇</button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["TRANSACTION ID", "AMOUNT", "ORIGINAL DECISION", "SCORE", "FEEDBACK LABEL", "SUBMITTED AT"].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_FEEDBACK.map(f => (
              <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs text-gray-700">{f.id}</td>
                <td className="py-3.5 px-4 text-sm font-medium">{formatNGN(f.amount)}</td>
                <td className="py-3.5 px-4"><Badge decision={f.decision} /></td>
                <td className="py-3.5 px-4 font-mono text-sm text-gray-700">{f.score.toFixed(2)}</td>
                <td className="py-3.5 px-4">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    f.label === "Fraudulent" ? "bg-red-100 text-red-600" :
                    f.label === "Legitimate" ? "bg-emerald-100 text-emerald-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{f.label}</span>
                </td>
                <td className="py-3.5 px-4 text-xs text-gray-500">{f.submitted}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
          <p className="text-sm text-gray-500">Showing {MOCK_FEEDBACK.length} of 124 reports</p>
          <div className="flex gap-2">
            <Button variant="secondary" className="text-xs py-1.5">Previous</Button>
            <Button variant="secondary" className="text-xs py-1.5">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}