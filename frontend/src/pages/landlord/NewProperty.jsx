import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Villa', 'Commercial', 'Other'];

const NewProperty = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    property_name: '',
    location: '',
    property_type: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.property_name || !form.location || !form.property_type) {
      setError('Name, location, and type are required.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/properties', form);
      if (res.data.success) {
        navigate(`/landlord/properties/${res.data.data.id}`);
      }
    } catch {
      setError('Failed to create property. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/landlord/properties" className="text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">New Property</h1>
          <p className="text-sm text-text-secondary mt-0.5">Add a property to your portfolio</p>
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
            label="Property Name"
            name="property_name"
            placeholder="e.g. Immeuble Mbarga"
            value={form.property_name}
            onChange={handleChange}
            required
          />

          <Input
            label="Location"
            name="location"
            placeholder="e.g. Bastos, Yaoundé"
            value={form.location}
            onChange={handleChange}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Property Type</label>
            <select
              name="property_type"
              value={form.property_type}
              onChange={handleChange}
              required
              className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
            >
              <option value="">Select a type...</option>
              {PROPERTY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Description <span className="text-text-tertiary font-normal">(optional)</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Any additional details about this property..."
              className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isLoading}>
              Create Property
            </Button>
            <Link to="/landlord/properties">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewProperty;
