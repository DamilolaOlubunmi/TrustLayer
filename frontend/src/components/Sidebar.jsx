import {
  LayoutDashboard,
  ArrowLeftRight,
  Flag,
  MessageSquare,
  Settings,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "overview",      label: "Overview",     icon: LayoutDashboard },
  { id: "transactions",  label: "Transactions", icon: ArrowLeftRight  },
  { id: "flagged",       label: "Flagged",      icon: Flag            },
  { id: "feedback",      label: "Feedback",     icon: MessageSquare   },
  { id: "settings",      label: "Settings",     icon: Settings        },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">TrustLayer</div>
        <div className="sidebar-brand-sub">Merchant Dashboard</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item${activePage === id ? " active" : ""}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="user-row">
          <div className="user-avatar">FM</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-info-name">Fmarket</div>
            <div className="user-info-role">Administrator</div>
          </div>
          <ChevronRight size={13} className="user-expand" />
        </div>
      </div>
    </aside>
  );
}
