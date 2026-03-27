import React, { useState, useEffect } from "react";
import { userApi, type UserProfile, type UpdateProfileRequest } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

function GoogleIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function Profile() {
  const { user, loginUser, token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    userApi
      .getProfile()
      .then((p) => {
        setProfile(p);
        setName(p.name);
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load profile." }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    const req: UpdateProfileRequest = { name: name.trim() };
    if (newPassword) {
      req.currentPassword = currentPassword;
      req.newPassword = newPassword;
    }

    setSaving(true);
    try {
      const updated = await userApi.updateProfile(req);
      setProfile(updated);
      setName(updated.name);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (token && user) {
        loginUser(token, { ...user, name: updated.name });
      }
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update profile.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 py-32">
        <Spinner size={36} />
      </div>
    );
  }

  const isGoogle = profile?.provider === "GOOGLE";

  return (
    <div className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
      {/* Page heading */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account information and security settings.
        </p>
      </div>

      {/* Identity card */}
      <div className="panel p-5 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-indigo-600/20 shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-white truncate">{profile?.name}</p>
          <p className="text-xs text-slate-400 truncate mt-0.5">{profile?.email}</p>
          <span
            className={`inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full text-xs font-medium border ${
              isGoogle
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                : "bg-slate-700/60 text-slate-400 border-slate-600/50"
            }`}
          >
            {isGoogle ? <GoogleIcon /> : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
            {isGoogle ? "Google Account" : "Local Account"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Account info */}
        <div className="panel p-6 space-y-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-700/50 pb-3">
            Account Information
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={profile?.email || ""}
              disabled
              className="w-full px-3.5 py-2.5 bg-slate-900/30 border border-slate-700/40 rounded-lg text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-600 mt-1.5">Email address cannot be changed.</p>
          </div>
        </div>

        {/* Password section — only for local accounts */}
        {!isGoogle && (
          <div className="panel p-6 space-y-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-700/50 pb-3">
              Change Password
            </h2>
            <p className="text-xs text-slate-500">Leave these fields blank to keep your current password.</p>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
        )}

        {/* Feedback message */}
        {message && (
          <div
            className={`px-4 py-3 rounded-lg text-sm border flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/20"
          >
            {saving && <Spinner size={13} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
