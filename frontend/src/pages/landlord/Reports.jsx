import React, { useEffect, useState } from 'react';
import { Building, CreditCard, PieChart } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/helpers';

const StatRow = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
    <p className="text-sm text-text-secondary">{label}</p>
    <p className={`text-sm font-bold ${highlight ? highlight : 'text-text-primary'}`}>{value}</p>
  </div>
);

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/summary');
        if (res.data.success) setStats(res.data.data);
        else setError('Could not load report data.');
      } catch {
        setError('Failed to load report data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !stats) {
    return <p className="text-sm text-danger py-10">{error || 'No data available.'}</p>;
  }

  const occupancyRate = stats.totalRooms > 0
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        <p className="text-sm text-text-secondary mt-1">Portfolio snapshot for the current month</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Property Overview */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Building size={18} className="text-accent" />
            <h2 className="text-base font-semibold text-text-primary">Property Overview</h2>
          </div>
          <StatRow label="Total Properties" value={stats.totalProperties} />
          <StatRow label="Total Rooms" value={stats.totalRooms} />
          <StatRow label="Occupied Rooms" value={stats.occupiedRooms} highlight="text-warning" />
          <StatRow label="Available Rooms" value={stats.availableRooms} highlight="text-success" />
        </Card>

        {/* Monthly Payments */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-accent" />
            <h2 className="text-base font-semibold text-text-primary">This Month</h2>
          </div>
          <StatRow label="Total Collected" value={formatCurrency(stats.monthlyIncome)} highlight="text-accent" />
          <StatRow label="Paid Tenants" value={stats.paidTenants} highlight="text-success" />
          <StatRow label="Unpaid Tenants" value={stats.unpaidTenants} highlight="text-danger" />
          <StatRow label="Pending Complaints" value={stats.pendingComplaints} highlight="text-warning" />
        </Card>
      </div>

      {/* Occupancy Visual */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <PieChart size={18} className="text-accent" />
          <h2 className="text-base font-semibold text-text-primary">Occupancy Breakdown</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-surface-alt rounded-card p-5 text-center">
            <p className="text-4xl font-bold text-text-primary mb-1">{occupancyRate}%</p>
            <p className="text-xs text-text-tertiary uppercase tracking-wide">Occupancy</p>
          </div>
          <div className="bg-success-light rounded-card p-5 text-center">
            <p className="text-4xl font-bold text-success mb-1">{stats.availableRooms}</p>
            <p className="text-xs text-text-tertiary uppercase tracking-wide">Available</p>
          </div>
          <div className="bg-warning-light rounded-card p-5 text-center">
            <p className="text-4xl font-bold text-warning mb-1">{stats.occupiedRooms}</p>
            <p className="text-xs text-text-tertiary uppercase tracking-wide">Occupied</p>
          </div>
        </div>

        {stats.totalRooms > 0 && (
          <div>
            <div className="h-3 bg-surface-alt rounded-full overflow-hidden">
              <div
                className="h-full bg-warning rounded-full transition-all duration-700"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-text-tertiary">0% empty</span>
              <span className="text-xs text-text-tertiary">100% full</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reports;
