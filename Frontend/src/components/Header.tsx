import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  lastRefresh: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function Header({ lastRefresh, refreshing, onRefresh }: HeaderProps) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showRefresh = location.pathname !== "/profile";

  return (
    <header className="navbar sticky top-0 z-50 px-6 py-2 h-16 flex items-center justify-between gap-4">
      {/* Logo + Brand — click navigates to dashboard */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        </div>
        <div className="leading-none">
          <span className="text-sm font-bold text-white tracking-tight">PolluSense</span>
          <span className="text-sm font-light text-slate-400"> Geo</span>
        </div>
      </button>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1">
        {[
          { to: "/dashboard", label: "Dashboard" },
          { to: "/map", label: "Map" },
          { to: "/", label: "Home" },
          { to: "/about", label: "About" },
          { to: "/contact", label: "Contact" },
        ].map(({ to, label }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              location.pathname === to
                ? "text-white bg-slate-800/60"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {showRefresh && (
          <>
            {lastRefresh && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-800/40 border border-slate-700/40 px-2.5 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                {lastRefresh.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/25"
            >
              <svg
                width="11"
                height="11"
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
              {refreshing ? "Syncing…" : "Refresh"}
            </button>
          </>
        )}

        {/* User avatar + dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-700/50 group"
            >
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                {initials}
              </div>
              <span className="hidden sm:block text-xs font-medium text-slate-300 group-hover:text-white transition-colors max-w-27.5 truncate">
                {user.name}
              </span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`text-slate-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 glass-strong py-1 z-50">
                <div className="px-3 py-2.5 border-b border-slate-700/50 mb-1">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                  My Profile
                </button>

                <div className="border-t border-slate-700/40 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logoutUser();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
