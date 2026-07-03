import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { api } from '../../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.slice(1));

        const code = params.get('code');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (code) {
          // PKCE flow (default in Supabase v2) — exchange the one-time code
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data.session) await redirectByRole(data.session.access_token);
          else navigate('/login', { replace: true });

        } else if (accessToken && refreshToken) {
          // Implicit flow — tokens are in the hash
          if (type === 'recovery' || type === 'invite') {
            // Establish the session first so /set-password can call updateUser()
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            navigate('/set-password', { replace: true });
            return;
          }
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (data.session) await redirectByRole(data.session.access_token);
          else navigate('/login', { replace: true });

        } else {
          // No incoming tokens — normal nav, check existing session
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (data.session) await redirectByRole(data.session.access_token);
          else navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('AuthCallback error:', err);
        const msg = err?.response?.data?.error || err?.message || 'Confirmation failed.';
        setError(msg);
      }
    };

    // Use a hard redirect (window.location.href) so AuthContext reinitialises
    // completely with the new session, eliminating the race condition where
    // ProtectedRoute still sees the old role while AuthContext is mid-update.
    const redirectByRole = async (token) => {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await api.post('/auth/me');
      if (res.data.success && res.data.data) {
        const role = res.data.data.role;
        if (role === 'landlord') window.location.href = '/landlord/dashboard';
        else if (role === 'tenant') window.location.href = '/tenant/dashboard';
        else if (role === 'admin') window.location.href = '/admin/dashboard';
        else window.location.href = '/';
      } else {
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-surface border border-border rounded-card p-8 text-center max-w-sm w-full">
          <p className="text-danger text-sm mb-4">{error}</p>
          <a href="/login" className="text-accent font-semibold text-sm hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full" />
        <p className="text-sm text-text-secondary">Confirming your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
