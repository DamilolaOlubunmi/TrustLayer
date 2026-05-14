import { useMemo, useState } from "react";
import Button from "../components/common/Button";
import { formatNGN } from "../utilis/utilis";

export default

function FlaggedPage({ transactions = [], onSelectTx, onReviewAction }) {
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(null);
  const [processing, setProcessing] = useState({});

  const flagged = useMemo(
    () => transactions.filter((tx) => tx.decision === "REVIEW"),
    [transactions],
  );

  const filtered = flagged.filter((tx) => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return true;
    }
    return [
      tx.id,
      tx.buyer?.id,
      tx.vendor?.id,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term));
  });

  const handleAction = async (event, tx, action) => {
    event.stopPropagation();
    setNotice(null);

    if (!tx.review_token) {
      setNotice({ type: "error", message: "Review token missing for this transaction." });
      return;
    }

    setProcessing((prev) => ({ ...prev, [tx.id]: action }));

    try {
      await onReviewAction?.(tx, action);
      setNotice({
        type: "success",
        message: `Transaction ${tx.id} has been ${action === "ALLOW" ? "allowed" : "blocked"}.`,
      });
    } catch (requestError) {
      const status = requestError?.response?.status;
      const fallback =
        status === 410
          ? "This review token has expired. Submit manual feedback instead."
          : "Unable to submit your review decision right now.";
      setNotice({ type: "error", message: requestError?.response?.data?.detail || fallback });
    } finally {
      setProcessing((prev) => ({ ...prev, [tx.id]: null }));
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#022448]">Flagged for Review</h1>
        <p className="text-sm text-gray-500 mt-0.5">Transactions awaiting manual review decisions</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6">
        <p className="text-amber-800 text-sm">
          ⚠️ These transactions were flagged by TrustLayer. Review each decision to improve model accuracy.
        </p>
      </div>

      {notice && (
        <div
          className={`rounded-xl px-5 py-4 mb-6 text-sm font-medium ${
            notice.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {notice.message}
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <input
            placeholder="Search by transaction, buyer, or vendor ID"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Transaction ID", "Buyer ID", "Vendor ID", "Amount", "Final Score", "Confidence", "Timestamp", "Actions"].map((header) => (
                <th
                  key={header}
                  className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-3 px-4"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr
                key={tx.id}
                onClick={() => onSelectTx(tx)}
                className="border-t border-gray-100 hover:bg-blue-50/40 cursor-pointer transition-colors"
              >
                <td className="py-3.5 px-4 font-mono text-xs text-gray-700">{tx.id}</td>
                <td className="py-3.5 px-4 text-xs text-gray-600">{tx.buyer?.id || "—"}</td>
                <td className="py-3.5 px-4 text-xs text-gray-600">{tx.vendor?.id || "—"}</td>
                <td className="py-3.5 px-4 text-sm font-medium">{formatNGN(tx.amount ?? 0)}</td>
                <td className="py-3.5 px-4 text-xs font-mono text-gray-700">{tx.score?.toFixed?.(2) ?? "—"}</td>
                <td className="py-3.5 px-4 text-xs text-gray-600">{tx.confidence || "—"}</td>
                <td className="py-3.5 px-4 text-xs text-gray-500">
                  {tx.timestamp ? new Date(tx.timestamp).toLocaleString("en-NG") : "—"}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="text-blue-600 text-xs hover:underline cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectTx(tx);
                      }}
                    >
                      View Details
                    </button>
                    <Button
                      variant="primary"
                      className="text-xs py-1.5"
                      disabled={processing[tx.id]}
                      onClick={(event) => handleAction(event, tx, "ALLOW")}
                    >
                      {processing[tx.id] === "ALLOW" ? "Allowing..." : "ALLOW"}
                    </Button>
                    <Button
                      variant="danger"
                      className="text-xs py-1.5"
                      disabled={processing[tx.id]}
                      onClick={(event) => handleAction(event, tx, "BLOCK")}
                    >
                      {processing[tx.id] === "BLOCK" ? "Blocking..." : "BLOCK"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <div className="px-4 py-6 text-sm text-gray-500 text-center">
            No flagged transactions match your search.
          </div>
        )}
      </div>
    </div>
  );
}
