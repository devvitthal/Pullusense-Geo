import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { Mail, Lock, LogIn, User, Phone, MapPin, X } from "lucide-react";

type Tab = "login" | "register";

interface AuthModalProps {
  open: boolean;
  defaultTab?: Tab;
  onClose: () => void;
}

export default function AuthModal({ open, defaultTab = "login", onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Sync tab when parent changes defaultTab
  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-[fadeIn_150ms_ease-out]"
    >
      <div className="relative w-full max-w-md panel p-0 overflow-hidden shadow-2xl animate-[scaleIn_200ms_ease-out]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-slate-700/50 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-700/60">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3.5 text-sm font-medium transition-all ${
                tab === t
                  ? "text-white border-b-2 border-indigo-500 bg-slate-800/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Form content */}
        <div className="p-7">
          {tab === "login" ? (
            <LoginForm onClose={onClose} onSwitch={() => setTab("register")} />
          ) : (
            <RegisterForm onClose={onClose} onSwitch={() => setTab("login")} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ────── Login Form ────── */
function LoginForm({ onClose, onSwitch }: { onClose: () => void; onSwitch: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, id, email: userEmail, name, roles } = response.data;
      loginUser(token, { id, email: userEmail, name, roles, profileComplete: true });
      onClose();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = import.meta.env.VITE_OAUTH2_GOOGLE_URL;
  };

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white">Welcome Back</h2>
        <p className="text-slate-400 mt-1 text-xs">Sign in to your PolluSense account.</p>
      </div>

      {error && (
        <div className="mb-5 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500 text-sm transition-all"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500 text-sm transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium shadow-lg hover:shadow-indigo-500/25 transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 rounded-full border-t-2 border-r-2 border-white animate-spin mr-2" />
          ) : (
            <LogIn className="h-4 w-4 mr-2" />
          )}
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-700" />
        <span className="text-slate-500 text-xs">or</span>
        <div className="flex-1 h-px bg-slate-700" />
      </div>

      <button
        onClick={handleGoogleLogin}
        type="button"
        className="mt-5 w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-white/5 border border-slate-700 hover:bg-white/10 text-white font-medium transition-all text-sm"
      >
        <span className="mr-2 text-base font-bold bg-clip-text text-transparent bg-linear-to-r from-red-400 via-yellow-400 to-green-400">
          G
        </span>
        Continue with Google
      </button>

      <p className="mt-5 text-center text-xs text-slate-400">
        Don't have an account?{" "}
        <button onClick={onSwitch} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign up
        </button>
      </p>
    </>
  );
}

/* ────── Register Form ────── */
function RegisterForm({ onSwitch }: { onClose: () => void; onSwitch: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/register", { name, email, password, mobileNumber, address });
      setSuccess("Registration successful!");
      setTimeout(() => onSwitch(), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-5">
        <h2 className="text-xl font-bold text-white">Create Account</h2>
        <p className="text-slate-400 mt-1 text-xs">Join PolluSense Geo today.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-xs">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg text-xs">
          {success}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500 text-sm transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500 text-sm transition-all"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500 text-sm transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              pattern="^[+]?[0-9]{7,15}$"
              title="Enter a valid mobile number (7–15 digits)"
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500 text-sm transition-all"
              placeholder="+91 9876543210"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Address</label>
          <div className="relative">
            <div className="absolute top-2.5 left-0 pl-3 flex items-start pointer-events-none">
              <MapPin className="h-4 w-4 text-slate-500" />
            </div>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={2}
              maxLength={500}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500 text-sm transition-all resize-none"
              placeholder="123 Main Street, City, Country"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-lg transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 rounded-full border-t-2 border-r-2 border-white animate-spin mr-2" />
          ) : (
            <LogIn className="h-4 w-4 mr-2" />
          )}
          {loading ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <button onClick={onSwitch} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
          Sign in
        </button>
      </p>
    </>
  );
}
