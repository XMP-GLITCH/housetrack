import React, { useEffect, useState } from 'react';
import { CreditCard, ChevronLeft, ChevronRight, Plus, ExternalLink, Search, X } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency, formatDate } from '../../utils/helpers';

const STATUSES = ['all', 'paid', 'part_payment', 'unpaid', 'overdue'];

const currentMonth = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [page, setPage] = useState(1);

  // Record payment modal
  const [showModal, setShowModal] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState({ tenant_id: '', room_id: '', rent_month: currentMonth(), amount_paid: '', method: 'cash' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (monthFilter) params.month = monthFilter;
      const res = await api.get('/payments', { params });
      if (res.data.success) {
        const data = res.data.data ?? [];
        setPayments(data);
        setMeta(res.data.meta ?? { total: data.length, page: 1, pages: 1 });
      }
    } catch {
      setError('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [page, statusFilter, monthFilter]);

  const openModal = async () => {
    setPaymentUrl('');
    setFormError('');
    setForm({ tenant_id: '', room_id: '', rent_month: currentMonth(), amount_paid: '' });
    try {
      if (tenants.length === 0) {
        const res = await api.get('/tenants', { params: { limit: 100, status: 'active' } });
        if (res.data.success) setTenants(res.data.data ?? []);
      }
    } catch {
      setFormError('Failed to load tenants. Please check your connection and try again.');
    }
    setShowModal(true);
  };

  const handleTenantChange = (tenantId) => {
    const t = tenants.find(t => String(t.id) === String(tenantId));
    setForm(f => ({
      ...f,
      tenant_id: tenantId,
      room_id: t?.room_id ?? '',
      amount_paid: t?.room?.rent_amount ? String(t.room.rent_amount) : f.amount_paid,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.tenant_id || !form.rent_month || !form.amount_paid) {
      setFormError('Fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/payments/initiate', {
        tenant_id: form.tenant_id,
        room_id: form.room_id,
        rent_month: form.rent_month,
        amount: Number(form.amount_paid),
      });
      if (res.data.success) {
        setPaymentUrl(res.data.data.payment_url);
      } else {
        setFormError('Failed to generate payment link.');
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to generate payment link.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTenant = tenants.find(t => String(t.id) === String(form.tenant_id));

  const visiblePayments = nameSearch
    ? payments.filter(p => p.tenant?.full_name?.toLowerCase().includes(nameSearch.toLowerCase()))
    : payments;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Payments</h1>
          <p className="text-sm text-text-secondary mt-1">{meta.total} total payment records</p>
        </div>
        <Button onClick={openModal}>
          <Plus size={15} className="mr-1.5" /> Record Payment
        </Button>
      </div>

      {error && (
        <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm mb-6">{error}</div>
      )}

      {/* Payment summary */}
      {!loading && payments.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="flex flex-col items-center justify-center py-4 bg-success/8 border border-success/20 rounded-card">
            <span className="text-lg font-bold text-success">{formatCurrency(payments.reduce((s, p) => s + Number(p.amount_paid || 0), 0))}</span>
            <span className="text-xs text-text-tertiary mt-0.5">Collected (this view)</span>
          </div>
          <div className="flex flex-col items-center justify-center py-4 bg-accent/8 border border-accent/20 rounded-card">
            <span className="text-2xl font-bold text-accent">{payments.filter(p => p.payment_status === 'paid').length}</span>
            <span className="text-xs text-text-tertiary mt-0.5">Fully Paid</span>
          </div>
          <div className="flex flex-col items-center justify-center py-4 bg-danger/8 border border-danger/20 rounded-card">
            <span className="text-2xl font-bold text-danger">{payments.filter(p => ['unpaid', 'overdue'].includes(p.payment_status)).length}</span>
            <span className="text-xs text-text-tertiary mt-0.5">Unpaid / Overdue</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors capitalize ${
                statusFilter === s ? 'bg-accent text-white' : 'bg-surface border border-border text-text-secondary hover:bg-surface-alt'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
          <input
            type="month"
            value={monthFilter}
            onChange={e => { setMonthFilter(e.target.value); setPage(1); }}
            className="bg-surface border border-border rounded-btn px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent transition-colors"
          />
          {monthFilter && (
            <button onClick={() => { setMonthFilter(''); setPage(1); }} className="text-xs text-text-tertiary hover:text-danger transition-colors">
              Clear
            </button>
          )}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
          <input
            value={nameSearch}
            onChange={e => setNameSearch(e.target.value)}
            placeholder="Search by tenant name…"
            className="bg-surface border border-border rounded-btn pl-8 pr-8 py-1.5 text-xs text-text-primary outline-none focus:border-accent transition-colors w-full"
          />
          {nameSearch && (
            <button onClick={() => setNameSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : payments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <CreditCard size={28} className="text-text-tertiary mb-3" />
          <p className="text-sm font-semibold text-text-primary mb-1">No payments found</p>
          <p className="text-sm text-text-secondary">Try adjusting your filters or record a payment.</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden p-0">
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-surface-alt border-b border-border">
              {['Tenant', 'Room', 'Month', 'Rent', 'Paid', 'Status'].map(h => (
                <span key={h} className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-border">
              {visiblePayments.map(p => (
                <div key={p.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 md:gap-4 px-5 py-4 hover:bg-surface-alt/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent-light rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-accent">{p.tenant?.full_name?.charAt(0) ?? '?'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{p.tenant?.full_name ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-text-secondary">{p.room?.room_number ? `Room ${p.room.room_number}` : '—'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-text-secondary">{p.rent_month}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-text-secondary">{formatCurrency(p.rent_amount)}</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-text-primary">{formatCurrency(p.amount_paid)}</span>
                    {Number(p.balance) > 0 && (
                      <span className="text-xs text-danger">-{formatCurrency(p.balance)}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Badge status={p.payment_status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {meta.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-text-tertiary">Page {meta.page} of {meta.pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-btn border border-border text-text-secondary hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPage(p => Math.min(meta.pages, p + 1))} disabled={page === meta.pages}
                  className="p-2 rounded-btn border border-border text-text-secondary hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Record Payment Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Payment">
        {paymentUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">Payment link generated. Share it with the tenant or open it to complete the Mobile Money payment.</p>
            <div className="bg-surface-alt border border-border rounded-btn px-4 py-3 text-xs text-text-primary break-all font-mono">{paymentUrl}</div>
            <div className="flex gap-3">
              <a href={paymentUrl} target="_blank" rel="noreferrer">
                <Button><ExternalLink size={14} className="mr-1.5" /> Open Payment Page</Button>
              </a>
              <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(paymentUrl); }}>Copy Link</Button>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => { setShowModal(false); fetchPayments(); }}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <p className="text-xs text-danger bg-danger-light rounded-btn px-3 py-2">{formError}</p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Tenant <span className="text-danger">*</span></label>
              <select
                value={form.tenant_id}
                onChange={e => handleTenantChange(e.target.value)}
                className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
                required
              >
                <option value="">Select tenant...</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} {t.room ? `— Room ${t.room.room_number}` : '(no room)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Rent Month <span className="text-danger">*</span></label>
              <input
                type="month"
                value={form.rent_month}
                onChange={e => setForm(f => ({ ...f, rent_month: e.target.value }))}
                className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Amount (XAF) <span className="text-danger">*</span></label>
              <input
                type="number"
                min="1"
                value={form.amount_paid}
                onChange={e => setForm(f => ({ ...f, amount_paid: e.target.value }))}
                placeholder={selectedTenant?.room?.rent_amount ? `Full rent: ${formatCurrency(selectedTenant.room.rent_amount)}` : 'Enter amount'}
                className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
                required
              />
            </div>

            <p className="text-xs text-text-tertiary">A Mobile Money payment link will be generated via Notchpay. Share it with the tenant or open it directly.</p>

            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={submitting}>Generate Payment Link</Button>
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Payments;
