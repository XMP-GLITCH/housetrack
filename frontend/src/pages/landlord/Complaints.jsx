import React, { useEffect, useState } from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/helpers';

const STATUS_FILTERS = ['all', 'pending', 'in_progress', 'resolved'];
const STATUS_TRANSITIONS = {
  pending: 'in_progress',
  in_progress: 'resolved',
  resolved: null,
};
const NEXT_LABEL = { in_progress: 'Mark In Progress', resolved: 'Mark Resolved' };

const Complaints = () => {
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      if (res.data.success) setComplaints(res.data.data ?? []);
    } catch {
      setError('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(id);
    try {
      await api.patch(`/complaints/${id}/status`, { status: newStatus });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast(newStatus === 'resolved' ? 'Complaint marked as resolved.' : 'Status updated to in progress.');
    } catch {
      toast('Failed to update status.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  const daysSince = (date) => Math.floor((Date.now() - new Date(date)) / 86400000);

  if (loading) {
    return (
      <div>
        <div className="mb-8 space-y-2">
          <div className="h-7 w-32 bg-surface-alt rounded-btn animate-pulse" />
          <div className="h-4 w-40 bg-surface-alt rounded-btn animate-pulse" />
        </div>
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-surface-alt rounded-pill animate-pulse" />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} rows={4} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Complaints</h1>
        <p className="text-sm text-text-secondary mt-1">{complaints.length} complaint{complaints.length !== 1 ? 's' : ''} total</p>
      </div>

      {error && (
        <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm mb-6">{error}</div>
      )}

      {/* Status summary */}
      {!loading && complaints.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="flex flex-col items-center justify-center py-4 px-4 bg-danger/8 border border-danger/20 rounded-card">
            <span className="text-2xl font-bold text-danger">{complaints.filter(c => c.status === 'pending').length}</span>
            <span className="text-xs text-text-tertiary mt-0.5">Pending</span>
          </div>
          <div className="flex flex-col items-center justify-center py-4 px-4 bg-warning/8 border border-warning/20 rounded-card">
            <span className="text-2xl font-bold text-warning">{complaints.filter(c => c.status === 'in_progress').length}</span>
            <span className="text-xs text-text-tertiary mt-0.5">In Progress</span>
          </div>
          <div className="flex flex-col items-center justify-center py-4 px-4 bg-success/8 border border-success/20 rounded-card">
            <span className="text-2xl font-bold text-success">{complaints.filter(c => c.status === 'resolved').length}</span>
            <span className="text-xs text-text-tertiary mt-0.5">Resolved</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-pill text-sm font-medium transition-colors capitalize ${
              filter === s ? 'bg-accent text-white' : 'bg-surface border border-border text-text-secondary hover:bg-surface-alt'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={28} className="text-text-tertiary" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">No complaints</h3>
          <p className="text-sm text-text-secondary">
            {filter === 'all' ? 'No complaints have been filed yet.' : `No ${filter.replace('_', ' ')} complaints.`}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(c => {
            const nextStatus = STATUS_TRANSITIONS[c.status];
            const age = daysSince(c.created_at);
            const urgent = c.status === 'pending' && age >= 3;
            return (
              <Card key={c.id} className={urgent ? 'border-l-2 border-l-danger' : ''}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-text-primary">{c.title}</h3>
                      <span className="text-xs bg-surface-alt text-text-tertiary px-2 py-0.5 rounded-pill capitalize">
                        {c.category}
                      </span>
                      {urgent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-pill">
                          <Clock size={10} /> {age}d old
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary flex-wrap">
                      <span>{c.tenant?.full_name ?? 'Unknown'}</span>
                      {c.room && <><span>·</span><span>Room {c.room.room_number}</span></>}
                      {c.room?.property && <><span>·</span><span>{c.room.property.property_name}</span></>}
                      <span>·</span>
                      <span>{formatDate(c.created_at)}</span>
                      {age === 0 && <><span>·</span><span className="text-accent">Today</span></>}
                      {age === 1 && <><span>·</span><span>Yesterday</span></>}
                      {age > 1 && <><span>·</span><span>{age} days ago</span></>}
                    </div>
                  </div>
                  <Badge status={c.status} />
                </div>

                <p className="text-sm text-text-secondary leading-relaxed mb-3">{c.description}</p>

                {nextStatus && (
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <button
                      onClick={() => handleStatusUpdate(c.id, nextStatus)}
                      disabled={updating === c.id}
                      className="px-3 py-1.5 text-xs font-semibold rounded-btn bg-accent text-white hover:bg-[#B8711A] transition-colors disabled:opacity-50"
                    >
                      {updating === c.id ? 'Updating…' : NEXT_LABEL[nextStatus]}
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Complaints;
