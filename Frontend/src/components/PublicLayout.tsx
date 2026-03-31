import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

type AuthTab = "login" | "register";

export default function PublicLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: AuthTab }>({
    open: false,
    tab: "login",
  });

  const openAuth = (tab: AuthTab) => setAuthModal({ open: true, tab });
  const closeAuth = () => setAuthModal((s) => ({ ...s, open: false }));

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ── */}
      <header className="navbar sticky top-0 z-50 px-10 lg:px-16 py-2 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <div className="leading-none">
            <span className="text-base font-bold text-white tracking-tight">
              PolluSense
            </span>
            <span className="text-base font-light text-slate-400"> Geo</span>
          </div>
        </Link>

        {/* Center nav links */}
        <nav className="hidden sm:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  active
                    ? "text-white bg-slate-800/60 border border-slate-700/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <Link
              to="/dashboard"
              className="px-5 py-2 rounded-md text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm shadow-indigo-600/25"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <button
                onClick={() => openAuth("login")}
                className="px-5 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth("register")}
                className="px-5 py-2 rounded-md text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm shadow-indigo-600/25"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── Auth Modal ── */}
      <AuthModal open={authModal.open} defaultTab={authModal.tab} onClose={closeAuth} />

      {/* ── Page content ── */}
      <main className="flex-1 flex flex-col">
        <Outlet context={{ openAuth }} />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/60 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-white">
                  PolluSense Geo
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                IoT-powered air quality monitoring for a cleaner, healthier
                world.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Account
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => openAuth("login")}
                    className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    Sign In
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openAuth("register")}
                    className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    Create Account
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} PolluSense Geo. All rights
              reserved.
            </p>
            <p className="text-xs text-slate-600">
              Built by Vitthal, Shivanshi, Sumit &amp; Rupali
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
