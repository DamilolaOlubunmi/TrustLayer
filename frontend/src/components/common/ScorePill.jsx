import React from "react";
export default

function ScorePill({ score }) {
  const val = parseFloat(score);
  const percentage = Math.round(val * 100);
  const color = percentage >= 66 ? "text-red-600" : percentage >= 31 ? "text-amber-600" : "text-emerald-600";
  return <span className={`font-mono font-semibold text-sm ${color}`}>{percentage}</span>;
}