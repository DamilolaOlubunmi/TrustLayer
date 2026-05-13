import React from "react";
export default

function ScorePill({ score }) {
  const val = parseFloat(score);
  const color = val >= 0.66 ? "text-red-600" : val >= 0.31 ? "text-amber-600" : "text-emerald-600";
  return <span className={`font-mono font-semibold text-sm ${color}`}>{val.toFixed(2)}</span>;
}