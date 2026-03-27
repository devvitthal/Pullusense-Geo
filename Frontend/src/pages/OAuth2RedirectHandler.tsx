import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const error = searchParams.get('error');
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  useEffect(() => {
    if (token) {
      // Decode the JWT or fetch user details. Since our frontend doesn't have a jwt decode lib readily available
      // we can fetch the user details from the backend using the token, or we could just use a generic user.
      // Easiest is to decode it basically using atob if it's a standard JWT or fetch user profile from an endpoint.
      // For now, let's create a minimal user and set the token.
      
      const parts = token.split('.');
      if(parts.length === 3) {
          try {
              const payload = JSON.parse(atob(parts[1]));
              const user = {
                  id: 0, 
                  email: payload.sub,
                  name: payload.sub.split('@')[0], 
                  roles: ['ROLE_USER']
              };
              loginUser(token, user);
              navigate('/dashboard', { replace: true });
          } catch(e) {
              console.error("Failed to parse token", e);
              navigate('/login?error=InvalidToken', { replace: true });
          }
      }
    } else if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [token, error, navigate, loginUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080c14] text-white">
      <div className="panel p-8 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-[#6366f1] animate-spin mb-4" />
        <p className="text-slate-300">Completing sign in...</p>
      </div>
    </div>
  );
}
