import React from "react";
export default

function Badge({ decision }) {
  const styles = {
    ALLOW: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    REVIEW: "bg-amber-100 text-amber-700 border border-amber-200",
    BLOCK: "bg-red-100 text-red-600 border border-red-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${styles[decision] || "bg-gray-100 text-gray-600"}`}>
      {decision}
    </span>
  );
}