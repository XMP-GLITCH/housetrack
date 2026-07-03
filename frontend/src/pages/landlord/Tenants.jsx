import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, ChevronRight, ChevronLeft, Phone, Search, X } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/helpers';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 20 };
        if (filter !== 'all') params.status = filter;
        if (search) params.search = search;
        const res = await api.get('/tenants', { params });
        if (res.data.success) {
          const data = res.data.data ?? [];
          setTenants(data);
          setMeta(res.data.meta ?? { total: data.length, page: 1, pages: 1 });
        }
      } catch {
        setError('Failed to load tenants.');
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, [page, filter, search]);

  const handleFilter = (f) => { setFilter(f); setPage(1); };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tenants</h1>
          <p className="text-sm text-text-secondary mt-1">{meta.total} tenant{meta.total !== 1 ? 's' : ''} registered</p>
        </div>
        <Link
          to="/landlord/tenants/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-btn text-sm font-semibold hover:bg-[#B8711A] transition-colors"
        >
          <Plus size={18} /> Add Tenant
        </Link>
      </div>

      {error && (
        <div className="bg-danger-light border border-danger/20 text-danger px-4 py-3 rounded-btn text-sm mb-6">{error}</div>
      )}

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2">
          {['all', 'active', 'vacated'].map(f => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-4 py-1.5 rounded-pill text-sm font-medium transition-colors capitalize ${
                filter === f ? 'bg-accent text-white' : 'bg-surface border border-border text-text-secondary hover:bg-surface-alt'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
          <input
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setPage(1); }}
            placeholder="Search by name or phone…"
            className="bg-surface border border-border rounded-btn pl-8 pr-8 py-1.5 text-sm text-text-primary outline-none focus:border-accent transition-colors w-full sm:w-56"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearch(''); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {tenants.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mb-4">
            <Users size={28} className="text-text-tertiary" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">No tenants found</h3>
          <p className="text-sm text-text-secondary mb-6">
            {filter === 'all' ? 'Register your first tenant to get started.' : `No ${filter} tenants.`}
          </p>
          {filter === 'all' && (
            <Link
              to="/landlord/tenants/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-btn text-sm font-semibold hover:bg-[#B8711A] transition-colors"
            >
              <Plus size={16} /> Add Tenant
            </Link>
          )}
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {tenants.map(tenant => (
              <Link key={tenant.id} to={`/landlord/tenants/${tenant.id}`}>
                <Card className="flex items-center justify-between hover:shadow-card-hover transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-accent">{tenant.full_name?.charAt(0) ?? '?'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{tenant.full_name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-text-tertiary flex items-center gap-1">
                          <Phone size={11} /> {tenant.phone}
                        </span>
                        {tenant.room ? (
                          <span className="text-xs text-text-tertiary">Room {tenant.room.room_number}</span>
                        ) : (
                          <span className="text-xs text-warning">No room assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-text-tertiary">Move-in</p>
                      <p className="text-xs font-medium text-text-primary">{formatDate(tenant.move_in_date)}</p>
                    </div>
                    <Badge status={tenant.status} />
                    <ChevronRight size={16} className="text-text-tertiary" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {meta.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-text-tertiary">Page {meta.page} of {meta.pages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-btn border border-border text-text-secondary hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(meta.pages, p + 1))}
                  disabled={page === meta.pages}
                  className="p-2 rounded-btn border border-border text-text-secondary hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Tenants;
