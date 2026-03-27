import React, { useState, useEffect } from 'react';
import { Phone, MapPin, CheckCircle } from 'lucide-react';
import api from '../api/axiosConfig';

export default function CompleteProfile() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // On mount: if the profile is already complete, skip straight to dashboard.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    api.get('/user/profile')
      .then((res) => {
        if (res.data?.profileComplete) {
          // Patch localStorage and move on
          const stored = localStorage.getItem('user');
          if (stored) {
            const u = JSON.parse(stored);
            localStorage.setItem('user', JSON.stringify({ ...u, profileComplete: true }));
          }
          window.location.href = '/dashboard';
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c14] text-white">
        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-[#6366f1] animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.put('/user/profile', { mobileNumber, address });

      // Mark profile as complete in localStorage so the route guard doesn't bounce us
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...u, profileComplete: true }));
      }

      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[25vw] h-[25vw] min-w-[250px] min-h-[250px] bg-cyan-600/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md panel p-8 z-10 transition-all duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Complete Your Profile
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            We need a few more details to finish setting up your account.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Mobile Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                pattern="^[+]?[0-9]{7,15}$"
                title="Enter a valid mobile number (7–15 digits)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500 transition-all"
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                <MapPin className="h-5 w-5 text-slate-500" />
              </div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={3}
                maxLength={500}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500 transition-all resize-none"
                placeholder="123 Main Street, City, Country"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-[#080c14] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-t-2 border-r-2 border-white animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-5 w-5 mr-2" />
            )}
            {loading ? 'Saving…' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
