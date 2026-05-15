import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { getAllFeedbackRequest } from "../api";

export default function FeedbackPage({ currentUser = {}, onSubmitFeedback }) {
  const fetchFeedbacks = async () => {
    setFeedbacksLoading(true);
    setFeedbacksError("");
    try {
      const data = await getAllFeedbackRequest();
      setFeedbacks(data.feedbacks || []);
    } catch (err) {
      setFeedbacksError(err?.response?.data?.detail || "Failed to load feedback history");
    } finally {
      setFeedbacksLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);
  
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const txIdFromLocation = location.state?.transactionId || searchParams.get("transaction") || "";
  const [txId, setTxId] = useState(txIdFromLocation);
  const [outcome, setOutcome] = useState("fraudulent");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);
  const [feedbacksError, setFeedbacksError] = useState("");

  const handleSubmit = async () => {
    const resolvedTxId = txId || txIdFromLocation;
    if (!resolvedTxId) {
      setError("Please enter a transaction ID.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Convert outcome to is_fraud boolean for backend API
      const is_fraud = outcome === "fraudulent";
      
      await onSubmitFeedback?.({
        transaction_id: resolvedTxId,
        is_fraud,
        reported_by: currentUser.email || currentUser.name || "merchant",
        reported_at: new Date().toISOString(),
      });

      setSubmitted(true);
      setTxId("");
      setNotes("");
      setOutcome("fraudulent");
      setTimeout(() => setSubmitted(false), 2500);
      // Refresh feedback list after submission
      fetchFeedbacks();
    } catch (requestError) {
      // Handle Pydantic validation errors (422 responses)
      const errorData = requestError?.response?.data;
      if (Array.isArray(errorData?.detail)) {
        // Pydantic validation error list
        const errorMessages = errorData.detail
          .map((err) => `${err.loc?.join(".")} - ${err.msg}`)
          .join("; ");
        setError(`Validation error: ${errorMessages}`);
      } else if (typeof errorData?.detail === "string") {
        setError(errorData.detail);
      } else {
        setError("Unable to submit feedback right now.");
      }
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
            <button 
              onClick={fetchFeedbacks}
              className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg"
              title="Refresh"
            >
              🔄
            </button>
          </div>
        </div>

        {feedbacksError && (
          <div className="px-5 py-4 text-red-700 text-sm bg-red-50 border-t border-red-200">
            {feedbacksError}
          </div>
        )}

        {feedbacksLoading ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">
            Loading feedback history...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">
            No feedback submitted yet. Report transaction outcomes above to help improve model accuracy.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-700">Transaction ID</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-700">Outcome</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-700">Reported By</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((feedback, index) => (
                  <tr key={feedback.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-blue-600">
                      {feedback.transaction_id || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          feedback.is_fraud
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {feedback.is_fraud ? "Fraudulent" : "Legitimate"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-sm">
                      {feedback.reported_by || "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {feedback.reported_at
                        ? new Date(feedback.reported_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
