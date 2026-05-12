import {
  BarChart2, Ban, Flag, ShieldCheck,
  Clock, Tag, Shield, Activity, ArrowRight,
  AlertTriangle,
} from "lucide-react";

import StatCard from "../components/StatCard";
import TransactionTable from "../components/TransactionTable";
import DecisionChart from "../components/DecisionChart";

import {
  STATS,
  DECISION_BREAKDOWN,
  TOP_RISK_SIGNALS,
  RECENT_TRANSACTIONS,
  DECISION_CHART_DATA,
} from "../data/mockData";

const SIGNAL_ICONS = {
  clock:    <Clock size={13} />,
  tag:      <Tag size={13} />,
  shield:   <Shield size={13} />,
  activity: <Activity size={13} />,
};

export default function Overview({ onNavigate }) {
  return (
    <div className="page-scroll fade-in">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Last 30 days · Updated just now</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Transactions Evaluated"
          value={STATS.transactionsEvaluated.toLocaleString()}
          trend={STATS.trend}
          icon={<BarChart2 size={15} />}
          iconBg="#eff6ff"
          iconColor="#2563eb"
          delay={1}
        />
        <StatCard
          label="Transactions Blocked"
          value={STATS.transactionsBlocked.toLocaleString()}
          icon={<Ban size={15} />}
          iconBg="#fff1f2"
          iconColor="#e11d48"
          valueColor="#e11d48"
          delay={2}
        />
        <StatCard
          label="Flagged for Review"
          value={STATS.flaggedForReview.toLocaleString()}
          icon={<Flag size={15} />}
          iconBg="#fffbeb"
          iconColor="#d97706"
          valueColor="#d97706"
          delay={3}
        />
        <StatCard
          label="Value Protected"
          value="₦18.4M"
          icon={<ShieldCheck size={15} />}
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          valueColor="#16a34a"
          delay={4}
        />
      </div>

      {/* Main content grid */}
      <div className="content-grid">
        {/* LEFT — Transactions + Chart */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Recent Transactions */}
          <div className="card fade-in fade-in-5">
            <div className="card-header">
              <span className="card-title">Recent Transactions</span>
              <button className="view-all-link" onClick={() => onNavigate("transactions")}>
                View All <ArrowRight size={13} />
              </button>
            </div>
            <TransactionTable
              transactions={RECENT_TRANSACTIONS}
              limit={6}
            />
          </div>

          {/* Decision Distribution Chart */}
          <div className="card fade-in fade-in-5">
            <div className="card-header">
              <span className="card-title">Decision Distribution — Last 7 Days</span>
            </div>
            <div className="chart-wrapper">
              <DecisionChart data={DECISION_CHART_DATA} />
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                {[
                  { label: "Allow",  color: "#22c55e" },
                  { label: "Review", color: "#f59e0b" },
                  { label: "Block",  color: "#ef4444" },
                ].map(({ label, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                    <span style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Breakdown + Signals */}
        <div className="right-panel">
          {/* Decision Breakdown */}
          <div className="card fade-in fade-in-3">
            <div className="card-header">
              <span className="card-title">Decision Breakdown</span>
            </div>
            <div style={{ padding: "4px 20px 18px" }}>
              {/* Bar */}
              <div className="breakdown-bar-track">
                <div
                  className="bar-seg bar-allow"
                  style={{ width: `${DECISION_BREAKDOWN.allow.pct}%` }}
                />
                <div
                  className="bar-seg bar-review"
                  style={{ width: `${DECISION_BREAKDOWN.review.pct}%` }}
                />
                <div
                  className="bar-seg bar-block"
                  style={{ width: `${DECISION_BREAKDOWN.block.pct}%` }}
                />
              </div>

              {/* Legend */}
              <div className="breakdown-legend">
                {[
                  { key: "allow",  label: "ALLOW",  color: "#22c55e", pct: DECISION_BREAKDOWN.allow.pct  },
                  { key: "review", label: "REVIEW", color: "#f59e0b", pct: DECISION_BREAKDOWN.review.pct },
                  { key: "block",  label: "BLOCK",  color: "#ef4444", pct: DECISION_BREAKDOWN.block.pct  },
                ].map(({ key, label, color, pct }) => (
                  <div key={key} className="legend-item">
                    <div className="legend-dot-label">
                      <span className="legend-dot" style={{ background: color }} />
                      {label}
                    </div>
                    <span className="legend-value">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Risk Signals */}
          <div className="card fade-in fade-in-4">
            <div className="card-header">
              <span className="card-title">Top Risk Signals</span>
            </div>
            {TOP_RISK_SIGNALS.map((signal) => (
              <div key={signal.name} className="risk-signal-row">
                <div className="signal-left">
                  <div className="signal-icon-wrap">
                    {SIGNAL_ICONS[signal.icon] ?? <Activity size={13} />}
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem" }}>
                    {signal.name}
                  </span>
                </div>
                <span className="signal-count">{signal.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert banner */}
      <div className="alert-banner">
        <AlertTriangle size={16} style={{ color: "#d97706", flexShrink: 0 }} />
        <span>Some transactions require manual outcome reporting to improve model accuracy.</span>
        <button className="alert-banner-action" onClick={() => onNavigate("feedback")}>
          Report outcomes <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
