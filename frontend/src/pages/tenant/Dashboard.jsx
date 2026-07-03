import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DoorOpen, CreditCard, AlertCircle, CheckCircle2, ExternalLink, MessageSquare, Calendar, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SkeletonStatCard, SkeletonRow, Skeleton } from '../../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../../utils/helpers';

const currentMonth = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
};

const lastNMonths = (n) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (n - 1 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

const monthAbbr = (m) => {
  const [y, mo] = m.split('-');
  return new Date(Number(y), Number(mo) - 1).toLocaleString('default', { month: 'short' });
};

const tenancyDuration = (moveInDate) => {
  if (!moveInDate) return null;
  const months =
    (new Date().getFullYear() - new Date(moveInDate).getFullYear()) * 12 +
    (new Date().getMonth() - new Date(moveInDate).getMonth());
  if (months < 1) return 'Less than a month';
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
  const y = Math.floor(months / 12);
  const rem = months % 12;
  return rem === 0 ? `${y} year${y !== 1 ? 's' : ''}` : `${y}y ${rem}m`;
};

const TenantDashboard = () => {
  const [tenant, setTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tenantRes = await api.get('/tenants/me');
        if (!tenantRes.data.success) throw new Error('Profile not found');
        const t = tenantRes.data.data;
        setTenant(t);
        const [paymentsRes, complaintsRes] = await Promise.all([
          api.get(`/payments/tenant/${t.id}`),
          api.get(`/complaints/tenant/${t.id}`),
        ]);
        if (paymentsRes.data.success) setPayments(paymentsRes.data.data ?? []);
        if (complaintsRes.data.success) setComplaints(complaintsRes.data.data ?? []);
      } catch (err) {
        const msg = err?.response?.data?.error || err?.message || '';
        setError(`Failed to load your dashboard. ${msg}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const thisMonth = currentMonth();
  const thisMonthPayment = payments.find(p => p.rent_month === thisMonth);
  const isThisMonthPaid = thisMonthPayment?.payment_status === 'paid';

  const handlePayNow = async () => {
    if (!tenant?.room) return;
    setPayLoading(true);
    setPayError('');
    setPaymentUrl('');
    try {
      const res = await api.post('/payments/initiate', {
        tenant_id: tenant.id,
        room_id: tenant.room_id,
        rent_month: thisMonth,
        amount: thisMonthPayment?.balance ?? tenant.room.rent_amount,
      });
      if (res.data.success) setPaymentUrl(res.data.data.payment_url);
      else setPayError('Could not generate payment link.');
    } catch (err) {
      setPayError(err.response?.data?.error || 'Failed to initiate payment.');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8 space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</Card>
          <Card>{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</Card>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return <p className="text-sm text-danger py-10">{error || 'Profile not found.'}</p>;
  }

  const openComplaints = complaints.filter(c => c.status !== 'resolved');
  const dueAmount = thisMonthPayment?.balance ?? tenant.room?.rent_amount;
  const duration = tenancyDuration(tenant.move_in_date);
  const months6 = lastNMonths(6);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting}, {tenant.full_name.split(' ')[0]}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {tenant.room?.property?.property_name
            ? `${tenant.room.property.property_name} · Room ${tenant.room.room_number}`
            : 'Welcome back'}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-light rounded-btn flex items-center justify-center flex-shrink-0">
            <DoorOpen size={22} className="text-accent" />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">My Room</p>
            <p className="text-xl font-bold text-text-primary mt-0.5">
              {tenant.room?.room_number ? `Room ${tenant.room.room_number}` : 'Unassigned'}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-warning-light rounded-btn flex items-center justify-center flex-shrink-0">
            <CreditCard size={22} className="text-warning" />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Monthly Rent</p>
            <p className="text-xl font-bold text-text-primary mt-0.5">
              {tenant.room ? formatCurrency(tenant.room.rent_amount) : '—'}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className={`w-12 h-12 ${openComplaints.length > 0 ? 'bg-danger-light' : 'bg-success-light'} rounded-btn flex items-center justify-center flex-shrink-0`}>
            <AlertCircle size={22} className={openComplaints.length > 0 ? 'text-danger' : 'text-success'} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Open Issues</p>
            <p className="text-xl font-bold text-text-primary mt-0.5">{openComplaints.length}</p>
          </div>
        </Card>
      </div>

      {/* Payment streak — last 6 months */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Payment History</h2>
          <Link to="/tenant/payments" className="text-xs text-accent hover:underline">View all</Link>
        </div>
        <div className="flex items-center gap-2">
          {months6.map((m) => {
            const payment = payments.find(p => p.rent_month === m);
            const paid = payment?.payment_status === 'paid';
            const partial = payment?.payment_status === 'part_payment';
            const isCurrent = m === thisMonth;
            return (
              <div key={m} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`w-full h-8 rounded-btn flex items-center justify-center transition-colors ${
                  paid    ? 'bg-success/15 border border-success/30' :
                  partial ? 'bg-warning/15 border border-warning/30' :
                  isCurrent && !payment ? 'bg-accent/10 border border-accent/30 border-dashed' :
                  'bg-surface-alt border border-border'
                }`}>
                  {paid    && <CheckCircle size={13} className="text-success" />}
                  {partial && <span className="text-[9px] font-bold text-warning">PART</span>}
                  {!paid && !partial && isCurrent && <span className="text-[9px] font-bold text-accent">DUE</span>}
                  {!paid && !partial && !isCurrent && <span className="text-[9px] text-text-tertiary">—</span>}
                </div>
                <span className="text-[10px] text-text-tertiary">{monthAbbr(m)}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pay Rent CTA */}
      {tenant.room && !isThisMonthPaid && (
        <Card className="mb-6 border-accent/30 bg-accent/5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
                {thisMonthPayment?.payment_status === 'part_payment' ? 'Remaining Balance' : 'Rent Due'} · {thisMonth}
              </p>
              <p className="text-3xl font-bold text-text-primary">{formatCurrency(dueAmount)}</p>
              {thisMonthPayment?.payment_status === 'part_payment' && (
                <p className="text-xs text-text-tertiary mt-1">Already paid: {formatCurrency(thisMonthPayment.amount_paid)}</p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              {paymentUrl ? (
                <div className="space-y-1.5">
                  <a href={paymentUrl} target="_blank" rel="noreferrer">
                    <Button className="w-full sm:w-auto">
                      <ExternalLink size={14} className="mr-1.5" /> Open Payment Page
                    </Button>
                  </a>
                  <button onClick={() => navigator.clipboard.writeText(paymentUrl)} className="text-xs text-text-tertiary hover:text-accent transition-colors">
                    Copy link
                  </button>
                </div>
              ) : (
                <Button onClick={handlePayNow} isLoading={payLoading}>
                  <CreditCard size={14} className="mr-1.5" />
                  Pay Now via Mobile Money
                </Button>
              )}
              {payError && <p className="text-xs text-danger">{payError}</p>}
            </div>
          </div>
        </Card>
      )}

      {/* All paid this month */}
      {isThisMonthPaid && (
        <Card className="mb-6 flex items-center gap-3 border-success/25 bg-success/5">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={18} className="text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-success">Rent paid for {thisMonth}</p>
            <p className="text-xs text-text-secondary">You're all caught up this month.</p>
          </div>
        </Card>
      )}

      {/* Room Details + Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h2 className="text-base font-semibold text-text-primary mb-4">Room Details</h2>
          {tenant.room ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Room</span>
                <span className="font-semibold text-text-primary">Room {tenant.room.room_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Type</span>
                <span className="font-semibold text-text-primary capitalize">{tenant.room.room_type}</span>
              </div>
              {tenant.room.property && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Property</span>
                    <span className="font-semibold text-text-primary">{tenant.room.property.property_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Location</span>
                    <span className="font-semibold text-text-primary">{tenant.room.property.location}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <span className="text-text-secondary">Monthly Rent</span>
                <span className="font-bold text-accent">{formatCurrency(tenant.room.rent_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Move-in Date</span>
                <span className="font-semibold text-text-primary">{formatDate(tenant.move_in_date)}</span>
              </div>
              {duration && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Tenancy</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-text-tertiary" />
                    <span className="font-semibold text-text-primary">{duration}</span>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-secondary py-4 text-center">No room assigned yet. Contact your landlord.</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Recent Payments</h2>
            <Link to="/tenant/payments" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          {payments.length === 0 ? (
            <p className="text-sm text-text-secondary py-4 text-center">No payments recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {payments.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{p.rent_month}</p>
                    <p className="text-xs text-text-tertiary">{formatDate(p.payment_date)}</p>
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

      {/* Open complaints tracker */}
      {openComplaints.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Open Issues</h2>
            <Link to="/tenant/complaints" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {openComplaints.slice(0, 3).map(c => (
              <div key={c.id} className="flex items-start justify-between py-3 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {c.title || c.description?.slice(0, 60) || 'Issue'}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">{formatDate(c.created_at)}</p>
                </div>
                <Badge status={c.status} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/tenant/complaints"
          className="flex items-center gap-2 px-5 py-3 bg-surface-alt hover:bg-border/60 border border-border rounded-btn text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <MessageSquare size={16} className="text-accent" />
          Report an Issue
        </Link>
        <Link
          to="/tenant/payments"
          className="flex items-center gap-2 px-5 py-3 bg-surface-alt hover:bg-border/60 border border-border rounded-btn text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <CreditCard size={16} className="text-accent" />
          Payment History
        </Link>
      </div>
    </div>
  );
};

export default TenantDashboard;
