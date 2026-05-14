import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

export default

function FeedbackPage({ currentUser = {}, onSubmitFeedback }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const txIdFromLocation = location.state?.transactionId || searchParams.get("transaction") || "";
  const [txId, setTxId] = useState(txIdFromLocation);
  const [outcome, setOutcome] = useState("fraudulent");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const resolvedTxId = txId || txIdFromLocation;
    if (!resolvedTxId) {
      setError("Please enter a transaction ID.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onSubmitFeedback?.({
        transaction_id: resolvedTxId,
        outcome,
        reported_by: currentUser.email || currentUser.name || "merchant",
        reported_at: new Date().toISOString(),
        notes,
      });

      setSubmitted(true);
      setTxId("");
      setNotes("");
      setTimeout(() => setSubmitted(false), 2500);
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || "Unable to submit feedback right now.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#022448]">Feedback</h1>
        <p className="text-sm text-gray-500 mt-0.5">Correct TrustLayer's decisions to improve model accuracy over time</p>
      </div>
 
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-8 flex items-start gap-3">
        <span className="text-blue-600 mt-0.5">ℹ️</span>
        <p className="text-sm text-blue-800">Reporting incorrect decisions helps TrustLayer learn. Every label you submit is used to retrain the model for your platform.</p>
      </div>
 
      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-6 text-emerald-800 text-sm font-medium">
          ✓ Feedback recorded. The model will be updated in the next retraining batch.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}
 
      {/* Feedback form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-[#022448] mb-4">Report a Transaction Outcome</h2>
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
          <Button variant="secondary" onClick={() => { setTxId(""); setNotes(""); setError(""); }}>Cancel</Button>
        </div>
      </div>
 
      {/* Feedback history table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-[#022448]">Reported Feedback</h2>
          <div className="flex gap-2">
            <button className="text-gray-400 hover:text-gray-600 cursor-pointer">☰</button>
            <button className="text-gray-400 hover:text-gray-600 cursor-pointer">⬇</button>
          </div>
        </div>
        <div className="px-5 py-6 text-sm text-gray-500">
          Feedback history will appear here once the backend exposes historical feedback records.
        </div>
      </div>
    </div>
  );
}
