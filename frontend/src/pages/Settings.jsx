import { useState } from "react";
import { Copy, RefreshCw, Info, Eye, EyeOff } from "lucide-react";

export default function Settings() {
  const [tab, setTab]         = useState("profile");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [pwStrength, setPwStrength] = useState("Moderate");

  const handleCopy = () => {
    navigator.clipboard.writeText("sk-tl-••••••••••••••••••••••");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-scroll fade-in">
      <div className="page-header">
        <h1 className="page-title">Account</h1>
        <p className="page-subtitle">Manage your profile and API credentials</p>
      </div>

      <div className="settings-wrap">
        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`settings-tab${tab === "profile" ? " active" : ""}`}
            onClick={() => setTab("profile")}
          >
            Profile
          </button>
          <button
            className={`settings-tab${tab === "credentials" ? " active" : ""}`}
            onClick={() => setTab("credentials")}
          >
            Credentials
          </button>
        </div>

        {/* Profile Tab */}
        {tab === "profile" && (
          <div className="card" style={{ padding: "28px" }}>
            {/* Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  marginBottom: 12,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                }}
              >
                FM
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Fmarket Admin</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Administrator</div>
            </div>

            {/* Fields */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" defaultValue="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" defaultValue="admin@fmarket.com" disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Platform Name</label>
              <input className="form-input" defaultValue="Fmarket" />
            </div>

            <hr className="section-divider" />
            <div className="section-heading">Change Password</div>

            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" defaultValue="••••••••" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" defaultValue="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" defaultValue="••••••••" />
              </div>
            </div>

            {/* Strength bar */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {["Weak", "Moderate", "Strong"].map((s, i) => (
                  <div
                    key={s}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 99,
                      background: i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : "#e5e7eb",
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Strength: {pwStrength}
              </span>
            </div>

            <button className="btn-primary" style={{ width: "100%" }}>
              Save Changes
            </button>
          </div>
        )}

        {/* Credentials Tab */}
        {tab === "credentials" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* API Keys */}
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 6 }}>API Keys</div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 18 }}>
                Use these keys to authenticate your requests with the TrustLayer API.
              </p>

              <div className="form-group">
                <label className="form-label">API Secret Key</label>
                <div className="api-key-row">
                  <input
                    className="form-input mono"
                    type={showKey ? "text" : "password"}
                    defaultValue="sk-tl-••••••••••••••••••••••"
                    readOnly
                  />
                  <button className="copy-btn" onClick={() => setShowKey((v) => !v)} title="Toggle visibility">
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button className="copy-btn" onClick={handleCopy} title="Copy key">
                    <Copy size={15} style={copied ? { color: "#22c55e" } : {}} />
                  </button>
                </div>
                <p className="hint-text">
                  <Info size={11} />
                  Never share your secret API keys in public places.
                </p>
              </div>

              <hr className="section-divider" />

              <button className="btn-secondary" style={{ gap: 8 }}>
                <RefreshCw size={14} />
                Regenerate API Key
              </button>
            </div>

            {/* Webhook */}
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 6 }}>
                Webhook Endpoint
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 18 }}>
                Configure where you would like to receive real-time notifications.
              </p>

              <div className="form-group">
                <label className="form-label">Endpoint URL</label>
                <input
                  className="form-input mono"
                  defaultValue="https://fmarket-api.com/v1/callback"
                />
              </div>

              <button className="btn-primary">Update Endpoint</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
