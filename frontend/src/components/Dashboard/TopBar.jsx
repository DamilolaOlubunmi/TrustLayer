import { BellIcon } from "../common/Icons";


export default function TopBar({ pageName, platform, status = "LIVE", onLogout }) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-widest text-gray-400">{pageName}</span>
          <span className="font-semibold text-gray-800">{platform}</span>
        </div>
        {status && (
          <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            {status}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 cursor-pointer">
        <BellIcon size={18} className="text-[#022448]" />
        <button
          type="button"
          onClick={onLogout}
          className="text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          Log out
        </button>
      </div>
    </header>
  );
}