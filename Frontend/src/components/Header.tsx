import type { AppRoute } from "../types";

interface HeaderProps {
  route: AppRoute;
  onNavigate: (r: AppRoute) => void;
  lastRefresh: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function Header({
  route,
  onNavigate,
  lastRefresh,
  refreshing,
  onRefresh,
}: HeaderProps) {
  return (
    <header className="navbar sticky top-0 z-50 px-6 h-14 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Logo mark */}
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          {route.view === "history" && (
            <>
              <button
                onClick={() => onNavigate({ view: "dashboard" })}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Dashboard
              </button>
              <span className="text-slate-700">/</span>
            </>
          )}
          <span className="text-sm font-semibold text-white">
            {route.view === "history" && route.nodeId
              ? route.nodeId
              : "PolluSense Geo"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {lastRefresh && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            {lastRefresh.toLocaleTimeString()}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={refreshing ? "animate-spin" : ""}
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>
    </header>
  );
}
