import { useState } from "react";
import StatCard from "../components/Dashboard/StatCard";
import TransactionTable from "../components/Dashboard/TransactionTable";
import DecisionBreakdown from "../components/Dashboard/DecisionBreakdown";
import TopRiskSignals from "../components/Dashboard/RiskChart";
import { BarChartIcon, BlockIcon, FlagIcon, ShieldIcon } from "../components/common/Icons";
import { formatNGN } from "../utilis/utilis";
import { MOCK_TRANSACTIONS } from "../data/mock/transactions";
import { useNavigate } from "react-router-dom";

export default

function OverviewPage({ transactions, onSelectTx }) {
  const blocked = transactions.filter(t => t.decision === "BLOCK").length;
  const reviewed = transactions.filter(t => t.decision === "REVIEW").length;
  const totalValue = transactions.filter(t => t.decision !== "ALLOW").reduce((s, t) => s + t.amount, 0);
  const recent = transactions.slice(0, 6);
 
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Last 30 days · Updated just now</p>
      </div>
 
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Transactions Evaluated" value={transactions.length.toLocaleString()} icon={BarChartIcon} subtitle="+12%" />
        <StatCard label="Transactions Blocked" value={blocked} icon={BlockIcon} valueColor="text-red-600" iconColor="text-red-400" />
        <StatCard label="Flagged for Review" value={reviewed} icon={FlagIcon} valueColor="text-amber-600" iconColor="text-amber-400" />
        <StatCard
          label="Value Protected"
          value={`₦${(totalValue / 1000000).toFixed(1)}M`}
          icon={ShieldIcon}
          valueColor="text-emerald-600"
          iconColor="text-emerald-400"
        />
      </div>
 
      {/* Main content: table + sidebar widgets */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
            <button className="text-blue-600 text-sm hover:underline cursor-pointer">View All →</button>
          </div>
          <TransactionTable transactions={recent} onRowClick={onSelectTx} />
        </div>
        <div className="space-y-4">
          <DecisionBreakdown transactions={transactions} />
          <TopRiskSignals transactions={transactions} />
        </div>
      </div>
 
      {/* Warning banner */}
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-amber-800 text-sm">
          <span>⚠️</span>
          Some transactions require manual outcome reporting to improve model accuracy.
        </div>
        <button className="text-amber-700 font-semibold text-sm hover:underline whitespace-nowrap cursor-pointer">Report outcomes →</button>
      </div>
    </div>
  );
}