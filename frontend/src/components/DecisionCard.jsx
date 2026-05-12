import { CheckCircle, AlertTriangle, XCircle, Cpu, Zap } from 'lucide-react';

// ─── Decision colour + icon config ───────────────────────────
const DECISION_CONFIG = {
  BLOCK: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badgeBg: 'bg-red-500',
    badgeText: 'text-white',
    badgePulse: 'block-pulse',
    textColor: 'text-red-600',
    icon: <XCircle className="w-4 h-4" />,
    label: 'BLOCK',
    barColor: 'bg-red-500',
  },
  REVIEW: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-400',
    badgeText: 'text-white',
    badgePulse: '',
    textColor: 'text-amber-600',
    icon: <AlertTriangle className="w-4 h-4" />,
    label: 'REVIEW',
    barColor: 'bg-amber-400',
  },
  ALLOW: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-white',
    badgePulse: '',
    textColor: 'text-emerald-600',
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'ALLOW',
    barColor: 'bg-emerald-500',
  },
};

// ─── Risk Score Bar ───────────────────────────────────────────
function RiskBar({ label, score, barColor }) {
  const pct = Math.round(score * 100);
  const isHigh = score >= 0.7;
  const isMed = score >= 0.4 && score < 0.7;

  const fillColor = isHigh
    ? 'bg-red-500'
    : isMed
    ? 'bg-amber-400'
    : 'bg-emerald-500';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">{label}</span>
        <span
          className={`font-display font-bold text-sm ${
            isHigh ? 'text-red-600' : isMed ? 'text-amber-600' : 'text-emerald-600'
          }`}
        >
          {score.toFixed(2)}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${fillColor} risk-bar-fill`}
          style={{ '--bar-width': `${pct}%`, width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function DecisionCard({ result }) {
  if (!result) return null;

  const config = DECISION_CONFIG[result.decision] || DECISION_CONFIG.ALLOW;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-5 fade-in-up`}>
      {/* Header: badge + final score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-display font-bold tracking-wide ${config.badgeBg} ${config.badgeText} ${config.badgePulse}`}
          >
            {config.icon}
            {config.label}
          </span>
          {result.escalated_to_llm && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
              <Cpu className="w-3 h-3" />
              AI Reasoned
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 uppercase tracking-widest font-medium">Final Score</div>
          <div className={`text-2xl font-display font-black ${config.textColor}`}>
            {result.score.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Risk bars */}
      <div className="space-y-3 mb-4">
        <RiskBar label="Vendor Risk Score" score={result.vendor_risk_score} />
        <RiskBar label="Buyer Risk Score" score={result.buyer_risk_score} />
      </div>

      {/* Primary signal + rule preset */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-md uppercase tracking-wide">
          <Zap className="w-3 h-3" />
          Primary signal: {result.primary_signal}
        </span>
        {result.rule_preset_matched && (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
            {result.rule_preset_matched.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {/* Reasons */}
      {result.reasons?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
            {result.decision === 'BLOCK'
              ? 'Why this was blocked'
              : result.decision === 'REVIEW'
              ? 'Why this needs review'
              : 'Why this was approved'}
          </p>
          <ul className="space-y-1.5">
            {result.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span
                  className={`mt-0.5 w-4 h-4.5 flex-shrink-0 rounded-full flex items-center justify-center ${
                    result.decision === 'BLOCK'
                      ? 'text-red-500'
                      : result.decision === 'REVIEW'
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {result.decision === 'BLOCK' ? (
                    <XCircle className="w-3.5 h-4" />
                  ) : result.decision === 'REVIEW' ? (
                    <AlertTriangle className="w-3.5 h-4" />
                  ) : (
                    <CheckCircle className="w-3.5 h-4" />
                  )}
                </span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended action */}
      {result.recommended_action && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            <span className="font-semibold">Recommended:</span>{' '}
            {result.recommended_action}
          </p>
        </div>
      )}
    </div>
  );
}