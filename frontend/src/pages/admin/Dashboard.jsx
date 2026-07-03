import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, DoorOpen, Users, CreditCard, TrendingUp, ShieldOff, CheckCircle, BarChart2, Shield } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonStatCard, SkeletonRow } from '../../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, color = 'text-accent', bgColor = 'bg-accent-light', sub }) => (
  <Card className="flex items-center gap-4">
    <div className={`w-12 h-12 ${bgColor} rounded-btn flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className={color} />
    </div>
    <div>
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-text-primary mt-0.5">{value ?? '—'}</p>
      {sub && <p className="text-xs text-text-tertiary mt-0.5">{sub}</p>}
    </div>
  </Card>
);

const ROLE_COLOR = {
  landlord: 'bg-accent-light text-accent',
  tenant:   'bg-warning-light text-warning',
  admin:    'bg-danger-light text-danger',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/reports/admin-summary');
        if (res.data.success) setStats(res.data.data);
        else setError('Could not load dashboard data.');
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-8 space-y-2">
          <div className="h-7 w-44 bg-surface-alt rounded-btn animate-pulse" />
          <div className="h-4 w-36 bg-surface-alt rounded-btn animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-surface-alt rounded-btn animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <Card>
          <div className="h-5 w-40 bg-surface-alt rounded-btn animate-pulse mb-4" />
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </Card>
      </div>
    );
  }

  if (error || !stats) {
    return <p className="text-sm text-danger py-10">{error || 'No data available.'}</p>;
  }

  const occupancyPct = stats.totalRooms > 0
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
    : 0;
  const landlordActivePct = stats.totalLandlords > 0
    ? Math.round((stats.activeLandlords / stats.totalLandlords) * 100)
    : 0;

  const quickActions = [
    { label: 'Manage Users', icon: Users, to: '/admin/users' },
    { label: 'View Reports', icon: BarChart2, to: '/admin/reports' },
    { label: 'System', icon: Shield, to: '/admin/settings' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-danger/10 border border-danger/20 rounded-pill mb-2">
            <Shield size={11} className="text-danger" />
            <span className="text-[11px] font-semibold text-danger uppercase tracking-wider">Admin</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">{greeting}</h1>
          <p className="text-sm text-text-secondary mt-1">Platform-wide overview</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {quickActions.map(({ label, icon: Icon, to }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2.5 px-4 py-3 bg-surface-alt hover:bg-border/60 border border-border rounded-btn text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <Icon size={16} className="text-accent flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      {/* Landlord stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          icon={Users}
          label="Total Landlords"
          value={stats.totalLandlords}
          sub={`${stats.activeLandlords} active`}
        />
        <StatCard
          icon={CheckCircle}
          label="Active Landlords"
          value={stats.activeLandlords}
          color="text-success"
          bgColor="bg-success-light"
        />
        <StatCard
          icon={ShieldOff}
          label="Suspended"
          value={stats.suspendedLandlords}
          color="text-danger"
          bgColor="bg-danger-light"
        />
        <StatCard
          icon={Users}
          label="Active Tenants"
          value={stats.activeTenants}
          color="text-warning"
          bgColor="bg-warning-light"
        />
      </div>

      {/* Property / payment stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Building}    label="Properties"          value={stats.totalProperties}  color="text-text-primary" bgColor="bg-surface-alt" />
        <StatCard icon={DoorOpen}    label="Total Rooms"         value={stats.totalRooms}        sub={`${stats.occupiedRooms} occupied`} />
        <StatCard icon={CreditCard}  label="Payments This Month" value={stats.totalPaymentsThisMonth} color="text-success" bgColor="bg-success-light" />
        <StatCard icon={TrendingUp}  label="Platform Income"     value={formatCurrency(stats.totalPlatformIncomeThisMonth)} color="text-success" bgColor="bg-success-light" />
      </div>

      {/* Platform health bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text-primary">Platform Occupancy</p>
            <span className="text-xl font-bold text-accent">{occupancyPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-surface-alt rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-tertiary">
            <span>{stats.occupiedRooms} rooms occupied</span>
            <span>{stats.totalRooms - stats.occupiedRooms} available</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text-primary">Landlord Activity</p>
            <span className="text-xl font-bold text-success">{landlordActivePct}%</span>
          </div>
          <div className="w-full h-2.5 bg-surface-alt rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${landlordActivePct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-tertiary">
            <span>{stats.activeLandlords} active landlords</span>
            <span>{stats.suspendedLandlords ?? 0} suspended</span>
          </div>
        </Card>
      </div>

      {/* Recent registrations */}
      {stats.recentUsers?.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Recent Registrations</h2>
            <Link to="/admin/users" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {stats.recentUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-surface-alt rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-text-primary">{u.full_name?.charAt(0) ?? '?'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{u.full_name}</p>
                    <p className="text-xs text-text-tertiary">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill capitalize ${ROLE_COLOR[u.role] ?? 'bg-surface-alt text-text-secondary'}`}>
                    {u.role}
                  </span>
                  <span className="text-xs text-text-tertiary hidden sm:block">{formatDate(u.created_at)}</span>
                  <Badge status={u.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
