import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const NewTenant = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    move_in_date: '',
    emergency_contact: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.full_name || !form.phone || !form.move_in_date) {
      setError('Name, phone, and move-in date are required.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/tenants', form);
      if (res.data.success) {
        navigate(`/landlord/tenants/${res.data.data.id}`);
      }
    } catch {
      setError('Failed to register tenant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/landlord/tenants" className="text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">New Tenant</h1>
          <p className="text-sm text-text-secondary mt-0.5">Register a tenant to your portfolio</p>
        </div>
      </div>

      <Card>
        {error && (
          <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            name="full_name"
            placeholder="e.g. Jean Mbarga"
            value={form.full_name}
            onChange={handleChange}
            required
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="e.g. 677000000"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="optional"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            label="Move-in Date"
            name="move_in_date"
            type="date"
            value={form.move_in_date}
            onChange={handleChange}
            required
          />
          <Input
            label="Emergency Contact"
            name="emergency_contact"
            placeholder="Name and phone (optional)"
            value={form.emergency_contact}
            onChange={handleChange}
          />

          <p className="text-xs text-text-tertiary pt-1">
            You can assign a room to this tenant on the next screen.
          </p>

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isLoading}>Register Tenant</Button>
            <Link to="/landlord/tenants">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewTenant;
