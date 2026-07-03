import React, { useEffect, useState } from 'react';
import { Users, Trash2, Search, X, ShieldCheck, ShieldOff } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/ui/Skeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/helpers';

const ROLE_BADGE = {
  landlord: 'bg-accent-light text-accent',
  tenant:   'bg-warning-light text-warning',
  admin:    'bg-danger-light text-danger',
};

const AdminUsers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Confirm dialogs
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) setUsers(res.data.data ?? []);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const doToggleStatus = async () => {
    const user = confirmToggle;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setConfirmToggle(null);
    setActionLoading(user.id);
    try {
      await api.patch(`/users/${user.id}/status`, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      toast(`${user.full_name} has been ${newStatus === 'active' ? 'activated' : 'suspended'}.`);
    } catch {
      toast('Failed to update user status.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const doDelete = async () => {
    const user = confirmDelete;
    setConfirmDelete(null);
    setActionLoading(user.id);
    try {
      await api.delete(`/users/${user.id}`);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast(`${user.full_name} has been deleted.`);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to delete user.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const byRole = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter);
  const filtered = search
    ? byRole.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : byRole;

  const counts = {
    all:      users.length,
    landlord: users.filter(u => u.role === 'landlord').length,
    tenant:   users.filter(u => u.role === 'tenant').length,
    admin:    users.filter(u => u.role === 'admin').length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Manage Users</h1>
        <p className="text-sm text-text-secondary mt-1">
          {users.length} registered user{users.length !== 1 ? 's' : ''}
          {users.length > 0 && (
            <> · <span className="text-success">{users.filter(u => u.status === 'active').length} active</span>
            {users.filter(u => u.status !== 'active').length > 0 && (
              <> · <span className="text-danger">{users.filter(u => u.status !== 'active').length} suspended</span></>
            )}</>
          )}
        </p>
      </div>

      {error && (
        <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm mb-6">{error}</div>
      )}

      {/* Role breakdown */}
      {!loading && users.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Users',  value: counts.all,      color: 'text-text-primary', bg: 'bg-surface-alt',   icon: Users },
            { label: 'Landlords',    value: counts.landlord, color: 'text-accent',        bg: 'bg-accent-light',  icon: ShieldCheck },
            { label: 'Tenants',      value: counts.tenant,   color: 'text-warning',       bg: 'bg-warning-light', icon: Users },
            { label: 'Admins',       value: counts.admin,    color: 'text-danger',        bg: 'bg-danger-light',  icon: ShieldOff },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <Card key={label} className="flex items-center gap-3 py-3">
              <div className={`w-10 h-10 ${bg} rounded-btn flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">{value}</p>
                <p className="text-xs text-text-secondary">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Filter + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'landlord', 'tenant', 'admin'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors capitalize ${
                roleFilter === r ? 'bg-accent text-white' : 'bg-surface border border-border text-text-secondary hover:bg-surface-alt'
              }`}
            >
              {r} <span className="ml-1 opacity-60">({counts[r]})</span>
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="bg-surface border border-border rounded-btn pl-8 pr-8 py-1.5 text-sm text-text-primary outline-none focus:border-accent transition-colors w-full sm:w-60"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <Card className="divide-y divide-border p-0 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-5 py-4"><SkeletonRow /></div>
          ))}
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Users size={28} className="text-text-tertiary mb-3" />
          <p className="text-sm font-semibold text-text-primary mb-1">No users found</p>
          <p className="text-sm text-text-secondary">{search ? 'Try a different search term.' : `No ${roleFilter === 'all' ? '' : roleFilter} users yet.`}</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_140px] gap-4 px-5 py-3 bg-surface-alt border-b border-border">
            {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
              <span key={h} className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-border">
            {filtered.map(u => (
              <div key={u.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_140px] gap-2 md:gap-4 px-5 py-4 items-center hover:bg-surface-alt/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-surface-alt rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-text-primary">{u.full_name?.charAt(0) ?? '?'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{u.full_name}</p>
                    <p className="text-xs text-text-tertiary truncate">{u.email}</p>
                  </div>
                </div>
                <div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill capitalize ${ROLE_BADGE[u.role] ?? 'bg-surface-alt text-text-secondary'}`}>
                    {u.role}
                  </span>
                </div>
                <div>
                  <Badge status={u.status} />
                </div>
                <div>
                  <span className="text-xs text-text-tertiary">{formatDate(u.created_at)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {u.role !== 'admin' && (
                    <>
                      <button
                        onClick={() => setConfirmToggle(u)}
                        disabled={actionLoading === u.id}
                        title={u.status === 'active' ? 'Suspend account' : 'Activate account'}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-btn font-semibold transition-colors disabled:opacity-50 ${
                          u.status === 'active'
                            ? 'text-warning hover:bg-warning-light'
                            : 'text-success hover:bg-success-light'
                        }`}
                      >
                        {actionLoading === u.id ? (
                          <span className="text-xs">…</span>
                        ) : u.status === 'active' ? (
                          <><ShieldOff size={13} /> Suspend</>
                        ) : (
                          <><ShieldCheck size={13} /> Activate</>
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(u)}
                        disabled={actionLoading === u.id}
                        title="Delete user"
                        className="text-danger hover:bg-danger-light p-1.5 rounded-btn transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Suspend / Activate confirm */}
      <ConfirmDialog
        isOpen={!!confirmToggle}
        title={confirmToggle?.status === 'active' ? 'Suspend Account' : 'Activate Account'}
        message={
          confirmToggle?.status === 'active'
            ? `Suspend ${confirmToggle?.full_name}? They will not be able to log in until reactivated.`
            : `Activate ${confirmToggle?.full_name}? They will regain access to the platform.`
        }
        confirmLabel={confirmToggle?.status === 'active' ? 'Suspend' : 'Activate'}
        danger={confirmToggle?.status === 'active'}
        onConfirm={doToggleStatus}
        onCancel={() => setConfirmToggle(null)}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete User"
        message={`Permanently delete ${confirmDelete?.full_name}? This removes their account and all associated data. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default AdminUsers;
