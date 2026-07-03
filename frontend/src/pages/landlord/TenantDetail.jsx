import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, AlertCircle, DoorOpen, Send, CheckCircle2, Copy, Check, Pencil } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import { formatCurrency, formatDate } from '../../utils/helpers';

const TenantDetail = () => {
  const { id } = useParams();
  const toast = useToast();
  const [tenant, setTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAssign, setShowAssign] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');

  const [vacateLoading, setVacateLoading] = useState(false);
  const [confirmVacate, setConfirmVacate] = useState(false);

  const [showEditTenant, setShowEditTenant] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', email: '', emergency_contact: '' });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [loginLink, setLoginLink] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      const [tenantRes, paymentsRes, propsRes] = await Promise.all([
        api.get(`/tenants/${id}`),
        api.get(`/payments/tenant/${id}`),
        api.get('/properties', { params: { limit: 100 } }),
      ]);
      if (tenantRes.data.success) setTenant(tenantRes.data.data);
      if (paymentsRes.data.success) setPayments(paymentsRes.data.data);
      if (propsRes.data.success) setProperties(propsRes.data.data);
    } catch {
      setError('Failed to load tenant details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const availableRooms = properties.flatMap(p =>
    (p.rooms ?? [])
      .filter(r => r.status === 'available')
      .map(r => ({ ...r, propertyName: p.property_name }))
  );

  const handleAssignRoom = async (e) => {
    e.preventDefault();
    setAssignError('');
    if (!selectedRoom) { setAssignError('Select a room.'); return; }
    setAssignLoading(true);
    try {
      const res = await api.post(`/tenants/${id}/assign-room`, { room_id: selectedRoom });
      if (res.data.success) {
        setShowAssign(false);
        fetchData();
        toast('Room assigned successfully.');
      }
    } catch {
      setAssignError('Failed to assign room.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleInvite = async () => {
    setInviteLoading(true);
    setInviteError('');
    try {
      const res = await api.post(`/tenants/${id}/invite`);
      if (res.data.success) {
        setInviteSuccess(true);
        if (res.data.loginLink) setLoginLink(res.data.loginLink);
      }
    } catch (err) {
      setInviteError(err.response?.data?.error || 'Failed to send invite. Check backend logs.');
    } finally {
      setInviteLoading(false);
    }
  };

  const openEditTenant = () => {
    setEditForm({
      full_name: tenant.full_name ?? '',
      phone: tenant.phone ?? '',
      email: tenant.email ?? '',
      emergency_contact: tenant.emergency_contact ?? '',
    });
    setEditError('');
    setShowEditTenant(true);
  };

  const handleEditTenant = async (e) => {
    e.preventDefault();
    if (!editForm.full_name || !editForm.phone) { setEditError('Name and phone are required.'); return; }
    setEditLoading(true);
    setEditError('');
    try {
      const res = await api.patch(`/tenants/${id}`, editForm);
      if (res.data.success) {
        setShowEditTenant(false);
        fetchData();
        toast('Tenant updated.');
      }
    } catch {
      setEditError('Failed to update tenant.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleVacate = async () => {
    setVacateLoading(true);
    try {
      await api.post(`/tenants/${id}/vacate`);
      fetchData();
      toast('Tenant marked as vacated.');
    } catch {
      toast('Failed to vacate tenant.', 'error');
    } finally {
      setVacateLoading(false);
      setConfirmVacate(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !tenant) {
    return <p className="text-sm text-danger py-10">{error || 'Tenant not found.'}</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link to="/landlord/tenants" className="text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">{tenant.full_name}</h1>
          <p className="text-sm text-text-secondary mt-0.5">Move-in: {formatDate(tenant.move_in_date)}</p>
        </div>
        <button onClick={openEditTenant} className="p-2 rounded-btn text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors">
          <Pencil size={16} />
        </button>
        <Badge status={tenant.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Info card */}
        <Card className="lg:col-span-1 space-y-4">
          <h2 className="text-base font-semibold text-text-primary">Contact Info</h2>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Phone size={14} className="text-text-tertiary" /> {tenant.phone}
          </div>
          {tenant.email && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Mail size={14} className="text-text-tertiary" /> {tenant.email}
            </div>
          )}
          {tenant.emergency_contact && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <AlertCircle size={14} className="text-text-tertiary" /> {tenant.emergency_contact}
            </div>
          )}

          <div className="border-t border-border pt-4">
            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-2">Room</p>
            {tenant.room ? (
              <div>
                <p className="text-sm font-semibold text-text-primary">Room {tenant.room.room_number}</p>
                <p className="text-xs text-text-secondary">{tenant.room.property?.property_name}</p>
                <p className="text-sm font-bold text-accent mt-1">{formatCurrency(tenant.room.rent_amount)}<span className="text-xs text-text-tertiary font-normal">/mo</span></p>
              </div>
            ) : (
              <p className="text-sm text-warning">No room assigned</p>
            )}
          </div>

          {/* App Access */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-3">App Access</p>

            {inviteSuccess && loginLink ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-success text-sm">
                  <CheckCircle2 size={15} />
                  <span className="font-medium">Login link ready</span>
                </div>

                {/* Link box */}
                <div className="bg-surface-alt border border-border rounded-btn px-3 py-2.5">
                  <p className="text-xs font-mono text-text-secondary break-all leading-relaxed">{loginLink}</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(loginLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-btn border border-border bg-surface text-xs font-medium text-text-primary hover:bg-surface-alt transition-colors"
                  >
                    {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Hi ${tenant.full_name}, here is your HouseTrack login link: ${loginLink}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-btn bg-[#25D366] text-white text-xs font-medium hover:bg-[#1ebe5d] transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                </div>

                <p className="text-xs text-text-tertiary">Expires in 24 hours.</p>

                <button
                  onClick={() => { setInviteSuccess(false); setLoginLink(''); setCopied(false); }}
                  className="text-xs text-text-tertiary hover:text-accent transition-colors"
                >
                  Generate new link
                </button>
              </div>

            ) : tenant.email ? (
              <div className="space-y-2.5">
                {tenant.user_id && !inviteSuccess && (
                  <div className="flex items-center gap-2 text-success text-sm">
                    <CheckCircle2 size={15} />
                    <span className="font-medium">Active — tenant can log in</span>
                  </div>
                )}
                {inviteError && (
                  <p className="text-xs text-danger bg-danger-light rounded-btn px-2 py-1.5">{inviteError}</p>
                )}
                <Button
                  onClick={handleInvite}
                  isLoading={inviteLoading}
                  variant={tenant.user_id ? 'secondary' : 'primary'}
                  className="w-full"
                >
                  <Send size={14} className="mr-1.5" />
                  {tenant.user_id ? 'Generate New Login Link' : 'Generate Login Link'}
                </Button>
                <p className="text-xs text-text-tertiary">Share the link with the tenant via WhatsApp or SMS.</p>
              </div>
            ) : (
              <p className="text-xs text-warning">Add an email address to generate a login link.</p>
            )}
          </div>

          {tenant.status === 'active' && (
            <div className="flex flex-col gap-2 pt-2">
              {!tenant.room_id && (
                <Button onClick={() => setShowAssign(true)}>
                  <DoorOpen size={15} className="mr-1.5" /> Assign Room
                </Button>
              )}
              <Button variant="danger" onClick={() => setConfirmVacate(true)} isLoading={vacateLoading}>
                Mark as Vacated
              </Button>
            </div>
          )}
        </Card>

        {/* Payments */}
        <Card className="lg:col-span-2">
          <h2 className="text-base font-semibold text-text-primary mb-4">Payment History</h2>
          {payments.length === 0 ? (
            <p className="text-sm text-text-secondary py-8 text-center">No payments recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{p.rent_month}</p>
                    <p className="text-xs text-text-tertiary">{formatDate(p.payment_date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text-primary">{formatCurrency(p.amount_paid)}</p>
                      {Number(p.balance) > 0 && (
                        <p className="text-xs text-danger">Balance: {formatCurrency(p.balance)}</p>
                      )}
                    </div>
                    <Badge status={p.payment_status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit Tenant Modal */}
      <Modal isOpen={showEditTenant} onClose={() => setShowEditTenant(false)} title="Edit Tenant">
        <form onSubmit={handleEditTenant} className="space-y-4">
          {editError && <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm">{editError}</div>}
          <Input label="Full Name" value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} required />
          <Input label="Phone Number" type="tel" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} required />
          <Input label="Email" type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
          <Input label="Emergency Contact" value={editForm.emergency_contact} onChange={e => setEditForm(p => ({ ...p, emergency_contact: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={editLoading}>Save Changes</Button>
            <Button type="button" variant="secondary" onClick={() => setShowEditTenant(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Vacate confirm */}
      <ConfirmDialog
        isOpen={confirmVacate}
        title="Mark as Vacated"
        message="Mark this tenant as vacated? Their room will be freed and they will lose access."
        confirmLabel="Vacate"
        danger
        onConfirm={handleVacate}
        onCancel={() => setConfirmVacate(false)}
      />

      {/* Assign Room Modal */}
      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title="Assign Room">
        <form onSubmit={handleAssignRoom} className="space-y-4">
          {assignError && (
            <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm">
              {assignError}
            </div>
          )}
          {availableRooms.length === 0 ? (
            <p className="text-sm text-text-secondary py-4 text-center">No available rooms. Add rooms to a property first.</p>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-primary">Available Room</label>
                <select
                  value={selectedRoom}
                  onChange={e => setSelectedRoom(e.target.value)}
                  className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
                >
                  <option value="">Select a room...</option>
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.propertyName} — Room {r.room_number} ({formatCurrency(r.rent_amount)}/mo)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" isLoading={assignLoading}>Assign</Button>
                <Button type="button" variant="secondary" onClick={() => setShowAssign(false)}>Cancel</Button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default TenantDetail;
