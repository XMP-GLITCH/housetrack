import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { formatDate } from '../../utils/helpers';

const STEPS = ['pending', 'in_progress', 'resolved'];
const STEP_LABELS = { pending: 'Submitted', in_progress: 'In Progress', resolved: 'Resolved' };

const ComplaintTimeline = ({ status }) => {
  const currentIdx = STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-4">
      {STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const isLast = idx === STEPS.length - 1;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                done
                  ? 'bg-accent border-accent'
                  : 'bg-surface border-border'
              }`}>
                {done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className={`text-[10px] font-medium mt-1.5 whitespace-nowrap ${done ? 'text-accent' : 'text-text-tertiary'}`}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mb-4 transition-colors ${idx < currentIdx ? 'bg-accent' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const TenantComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const tenantRes = await api.get('/tenants/me');
        if (!tenantRes.data.success) throw new Error('Profile not found');
        const tenantId = tenantRes.data.data.id;
        const res = await api.get(`/complaints/tenant/${tenantId}`);
        if (res.data.success) setComplaints(res.data.data ?? []);
      } catch {
        setError('Failed to load complaints.');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-7 w-36 bg-surface-alt rounded-btn animate-pulse" />
            <div className="h-4 w-24 bg-surface-alt rounded-btn animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} rows={4} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Complaints</h1>
          <p className="text-sm text-text-secondary mt-1">{complaints.length} complaint{complaints.length !== 1 ? 's' : ''} filed</p>
        </div>
        <Link
          to="/tenant/complaints/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-btn text-sm font-semibold hover:bg-[#B8711A] transition-colors"
        >
          <Plus size={18} /> New Complaint
        </Link>
      </div>

      {error && (
        <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm mb-6">{error}</div>
      )}

      {complaints.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={28} className="text-text-tertiary" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">No complaints</h3>
          <p className="text-sm text-text-secondary mb-6">Have an issue? Let your landlord know.</p>
          <Link
            to="/tenant/complaints/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-btn text-sm font-semibold hover:bg-[#B8711A] transition-colors"
          >
            <Plus size={16} /> File a Complaint
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {complaints.map(c => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary">{c.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                    <span className="capitalize bg-surface-alt px-2 py-0.5 rounded-pill">{c.category}</span>
                    <span>·</span>
                    <span>{formatDate(c.created_at)}</span>
                  </div>
                </div>
                <Badge status={c.status} />
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{c.description}</p>
              <ComplaintTimeline status={c.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantComplaints;
