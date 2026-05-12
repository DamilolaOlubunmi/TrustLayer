const MAP = {
  ALLOW:  { cls: "badge-allow",  dot: "#22c55e" },
  REVIEW: { cls: "badge-review", dot: "#f59e0b" },
  BLOCK:  { cls: "badge-block",  dot: "#ef4444" },
};

export default function DecisionBadge({ decision }) {
  const cfg = MAP[decision] ?? MAP.ALLOW;
  return (
    <span className={`decision-badge ${cfg.cls}`}>
      <span className="badge-dot" style={{ background: cfg.dot }} />
      {decision}
    </span>
  );
}
