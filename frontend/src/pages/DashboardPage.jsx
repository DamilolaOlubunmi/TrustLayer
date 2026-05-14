import StatCard from "../components/Dashboard/StatCard";
import TransactionTable from "../components/Dashboard/TransactionTable";
import DecisionBreakdown from "../components/Dashboard/DecisionBreakdown";
import TopRiskSignals from "../components/Dashboard/RiskChart";
import { BarChartIcon, BlockIcon, FlagIcon, ShieldIcon } from "../components/common/Icons";
import { Link } from "react-router";

export default

function OverviewPage({ transactions = [], onSelectTx = () => {} }) {
  const blocked = transactions.filter(t => t.decision === "BLOCK").length;
  const reviewed = transactions.filter(t => t.decision === "REVIEW").length;
  const totalValue = transactions.filter(t => t.decision !== "ALLOW").reduce((s, t) => s + t.amount, 0);
  const recent = transactions.slice(0, 6);
 
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#022448]">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Last 30 days · Updated just now</p>
      </div>
 
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
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
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-[#022448]">Recent Transactions</h2>
            <Link to="/transactions"><button className="text-blue-600 text-sm hover:underline cursor-pointer">View All →</button></Link>
          </div>
          <TransactionTable transactions={recent} onRowClick={onSelectTx} />
        </div>
        <div className="space-y-4">
          <DecisionBreakdown transactions={transactions} />
          <TopRiskSignals transactions={transactions} />
        </div>
      </div>

      {!transactions.length && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-4 text-sm text-gray-500">
          No transactions have been returned by the backend yet. Once your API exposes evaluated transactions, this dashboard will render them here.
        </div>
      )}
 
    
    </div>
  );
}
