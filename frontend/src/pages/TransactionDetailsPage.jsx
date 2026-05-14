import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { formatNGN } from "../utilis/utilis";
import { getTransactionRequest } from "../api";

export default

function TransactionDetailsPage({ transactionId, transactions = [], onReviewAction }) {
  const navigate = useNavigate();
  const cachedTransaction = useMemo(
    () => transactions.find((tx) => tx.id === transactionId),
    [transactions, transactionId],
  );
  const [transaction, setTransaction] = useState(cachedTransaction || null);
  const [loading, setLoading] = useState(!cachedTransaction);
  const [notice, setNotice] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadTransaction = async () => {
      if (cachedTransaction) {
        setTransaction(cachedTransaction);
        setLoading(false);
        return;
      }
      setLoading(true);
      setNotice(null);
      try {
        const response = await getTransactionRequest(transactionId);
        if (isMounted) {
          setTransaction(response);
        }
      } catch (requestError) {
        if (isMounted) {
          setNotice({
            type: "error",
            message: requestError?.response?.data?.detail || "Unable to load this transaction.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTransaction();
    return () => {
      isMounted = false;
    };
  }, [cachedTransaction, transactionId]);

  const handleFeedback = () => {
    if (!transaction) {
      return;
    }
    navigate("/feedback", { state: { transactionId: transaction.id } });
  };

  const handleReviewAction = async (action) => {
    if (!transaction?.review_token) {
      setNotice({ type: "error", message: "Review token missing for this transaction." });
      return;
    }
    setProcessing(true);
    setNotice(null);
    try {
      const response = await onReviewAction?.(transaction, action);
      setTransaction((prev) =>
        prev
          ? {
              ...prev,
              decision: response?.decision || action,
              review_token: null,
              review_expires_at: null,
            }
          : prev,
      );
      setNotice({
        type: "success",
        message: `Transaction ${transaction.id} has been ${action === "ALLOW" ? "allowed" : "blocked"}.`,
      });
    } catch (requestError) {
      const status = requestError?.response?.status;
      const fallback =
        status === 410
          ? "This review token has expired. Submit manual feedback instead."
          : "Unable to submit your review decision right now.";
      setNotice({ type: "error", message: requestError?.response?.data?.detail || fallback });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
        Loading transaction details...
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
        Transaction not found.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <button
        onClick={() => navigate("/transactions")}
        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mb-6 cursor-pointer"
      >
        <span>←</span> Back to Transactions
      </button>

      <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-[#022448] font-mono">{transaction.id}</h1>
            <Badge decision={transaction.decision} />
          </div>
          <p className="text-sm text-gray-500">
            {transaction.timestamp ? new Date(transaction.timestamp).toLocaleString("en-NG") : "—"}
          </p>
        </div>

        <div className="flex gap-2">
          {transaction.decision === "REVIEW" ? (
            <>
              <Button
                variant="primary"
                disabled={processing}
                onClick={() => handleReviewAction("ALLOW")}
              >
                {processing ? "Submitting..." : "ALLOW"}
              </Button>
              <Button
                variant="danger"
                disabled={processing}
                onClick={() => handleReviewAction("BLOCK")}
              >
                {processing ? "Submitting..." : "BLOCK"}
              </Button>
            </>
          ) : (
            <Button onClick={handleFeedback}>Submit Feedback</Button>
          )}
        </div>
      </div>

      {notice && (
        <div
          className={`rounded-xl px-5 py-4 mb-8 text-sm font-medium ${
            notice.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {notice.message}
        </div>
      )}

      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: "Final Score", value: transaction.score?.toFixed?.(2) ?? "—" },
          { label: "Buyer Risk Score", value: transaction.buyer_risk_score?.toFixed?.(2) ?? "—" },
          { label: "Vendor Risk Score", value: transaction.vendor_risk_score?.toFixed?.(2) ?? "—" },
          { label: "Confidence", value: transaction.confidence || "—" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
            <div className="text-xl font-bold text-gray-900 font-mono">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-[#022448] mb-4">Transaction Details</h3>
          <div className="space-y-2 text-sm">
            {[
              ["Transaction ID", transaction.id],
              ["Buyer ID", transaction.buyer?.id || "—"],
              ["Vendor ID", transaction.vendor?.id || "—"],
              ["Amount", formatNGN(transaction.amount ?? 0)],
              ["Currency", transaction.currency || "—"],
              ["Payment Method", transaction.payment_method || "—"],
              ["Decision", transaction.decision || "—"],
              ["Rule Preset Matched", transaction.rule_preset_matched || "—"],
              ["Escalated To LLM", transaction.escalated_to_llm ? "Yes" : "No"],
              ["Squad Payment Status", transaction.squad_status || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-[#022448] mb-4">Session Details</h3>
          <div className="space-y-2 text-sm">
            {[
              ["Arrival Source", transaction.session?.arrival_source || "—"],
              ["Time on Page", transaction.session?.time_on_page_seconds ? `${transaction.session.time_on_page_seconds}s` : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-[#022448] mb-4">Buyer Behavioral Info</h3>
          <div className="space-y-2 text-sm">
            {[
              ["Account Age (days)", transaction.buyer?.account_age_days ?? "—"],
              ["Total Past Transactions", transaction.buyer?.total_past_transactions ?? "—"],
              ["Avg Transaction Amount", transaction.buyer?.avg_transaction_amount ?? "—"],
              ["Past Dispute Count", transaction.buyer?.past_dispute_count ?? "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-[#022448] mb-4">Vendor Behavioral Info</h3>
          <div className="space-y-2 text-sm">
            {[
              ["Account Age (days)", transaction.vendor?.account_age_days ?? "—"],
              ["Completed Transactions", transaction.vendor?.total_completed_transactions ?? "—"],
              ["Category", transaction.vendor?.category || "—"],
              ["Listing Price", transaction.vendor?.listing_price ?? "—"],
              ["Avg Category Price", transaction.vendor?.avg_category_price ?? "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-[#022448] mb-4">Reasons</h3>
        {transaction.reasons?.length ? (
          <ul className="space-y-3">
            {transaction.reasons.map((reason, index) => (
              <li key={index} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: reason.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No reasons recorded for this transaction.</p>
        )}
      </div>
    </div>
  );
}
