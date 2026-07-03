import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let unsubscribe = () => {};

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setSession(session);
        await fetchUserProfile(session.access_token);
      } else {
        setLoading(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setSession(session);

        if (!session) {
          if (event === 'SIGNED_OUT') {
            userRef.current = null;
            setUser(null);
          }
          setLoading(false);
          return;
        }

        if (userRef.current && (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
          // Keep the axios default header in sync with the refreshed token
          if (event === 'TOKEN_REFRESHED') {
            api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
          }
          return;
        }

        await fetchUserProfile(session.access_token);
      });

      unsubscribe = () => subscription.unsubscribe();
    };

    initializeAuth().catch(err => {
      console.error('Auth init failed:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await api.post('/auth/me');
      if (res.data.success) {
        userRef.current = res.data.data;
        setUser(res.data.data);
      }
    } catch (err) {
      const status = err?.response?.status;
      // Only log out on a real "not authorised" response.
      // Network errors (503, no response) keep the existing user in state.
      if (status === 401) {
        userRef.current = null;
        setUser(null);
      } else {
        console.warn('fetchUserProfile failed (keeping session):', err?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDashboardPath = (role) => {
    if (role === 'landlord') return '/landlord/dashboard';
    if (role === 'tenant') return '/tenant/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const login = async (email, password) => {
    if (!supabase) throw new Error('Auth service not configured');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (!res.data.success) throw new Error(res.data.error || 'Registration failed');
    return res.data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    userRef.current = null;
    setUser(null);
    setSession(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, register, logout, getDashboardPath }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
