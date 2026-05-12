import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Props:
 *  label      – string   e.g. "TRANSACTIONS EVALUATED"
 *  value      – string   e.g. "1,247"
 *  trend      – string?  e.g. "+12%" (positive) or "-5%" (negative)
 *  icon       – ReactNode
 *  iconBg     – CSS color string for icon background
 *  iconColor  – CSS color string for icon fill
 *  valueColor – CSS color string for value text (optional)
 *  delay      – number   animation delay class suffix (1–5)
 */
export default function StatCard({
  label,
  value,
  trend,
  icon,
  iconBg = "#eff6ff",
  iconColor = "#2563eb",
  valueColor,
  delay = 1,
}) {
  const isPositive = trend && !trend.startsWith("-");

  return (
    <div className={`stat-card fade-in fade-in-${delay}`}>
      <div className="stat-card-header">
        <span className="stat-label">{label}</span>
        <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>

      <div className="stat-value" style={valueColor ? { color: valueColor } : {}}>
        {value}
      </div>

      {trend && (
        <span className={`stat-trend ${isPositive ? "trend-up" : "trend-down"}`}>
          {isPositive
            ? <TrendingUp size={11} />
            : <TrendingDown size={11} />}
          {trend}
        </span>
      )}
    </div>
  );
}
