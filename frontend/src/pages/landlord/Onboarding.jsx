import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, DoorOpen, Users, CheckCircle2, Plus, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Villa', 'Commercial', 'Other'];
const ROOM_TYPES = [
  { label: 'Single',         value: 'single' },
  { label: 'Double',         value: 'double' },
  { label: 'Studio',         value: 'studio' },
  { label: 'Self-Contained', value: 'self_contained' },
  { label: 'Suite',          value: 'suite' },
  { label: 'Other',          value: 'other' },
];

const STEPS = [
  { id: 1, label: 'Property', icon: Building },
  { id: 2, label: 'Rooms',    icon: DoorOpen  },
  { id: 3, label: 'Tenant',   icon: Users      },
];

const ProgressBar = ({ step }) => (
  <div className="flex items-center gap-2 mb-10">
    {STEPS.map((s, idx) => {
      const Icon = s.icon;
      const done   = s.id < step;
      const active = s.id === step;
      return (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              done   ? 'bg-accent text-white'
              : active ? 'bg-accent/15 border-2 border-accent text-accent'
              : 'bg-surface-alt border-2 border-border text-text-tertiary'
            }`}>
              {done ? <CheckCircle2 size={17} /> : <Icon size={16} />}
            </div>
            <span className={`text-[11px] font-medium ${active ? 'text-accent' : done ? 'text-text-secondary' : 'text-text-tertiary'}`}>
              {s.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 transition-colors ${s.id < step ? 'bg-accent' : 'bg-border'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const ErrorBox = ({ msg }) => msg ? (
  <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm">{msg}</div>
) : null;

const StepProperty = ({ onNext }) => {
  const [form, setForm] = useState({ property_name: '', location: '', property_type: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.property_name || !form.location || !form.property_type) {
      setError('Name, location, and type are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/properties', form);
      if (res.data.success) onNext(res.data.data);
    } catch {
      setError('Failed to create property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Add your first property</h2>
        <p className="text-sm text-text-secondary mt-1">Tell us about the building you manage.</p>
      </div>
      <ErrorBox msg={error} />
      <Input label="Property Name" name="property_name" placeholder="e.g. Immeuble Mbarga" value={form.property_name} onChange={set} required />
      <Input label="Location" name="location" placeholder="e.g. Bastos, Yaoundé" value={form.location} onChange={set} required />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">Property Type</label>
        <select name="property_type" value={form.property_type} onChange={set} required
          className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors">
          <option value="">Select a type…</option>
          {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">
          Description <span className="text-text-tertiary font-normal">(optional)</span>
        </label>
        <textarea name="description" value={form.description} onChange={set} rows={2}
          placeholder="Any details about this property…"
          className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors resize-none" />
      </div>
      <Button type="submit" isLoading={loading} className="w-full">
        Continue <ArrowRight size={15} className="ml-1.5" />
      </Button>
    </form>
  );
};

const emptyRoom = () => ({ room_number: '', room_type: '', rent_amount: '' });

const StepRooms = ({ property, onNext, onSkip }) => {
  const [rooms, setRooms] = useState([emptyRoom()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (idx, field, val) =>
    setRooms(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));

  const submit = async (e) => {
    e.preventDefault();
    const valid = rooms.filter(r => r.room_number && r.room_type && Number(r.rent_amount) > 0);
    if (valid.length === 0) { setError('Fill in at least one complete room, or skip this step.'); return; }
    setLoading(true);
    setError('');
    try {
      const results = await Promise.all(
        valid.map(r => api.post(`/rooms/property/${property.id}`, { room_number: r.room_number, room_type: r.room_type, rent_amount: Number(r.rent_amount) }))
      );
      onNext(results.map(r => r.data.data));
    } catch {
      setError('Failed to create rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Add rooms</h2>
        <p className="text-sm text-text-secondary mt-1">
          Rooms in <span className="font-medium text-text-primary">{property.property_name}</span>. You can add more later.
        </p>
      </div>
      <ErrorBox msg={error} />

      <div className="space-y-2.5">
        {rooms.map((room, idx) => (
          <div key={idx} className="flex gap-2 items-end bg-surface-alt rounded-card p-3">
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-secondary">Room #</label>
                <input value={room.room_number} onChange={e => update(idx, 'room_number', e.target.value)}
                  placeholder="101"
                  className="bg-surface border border-border rounded-btn px-2.5 py-2 text-sm text-text-primary outline-none focus:border-accent transition-colors" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-secondary">Type</label>
                <select value={room.room_type} onChange={e => update(idx, 'room_type', e.target.value)}
                  className="bg-surface border border-border rounded-btn px-2 py-2 text-sm text-text-primary outline-none focus:border-accent transition-colors">
                  <option value="">Type…</option>
                  {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-secondary">Rent (XAF)</label>
                <input type="number" value={room.rent_amount} onChange={e => update(idx, 'rent_amount', e.target.value)}
                  placeholder="50000" min="0"
                  className="bg-surface border border-border rounded-btn px-2.5 py-2 text-sm text-text-primary outline-none focus:border-accent transition-colors" />
              </div>
            </div>
            {rooms.length > 1 && (
              <button type="button" onClick={() => setRooms(prev => prev.filter((_, i) => i !== idx))}
                className="text-text-tertiary hover:text-danger transition-colors pb-0.5">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button type="button" onClick={() => setRooms(prev => [...prev, emptyRoom()])}
        className="flex items-center gap-1.5 text-sm text-accent font-medium hover:underline">
        <Plus size={14} /> Add another room
      </button>

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={loading} className="flex-1">
          Continue <ArrowRight size={15} className="ml-1.5" />
        </Button>
        <Button type="button" variant="secondary" onClick={onSkip}>Skip for now</Button>
      </div>
    </form>
  );
};

const StepTenant = ({ rooms, onDone }) => {
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', move_in_date: '', room_id: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.move_in_date) {
      setError('Name, phone, and move-in date are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/tenants', {
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        move_in_date: form.move_in_date,
      });
      if (res.data.success && form.room_id) {
        await api.post(`/tenants/${res.data.data.id}/assign-room`, { room_id: form.room_id });
      }
      onDone();
    } catch {
      setError('Failed to add tenant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Add your first tenant</h2>
        <p className="text-sm text-text-secondary mt-1">You can always add more from the Tenants tab.</p>
      </div>
      <ErrorBox msg={error} />
      <Input label="Full Name" name="full_name" placeholder="e.g. Jean Mbarga" value={form.full_name} onChange={set} required />
      <Input label="Phone Number" name="phone" type="tel" placeholder="e.g. 677000000" value={form.phone} onChange={set} required />
      <Input label="Email" name="email" type="email" placeholder="optional — for app access" value={form.email} onChange={set} />
      <Input label="Move-in Date" name="move_in_date" type="date" value={form.move_in_date} onChange={set} required />
      {rooms.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            Assign to Room <span className="text-text-tertiary font-normal">(optional)</span>
          </label>
          <select name="room_id" value={form.room_id} onChange={set}
            className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors">
            <option value="">Don't assign yet</option>
            {rooms.map(r => <option key={r.id} value={r.id}>Room {r.room_number}</option>)}
          </select>
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={loading} className="flex-1">
          Finish setup <CheckCircle2 size={15} className="ml-1.5" />
        </Button>
        <Button type="button" variant="secondary" onClick={onDone}>Skip</Button>
      </div>
    </form>
  );
};

const StepDone = ({ onGo }) => (
  <div className="text-center py-6">
    <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-5">
      <CheckCircle2 size={38} className="text-success" />
    </div>
    <h2 className="text-2xl font-bold text-text-primary mb-2">You're all set!</h2>
    <p className="text-sm text-text-secondary mb-8 max-w-xs mx-auto">
      Your property is ready to go. Add more rooms, tenants, and track payments from your dashboard.
    </p>
    <Button onClick={onGo} className="w-full">Go to Dashboard</Button>
  </div>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);

  return (
    <div className="min-h-screen bg-background flex items-start justify-center pt-10 px-4 pb-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold text-accent tracking-tight">HouseTrack</p>
          <p className="text-sm text-text-secondary mt-1.5">Let's get your account set up — takes about 2 minutes.</p>
        </div>

        <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
          {step < 4 && <ProgressBar step={step} />}

          {step === 1 && (
            <StepProperty onNext={(prop) => { setProperty(prop); setStep(2); }} />
          )}
          {step === 2 && (
            <StepRooms
              property={property}
              onNext={(created) => { setRooms(created); setStep(3); }}
              onSkip={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepTenant rooms={rooms} onDone={() => setStep(4)} />
          )}
          {step === 4 && (
            <StepDone onGo={() => navigate('/landlord/dashboard')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
