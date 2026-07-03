import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, MailCheck } from 'lucide-react';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register({ full_name: fullName, email, password });
      setRegistered(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-surface border border-border rounded-card p-10 text-center max-w-md w-full shadow-card">
          <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-5">
            <MailCheck size={30} className="text-accent" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Check your email</h2>
          <p className="text-sm text-text-secondary mb-1">
            We sent a confirmation link to
          </p>
          <p className="text-sm font-semibold text-text-primary mb-6">{email}</p>
          <p className="text-xs text-text-tertiary mb-6">
            Click the link in the email to activate your account, then come back to sign in.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-3 bg-accent text-white rounded-btn text-sm font-semibold hover:bg-[#B8711A] transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent/5 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-light to-surface-alt opacity-80" />
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-accent mb-3">HouseTrack</h1>
          <p className="text-xl text-text-primary font-semibold mb-4">Start managing your rentals today</p>
          <p className="text-sm text-text-secondary leading-relaxed">
            Join landlords who use HouseTrack to manage their properties,
            collect rent via mobile money, and keep track of everything in one place.
          </p>

          {/* Townhouse illustration */}
          <div className="mt-10">
            <svg viewBox="0 0 360 230" width="100%" xmlns="http://www.w3.org/2000/svg">
              {/* ambient glow */}
              <ellipse cx="180" cy="145" rx="110" ry="55" fill="#C97D23" opacity="0.05" />

              {/* parapet teeth */}
              <rect x="100" y="34" width="20" height="17" rx="2" fill="#141414" />
              <rect x="170" y="34" width="20" height="17" rx="2" fill="#141414" />
              <rect x="240" y="34" width="20" height="17" rx="2" fill="#141414" />
              {/* parapet cornice */}
              <rect x="74" y="48" width="212" height="12" rx="3" fill="#141414" />

              {/* flag pole + flag */}
              <rect x="179" y="10" width="2" height="24" fill="#1E2240" />
              <rect x="181" y="10" width="18" height="12" rx="1" fill="#C97D23" opacity="0.7" />

              {/* main building body */}
              <rect x="80" y="57" width="200" height="166" rx="4" fill="#1C1C1E" />

              {/* floor divider */}
              <rect x="80" y="140" width="200" height="3" fill="#262626" />

              {/* upper floor windows — 3 symmetric */}
              {/* left */}
              <rect x="92" y="67" width="36" height="60" rx="3" fill="#222222" />
              <rect x="95" y="70" width="30" height="54" rx="2" fill="#C97D23" opacity="0.62" />
              <rect x="109" y="70" width="2" height="54" fill="#1C1C1E" />
              <rect x="95" y="96" width="30" height="2" fill="#1C1C1E" />
              {/* center */}
              <rect x="162" y="67" width="36" height="60" rx="3" fill="#222222" />
              <rect x="165" y="70" width="30" height="54" rx="2" fill="#C97D23" opacity="0.62" />
              <rect x="179" y="70" width="2" height="54" fill="#1C1C1E" />
              <rect x="165" y="96" width="30" height="2" fill="#1C1C1E" />
              {/* right */}
              <rect x="232" y="67" width="36" height="60" rx="3" fill="#222222" />
              <rect x="235" y="70" width="30" height="54" rx="2" fill="#C97D23" opacity="0.62" />
              <rect x="249" y="70" width="2" height="54" fill="#1C1C1E" />
              <rect x="235" y="96" width="30" height="2" fill="#1C1C1E" />

              {/* ground floor side windows */}
              {/* left */}
              <rect x="92" y="148" width="36" height="56" rx="3" fill="#222222" />
              <rect x="95" y="151" width="30" height="44" rx="2" fill="#C97D23" opacity="0.48" />
              <rect x="109" y="151" width="2" height="44" fill="#1C1C1E" />
              {/* right */}
              <rect x="232" y="148" width="36" height="56" rx="3" fill="#222222" />
              <rect x="235" y="151" width="30" height="44" rx="2" fill="#C97D23" opacity="0.48" />
              <rect x="249" y="151" width="2" height="44" fill="#1C1C1E" />

              {/* door pilasters */}
              <rect x="148" y="143" width="6" height="80" rx="1" fill="#2A2A2A" />
              <rect x="206" y="143" width="6" height="80" rx="1" fill="#2A2A2A" />
              {/* transom above door */}
              <rect x="154" y="134" width="52" height="11" rx="2" fill="#C97D23" opacity="0.5" />
              {/* door */}
              <rect x="154" y="143" width="52" height="80" rx="2" fill="#B06818" />
              <rect x="157" y="146" width="46" height="30" rx="1" fill="#9A5A14" />
              <rect x="157" y="181" width="46" height="35" rx="1" fill="#9A5A14" />
              {/* door handle */}
              <circle cx="198" cy="190" r="3.5" fill="#FFD580" />

              {/* doorstep / steps */}
              <rect x="150" y="222" width="60" height="6" rx="1" fill="#2A2A2A" />
              <rect x="155" y="217" width="50" height="6" rx="1" fill="#262626" />
              <rect x="154" y="223" width="52" height="4" rx="0" fill="#C97D23" opacity="0.18" />

              {/* bushes flanking building */}
              <ellipse cx="102" cy="216" rx="18" ry="10" fill="#182018" />
              <ellipse cx="102" cy="210" rx="13" ry="9" fill="#1C2C1C" />
              <ellipse cx="258" cy="216" rx="18" ry="10" fill="#182018" />
              <ellipse cx="258" cy="210" rx="13" ry="9" fill="#1C2C1C" />

              {/* ground */}
              <rect x="0" y="226" width="360" height="4" fill="#C97D23" opacity="0.18" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right side — Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary lg:hidden mb-1">
              <span className="text-accent">HouseTrack</span>
            </h1>
            <h2 className="text-2xl font-bold text-text-primary">Create your account</h2>
            <p className="text-sm text-text-secondary mt-1">Register as a landlord to get started</p>
          </div>

          {error && (
            <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

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
                placeholder="At least 6 characters"
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
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
