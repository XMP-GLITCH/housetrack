import React, { useState } from 'react';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const Settings = () => {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [nameForm, setNameForm] = useState({ full_name: user?.full_name ?? '' });
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!nameForm.full_name.trim()) { setNameError('Name is required.'); return; }
    setNameLoading(true);
    setNameError('');
    try {
      const res = await api.patch('/auth/me', { full_name: nameForm.full_name.trim() });
      if (res.data.success) toast('Name updated.');
    } catch {
      setNameError('Failed to update name.');
    } finally {
      setNameLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account</p>
      </div>

      {/* Profile */}
      <Card className="mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-accent-light rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-accent">{user?.full_name?.charAt(0) ?? '?'}</span>
          </div>
          <div>
            <p className="font-semibold text-text-primary">{user?.full_name}</p>
            <p className="text-sm text-text-secondary capitalize">{user?.role}</p>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Profile</h2>
        {nameError && (
          <div className="bg-danger-light border border-danger/20 text-danger px-4 py-2.5 rounded-btn text-sm mb-4">{nameError}</div>
        )}
        <form onSubmit={handleUpdateName} className="space-y-4">
          <Input label="Display Name" value={nameForm.full_name} onChange={e => setNameForm({ full_name: e.target.value })} required />
          <Button type="submit" isLoading={nameLoading}>Save Name</Button>
        </form>
      </Card>

      {/* Account info (read-only) */}
      <Card className="mb-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={15} className="text-text-tertiary flex-shrink-0" />
            <div>
              <p className="text-xs text-text-tertiary">Email</p>
              <p className="font-medium text-text-primary">{user?.email ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield size={15} className="text-text-tertiary flex-shrink-0" />
            <div>
              <p className="text-xs text-text-tertiary">Role</p>
              <p className="font-medium text-text-primary capitalize">{user?.role ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User size={15} className="text-text-tertiary flex-shrink-0" />
            <div>
              <p className="text-xs text-text-tertiary">Account Status</p>
              <p className="font-medium text-success capitalize">{user?.status ?? 'active'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Sign out */}
      <Card>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Session</h2>
        <Button variant="danger" onClick={logout} className="w-full">
          <LogOut size={15} className="mr-2" /> Sign Out
        </Button>
      </Card>
    </div>
  );
};

export default Settings;
