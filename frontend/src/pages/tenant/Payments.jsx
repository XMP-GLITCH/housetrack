import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, FileText, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate } from '../../utils/helpers';

const currentMonth = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
};

const TenantPayments = () => {
  const [tenant, setTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');

  const fetchData = async () => {
    try {
      const tenantRes = await api.get('/tenants/me');
      if (!tenantRes.data.success) throw new Error('Profile not found');
      const t = tenantRes.data.data;
      setTenant(t);
      const res = await api.get(`/payments/tenant/${t.id}`);
      if (res.data.success) setPayments(res.data.data ?? []);
    } catch {
      setError('Failed to load payment history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
        amount: tenant.room.rent_amount,
      });
      if (res.data.success) {
        setPaymentUrl(res.data.data.payment_url);
      } else {
        setPayError('Could not generate payment link. Try again.');
      }
    } catch (err) {
      setPayError(err.response?.data?.error || 'Failed to initiate payment.');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">My Payments</h1>
        <p className="text-sm text-text-secondary mt-1">{payments.length} payment record{payments.length !== 1 ? 's' : ''}</p>
      </div>

      {error && (
        <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm mb-6">{error}</div>
      )}

      {/* Pay This Month Banner */}
      {tenant?.room && !isThisMonthPaid && (
        <Card className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-accent/30 bg-accent/5">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {thisMonthPayment?.payment_status === 'part_payment'
                ? `Remaining balance for ${thisMonth}`
                : `Rent due for ${thisMonth}`}
            </p>
            <p className="text-2xl font-bold text-accent mt-0.5">
              {formatCurrency(
                thisMonthPayment?.balance ?? tenant.room.rent_amount
              )}
            </p>
            {thisMonthPayment?.payment_status === 'part_payment' && (
              <p className="text-xs text-text-tertiary mt-0.5">
                Already paid: {formatCurrency(thisMonthPayment.amount_paid)}
              </p>
            )}
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
            {paymentUrl ? (
              <div className="space-y-2 w-full">
                <a href={paymentUrl} target="_blank" rel="noreferrer" className="w-full">
                  <Button className="w-full">
                    <ExternalLink size={14} className="mr-1.5" /> Open Payment Page
                  </Button>
                </a>
                <button
                  onClick={() => { navigator.clipboard.writeText(paymentUrl); }}
                  className="text-xs text-text-tertiary hover:text-accent transition-colors"
                >
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
        </Card>
      )}

      {isThisMonthPaid && (
        <Card className="mb-6 flex items-center gap-3 border-success/30 bg-success/5">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
            <CreditCard size={18} className="text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-success">Rent paid for {thisMonth}</p>
            <p className="text-xs text-text-secondary">You're all caught up this month.</p>
          </div>
        </Card>
      )}

      {/* Payment History */}
      {payments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <CreditCard size={28} className="text-text-tertiary mb-3" />
          <p className="text-sm font-semibold text-text-primary mb-1">No payments yet</p>
          <p className="text-sm text-text-secondary">Your rent payment history will appear here.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 bg-surface-alt border-b border-border">
            {['Month', 'Rent', 'Paid', 'Status', ''].map(h => (
              <span key={h} className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-border">
            {payments.map(p => (
              <div key={p.id} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr_80px] gap-2 md:gap-4 px-5 py-4 hover:bg-surface-alt/50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{p.rent_month}</p>
                  <p className="text-xs text-text-tertiary">{formatDate(p.payment_date)}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-text-secondary">{formatCurrency(p.rent_amount)}</span>
                </div>
                <div className="flex flex-col items-start justify-center">
                  <span className="text-sm font-semibold text-text-primary">{formatCurrency(p.amount_paid)}</span>
                  {Number(p.balance) > 0 && (
                    <span className="text-xs text-danger">Bal: {formatCurrency(p.balance)}</span>
                  )}
                </div>
                <div className="flex items-center">
                  <Badge status={p.payment_status} />
                </div>
                <div className="flex items-center">
                  {p.receipt && (
                    <Link to={`/tenant/receipts/${p.id}`} className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline">
                      <FileText size={13} /> Receipt
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TenantPayments;
