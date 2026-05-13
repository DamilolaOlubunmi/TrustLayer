import React from "react";
export default

function StatCard({ label, value, icon: Icon, iconColor = "text-gray-400", valueColor = "text-gray-900", subtitle }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-snug">{label}</div>
        <div className={`${iconColor}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    </div>
  );
}