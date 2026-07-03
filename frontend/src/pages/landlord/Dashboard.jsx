import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonStatCard, SkeletonRow } from '../../components/ui/Skeleton';
import {
  Building, DoorOpen, Users, CreditCard, AlertCircle, TrendingUp,
  CheckCircle, XCircle, Clock, MessageSquare, ChevronRight, MapPin,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { api } from '../../services/api';

const StatCard = ({ icon: Icon, label, value, color = 'text-accent', bgColor = 'bg-accent-light', alert = false }) => (
  <Card className={`flex items-center gap-4 ${alert && value > 0 ? 'border-danger/30' : ''}`}>
    <div className={`w-12 h-12 ${bgColor} rounded-btn flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className={color} />
    </div>
    <div>
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold mt-0.5 ${alert && value > 0 ? 'text-danger' : 'text-text-primary'}`}>
        {value ?? '—'}
      </p>
    </div>
  </Card>
);

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, paymentsRes, propertiesRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/payments?limit=5'),
          api.get('/properties'),
        ]);
        if (summaryRes.data.success) {
          const data = summaryRes.data.data;
          setStats(data);
          if (data.totalProperties === 0) {
            navigate('/landlord/onboarding', { replace: true });
            return;
          }
        }
        if (paymentsRes.data.success) setRecentPayments(paymentsRes.data.data);
        if (propertiesRes.data.success) setProperties(propertiesRes.data.data ?? []);
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
        <div className="mb-8">
          <div className="h-4 w-28 bg-surface-alt rounded-btn animate-pulse mb-2" />
          <div className="h-7 w-48 bg-surface-alt rounded-btn animate-pulse" />
          <div className="h-4 w-56 bg-surface-alt rounded-btn animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-surface-alt rounded-btn animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <Card>
          <div className="h-5 w-36 bg-surface-alt rounded-btn animate-pulse mb-4" />
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  const total = stats?.totalRooms || 1;
  const occupiedPct = Math.round(((stats?.occupiedRooms ?? 0) / total) * 100);
  const totalTenants = stats?.occupiedRooms || 1;
  const paidPct = stats?.occupiedRooms > 0
    ? Math.round(((stats?.paidTenants ?? 0) / totalTenants) * 100)
    : 0;

  const quickActions = [
    { label: 'Add Property', icon: Building, to: '/landlord/properties/new' },
    { label: 'Add Tenant',   icon: Users,    to: '/landlord/tenants/invite' },
    { label: 'Payments',     icon: CreditCard, to: '/landlord/payments' },
    { label: 'Complaints',   icon: MessageSquare, to: '/landlord/complaints' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">{monthLabel}</p>
        <h1 className="text-2xl font-bold text-text-primary">{greeting}</h1>
        <p className="text-sm text-text-secondary mt-1">Here's an overview of your rental portfolio</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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

      {/* Property stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard icon={Building}    label="Properties" value={stats?.totalProperties} />
        <StatCard icon={DoorOpen}    label="Total Rooms" value={stats?.totalRooms}      color="text-text-primary" bgColor="bg-surface-alt" />
        <StatCard icon={CheckCircle} label="Occupied"    value={stats?.occupiedRooms}   color="text-warning"      bgColor="bg-warning-light" />
        <StatCard icon={DoorOpen}    label="Available"   value={stats?.availableRooms}  color="text-success"      bgColor="bg-success-light" />
      </div>

      {/* Payment / complaint stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}      label="Paid This Month"   value={stats?.paidTenants}     color="text-success"  bgColor="bg-success-light" />
        <StatCard icon={XCircle}    label="Unpaid This Month" value={stats?.unpaidTenants}   color="text-danger"   bgColor="bg-danger-light"  alert />
        <StatCard icon={Clock}      label="Overdue Balances"  value={stats?.overduePayments} color="text-warning"  bgColor="bg-warning-light" alert />
        <StatCard icon={TrendingUp} label="Monthly Income"    value={stats ? formatCurrency(stats.monthlyIncome) : '—'} />
      </div>

      {/* Occupancy + Payment Rate visual bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text-primary">Occupancy Rate</p>
            <span className="text-xl font-bold text-accent">{occupiedPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-surface-alt rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${occupiedPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-tertiary">
            <span>{stats?.occupiedRooms ?? 0} occupied</span>
            <span>{stats?.availableRooms ?? 0} available of {stats?.totalRooms ?? 0}</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text-primary">Payment Rate</p>
            <span className="text-xl font-bold text-success">{paidPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-surface-alt rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${paidPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-tertiary">
            <span>{stats?.paidTenants ?? 0} paid this month</span>
            <span>{stats?.unpaidTenants ?? 0} unpaid</span>
          </div>
        </Card>
      </div>

      {/* Alert banners */}
      {stats?.overduePayments > 0 && (
        <div className="flex items-center gap-3 bg-warning/10 border border-warning/25 rounded-card px-4 py-3 mb-4 text-sm">
          <Clock size={16} className="text-warning flex-shrink-0" />
          <span className="text-text-primary">
            <span className="font-semibold">{stats.overduePayments} overdue payment{stats.overduePayments !== 1 ? 's' : ''}</span> from previous months need attention.
          </span>
          <Link to="/landlord/payments" className="ml-auto text-xs font-semibold text-accent hover:underline whitespace-nowrap">
            View all →
          </Link>
        </div>
      )}

      {stats?.pendingComplaints > 0 && (
        <div className="flex items-center gap-3 bg-danger/8 border border-danger/20 rounded-card px-4 py-3 mb-6 text-sm">
          <AlertCircle size={16} className="text-danger flex-shrink-0" />
          <span className="text-text-primary">
            <span className="font-semibold">{stats.pendingComplaints} pending complaint{stats.pendingComplaints !== 1 ? 's' : ''}</span> waiting for your response.
          </span>
          <Link to="/landlord/complaints" className="ml-auto text-xs font-semibold text-accent hover:underline whitespace-nowrap">
            Review →
          </Link>
        </div>
      )}

      {/* Properties overview */}
      {properties.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-text-primary">Your Properties</h2>
            <Link to="/landlord/properties" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {properties.map((p) => {
              const totalRooms = p.rooms?.length ?? 0;
              const occupiedRooms = p.rooms?.filter(r => r.status === 'occupied').length ?? 0;
              const pct = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
              return (
                <Link key={p.id} to={`/landlord/properties/${p.id}`}>
                  <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-text-primary truncate">{p.property_name}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-text-tertiary">
                          <MapPin size={11} />
                          <span className="text-xs truncate">{p.location}</span>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-text-tertiary mt-0.5 flex-shrink-0 ml-2" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-surface-alt rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-text-secondary whitespace-nowrap">
                        {occupiedRooms}/{totalRooms} rooms
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Payments */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Recent Payments</h2>
          <Link to="/landlord/payments" className="text-xs text-accent hover:underline">View all</Link>
        </div>
        {recentPayments.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <CreditCard size={24} className="text-text-tertiary mb-2" />
            <p className="text-sm text-text-secondary">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-surface-alt rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-text-primary">
                      {p.tenant?.full_name?.charAt(0) ?? '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{p.tenant?.full_name ?? 'Unknown'}</p>
                    <p className="text-xs text-text-tertiary">
                      Room {p.room?.room_number ?? '—'} · {p.rent_month}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-text-primary hidden sm:block">{formatCurrency(p.amount_paid)}</span>
                  <Badge status={p.payment_status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default LandlordDashboard;
