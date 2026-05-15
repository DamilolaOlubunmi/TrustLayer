import { GridIcon, TxnIcon, FlagIcon, FeedbackIcon, SettingsIcon } from "../common/Icons";
import { ChevronIcon } from "../common/Icons";
import Logo from "../../assets/trustlayer-logo-dark.png";

export default function Sidebar({ activePage, onNavigate, user }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: GridIcon },
    { id: "transactions", label: "Transactions", icon: TxnIcon },
    { id: "flagged", label: "Flagged", icon: FlagIcon },
    { id: "feedback", label: "Feedback", icon: FeedbackIcon },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];
  return (
    <aside className="w-56 h-screen sticky top-0 bg-[#0f172a] flex flex-col shrink-0">
      {/* Logo area */}
      <div className="px-5 pb-5 border-b border-white/10">
        <div className="flex flex-col items-center">
          <img src={Logo} alt="TrustLayer Logo" width={200} />
          <div>
            <div className="text-blue-300/70 text-[10px] tracking-widest uppercase">Merchant Dashboard</div>
          </div>
        </div>
      </div>
 
      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                active ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>
 
      {/* User card at bottom */}
      <div className="p-3 border-t border-white/10">
        <button
          type="button"
          onClick={() => onNavigate("profile")}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer text-left"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.initials || "FM"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user?.platform || "TrustLayer"}</div>
            <div className="text-slate-400 text-[10px] truncate">{user?.role || "Administrator"}</div>
          </div>
          <ChevronIcon size={14} className="text-slate-500" />
        </button>
      </div>
    </aside>
  );
}
