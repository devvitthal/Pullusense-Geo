import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      window.location.href = `/login?error=${encodeURIComponent(error)}`;
      return;
    }

    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Decode email from the JWT subject claim
    let email = '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      email = payload.sub ?? '';
    } catch {
      window.location.href = '/login?error=InvalidToken';
      return;
    }

    // Write token first so the profile request is authenticated via the Vite proxy
    localStorage.setItem('token', token);

    // Fetch the real profile (Vite proxies /api → http://localhost:8080)
    // Fall back to JWT-decoded info so a transient error never blocks login
    fetch('/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((profile) => {
        const user = {
          id: profile?.id ?? 0,
          email: profile?.email ?? email,
          name: profile?.name ?? email.split('@')[0],
          roles: ['ROLE_USER'],
        };
        localStorage.setItem('user', JSON.stringify(user));

        // Redirect to complete-profile if mobile/address are missing
        if (!profile?.mobileNumber || !profile?.address) {
          window.location.href = '/complete-profile';
          return;
        }
        window.location.href = '/dashboard';
      })
      .catch(() => {
        // Profile fetch failed — use what we decoded from the token
        const user = { id: 0, email, name: email.split('@')[0], roles: ['ROLE_USER'] };
        localStorage.setItem('user', JSON.stringify(user));
        // Can't verify completeness; send to complete-profile to be safe
        window.location.href = '/complete-profile';
      })
  }, [token, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080c14] text-white">
      <div className="panel p-8 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-[#6366f1] animate-spin mb-4" />
        <p className="text-slate-300">Completing sign in…</p>
      </div>
    </div>
  );
}
