import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, go straight to dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Someone else's session open — don't touch it, just block
        setError('This portal is for administrators only.');
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      // useEffect above handles the redirect once user is set
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
      setIsLoading(false);
    }
  };

  // After login resolves, if user came back as non-admin, sign them out
  useEffect(() => {
    if (user && user.role !== 'admin') {
      logout();
      setError('Access denied. This portal is for administrators only.');
      setIsLoading(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Minimal branding — no public links */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-accent-light rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={28} className="text-accent" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Administrator Access</h1>
          <p className="text-sm text-text-secondary mt-1">Restricted portal — authorised users only</p>
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
            placeholder="admin@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 bottom-2.5 text-text-tertiary hover:text-text-secondary"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full mt-2">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
