import { Bell, Antenna } from "lucide-react";

export default function Topbar({ merchantName = "Fmarket" }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-merchant">{merchantName}</span>
        <span className="status-badge">
          <span className="status-dot" />
          Live
        </span>
      </div>

      <div className="topbar-right">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={17} />
          <span className="notif-dot" />
        </button>
        <button className="icon-btn" aria-label="Status">
          <Antenna size={17} />
        </button>
        <div className="topbar-avatar" aria-label="User profile">FM</div>
      </div>
    </header>
  );
}
