import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { login, user, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  // Once AuthContext resolves the user after login, redirect by role
  useEffect(() => {
    if (user) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [user]);

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email address above first.'); return; }
    setResetLoading(true);
    setError('');
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      setResetSent(true);
    } catch {
      setError('Failed to send reset email. Try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation handled by the useEffect above once user is set
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent/5 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-light to-surface-alt opacity-80" />
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-accent mb-3">HouseTrack</h1>
          <p className="text-xl text-text-primary font-semibold mb-4">Manage your rentals with confidence</p>
          <p className="text-sm text-text-secondary leading-relaxed">
            Track your properties, tenants, payments, and complaints from a single dashboard.
            Built for landlords in Cameroon.
          </p>
          <div className="mt-10 space-y-4">
            {['Multi-property management', 'Mobile Money payments', 'Auto receipts & reports'].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-text-primary font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* City illustration */}
          <div className="mt-10">
            <svg viewBox="0 0 360 200" width="100%" xmlns="http://www.w3.org/2000/svg">
              {/* ambient glow behind center building */}
              <ellipse cx="166" cy="140" rx="110" ry="50" fill="#C97D23" opacity="0.05" />

              {/* Building A — tallest, left */}
              <rect x="10" y="24" width="82" height="172" rx="3" fill="#1B1F3B" />
              {/* rooftop water tank */}
              <rect x="35" y="15" width="24" height="10" rx="2" fill="#141828" />
              <rect x="45" y="7" width="3" height="10" fill="#1E2240" />
              {/* windows */}
              {[[1,0,1],[1,1,0],[0,1,1],[1,0,0],[1,1,1],[0,1,0],[1,0,1],[0,0,1]].flatMap((row, ri) =>
                row.map((lit, ci) => (
                  <rect key={`a-${ri}-${ci}`} x={23 + ci * 22} y={34 + ri * 17} width={13} height={9} rx={1}
                    fill={lit ? '#C97D23' : '#2D2A24'} opacity={lit ? 0.8 : 0.35} />
                ))
              )}
              {/* door */}
              <rect x="43" y="168" width="16" height="28" rx="2" fill="#C97D23" opacity="0.55" />

              {/* Building B — center */}
              <rect x="112" y="62" width="108" height="134" rx="3" fill="#111827" />
              {/* amber accent strip at top */}
              <rect x="112" y="62" width="108" height="5" rx="0" fill="#C97D23" opacity="0.18" />
              {/* windows */}
              {[[1,0,1,1],[0,1,1,0],[1,1,0,1],[0,1,0,0],[1,0,1,1],[0,0,1,0]].flatMap((row, ri) =>
                row.map((lit, ci) => (
                  <rect key={`b-${ri}-${ci}`} x={125 + ci * 22} y={72 + ri * 17} width={13} height={9} rx={1}
                    fill={lit ? '#C97D23' : '#2D2A24'} opacity={lit ? 0.8 : 0.35} />
                ))
              )}
              {/* door */}
              <rect x="158" y="170" width="22" height="26" rx="2" fill="#C97D23" opacity="0.62" />

              {/* Building C — right */}
              <rect x="240" y="38" width="88" height="158" rx="3" fill="#1C1C1E" />
              {/* rooftop cornice */}
              <rect x="240" y="30" width="88" height="10" rx="2" fill="#141414" />
              {/* windows */}
              {[[0,1,1],[1,0,1],[1,1,0],[0,1,0],[1,0,1],[1,1,1],[0,1,0]].flatMap((row, ri) =>
                row.map((lit, ci) => (
                  <rect key={`c-${ri}-${ci}`} x={253 + ci * 22} y={48 + ri * 17} width={13} height={9} rx={1}
                    fill={lit ? '#C97D23' : '#2D2A24'} opacity={lit ? 0.8 : 0.35} />
                ))
              )}
              {/* door */}
              <rect x="272" y="162" width="16" height="34" rx="2" fill="#C97D23" opacity="0.55" />

              {/* Ground line */}
              <rect x="0" y="196" width="360" height="4" fill="#C97D23" opacity="0.18" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right side — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary lg:hidden mb-1">
              <span className="text-accent">HouseTrack</span>
            </h1>
            <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
            <p className="text-sm text-text-secondary mt-1">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-2.5 text-text-tertiary hover:text-text-secondary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              Sign In
            </Button>
          </form>

          {resetSent ? (
            <p className="text-center text-sm text-success mt-4">Password reset email sent — check your inbox.</p>
          ) : (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="w-full text-center text-sm text-text-secondary hover:text-accent mt-4 transition-colors flex items-center justify-center gap-1.5"
            >
              {resetLoading && <Loader2 size={13} className="animate-spin" />}
              Forgot password?
            </button>
          )}

          <p className="text-center text-sm text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
