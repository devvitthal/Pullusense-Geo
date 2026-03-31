import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const { loginUser } = useAuth();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const token = searchParams.get('token');
  const hasError = searchParams.has('error');
  const error = searchParams.get('error');

  useEffect(() => {
    if (hasError) {
      setRedirectTo(`/?authError=${encodeURIComponent(error || 'OAuth2 authentication failed')}`);
      return;
    }

    if (!token) {
      setRedirectTo('/');
      return;
    }

    // Decode email from the JWT subject claim
    let email = '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      email = payload.sub ?? '';
    } catch {
      setRedirectTo('/?authError=InvalidToken');
      return;
    }

    // Fetch the real profile (Vite proxies /api → http://localhost:8080)
    fetch('/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((profile) => {
        const isComplete = !!(profile?.mobileNumber && profile?.address);
        const user = {
          id: profile?.id ?? 0,
          email: profile?.email ?? email,
          name: profile?.name ?? email.split('@')[0],
          roles: ['ROLE_USER'],
          profileComplete: isComplete,
        };
        loginUser(token, user);
        setRedirectTo(isComplete ? '/dashboard' : '/complete-profile');
      })
      .catch(() => {
        const user = { id: 0, email, name: email.split('@')[0], roles: ['ROLE_USER'], profileComplete: true };
        loginUser(token, user);
        setRedirectTo('/dashboard');
      });
  }, [token, hasError, error, loginUser]);

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080c14] text-white">
      <div className="panel p-8 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-[#6366f1] animate-spin mb-4" />
        <p className="text-slate-300">Completing sign in…</p>
      </div>
    </div>
  );
}
