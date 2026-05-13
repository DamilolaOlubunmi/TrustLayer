import React from "react";
export default

function Sidebar({ activePage, onNavigate, user }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: GridIcon },
    { id: "transactions", label: "Transactions", icon: TxnIcon },
    { id: "flagged", label: "Flagged", icon: FlagIcon },
    { id: "feedback", label: "Feedback", icon: FeedbackIcon },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];
  return (
    <aside className="w-56 min-h-screen bg-[#0f172a] flex flex-col flex-shrink-0">
      {/* Logo area */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">TrustLayer</div>
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
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user.platform}</div>
            <div className="text-slate-400 text-[10px] truncate">{user.role}</div>
          </div>
          <ChevronIcon size={14} className="text-slate-500" />
        </div>
      </div>
    </aside>
  );
}