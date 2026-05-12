import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e8edf3",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: "0.78rem",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: "#0f172a" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 500 }}>{p.name}:</span>
          <span>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DecisionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={9} barCategoryGap="30%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
        <Bar dataKey="allow"  name="Allow"  fill="#22c55e" radius={[3,3,0,0]} />
        <Bar dataKey="review" name="Review" fill="#f59e0b" radius={[3,3,0,0]} />
        <Bar dataKey="block"  name="Block"  fill="#ef4444" radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
