import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const CATEGORIES = ['Plumbing', 'Electrical', 'Structural', 'Pest Control', 'Noise', 'Security', 'Cleaning', 'Other'];

const NewComplaint = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', category: '', description: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.category || !form.description) {
      setError('All fields are required.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/complaints', form);
      if (res.data.success) navigate('/tenant/complaints');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint. Make sure you are assigned to a room.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/tenant/complaints" className="text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">New Complaint</h1>
          <p className="text-sm text-text-secondary mt-0.5">Report an issue to your landlord</p>
        </div>
      </div>

      <Card>
        {error && (
          <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm mb-6">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Title"
            name="title"
            placeholder="e.g. Water leak in bathroom"
            value={form.title}
            onChange={handleChange}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors"
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c.toLowerCase()}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe the issue in detail..."
              className="bg-surface border border-border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isLoading}>Submit Complaint</Button>
            <Link to="/tenant/complaints">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewComplaint;
