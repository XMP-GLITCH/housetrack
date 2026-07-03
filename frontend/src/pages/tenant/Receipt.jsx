import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Receipt = () => {
  const { paymentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await api.get(`/receipts/${paymentId}`);
        if (res.data.success) setData(res.data.data);
        else setError('Receipt not found.');
      } catch {
        setError('Failed to load receipt.');
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <Link to="/tenant/payments" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6">
          <ArrowLeft size={16} /> Back to Payments
        </Link>
        <p className="text-sm text-danger mt-4">{error || 'Receipt not found.'}</p>
      </div>
    );
  }

  const { receipt, payment } = data;

  return (
    <div className="max-w-lg">
      <Link to="/tenant/payments" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Payments
      </Link>

      <div className="bg-surface border border-border rounded-card shadow-card overflow-hidden">
        {/* Header */}
        <div className="bg-accent px-8 py-6 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle size={20} />
            <span className="text-lg font-bold">Payment Receipt</span>
          </div>
          <p className="text-sm opacity-80">HouseTrack Property Management</p>
        </div>

        {/* Receipt number */}
        <div className="bg-surface-alt px-8 py-3 text-center border-b border-border">
          <p className="text-xs text-text-tertiary uppercase tracking-widest mb-0.5">Receipt No.</p>
          <p className="text-lg font-mono font-bold text-text-primary">{receipt.receipt_number}</p>
        </div>

        {/* Details */}
        <div className="px-8 py-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Tenant</span>
            <span className="font-semibold text-text-primary">{payment.tenant?.full_name}</span>
          </div>
          {payment.room?.property && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Property</span>
              <span className="font-semibold text-text-primary">{payment.room.property.property_name}</span>
            </div>
          )}
          {payment.room && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Room</span>
              <span className="font-semibold text-text-primary">Room {payment.room.room_number}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Rent Month</span>
            <span className="font-semibold text-text-primary">{payment.rent_month}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Payment Date</span>
            <span className="font-semibold text-text-primary">{formatDate(payment.payment_date)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Receipt Issued</span>
            <span className="font-semibold text-text-primary">{formatDate(receipt.generated_at)}</span>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Rent Amount</span>
              <span className="text-text-primary">{formatCurrency(payment.rent_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Amount Paid</span>
              <span className="text-success font-semibold">{formatCurrency(payment.amount_paid)}</span>
            </div>
            {Number(payment.balance) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Balance Remaining</span>
                <span className="text-danger font-semibold">{formatCurrency(payment.balance)}</span>
              </div>
            )}
          </div>

          <div className="bg-accent-light rounded-btn px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-bold text-accent">Total Paid</span>
            <span className="text-xl font-bold text-accent">{formatCurrency(payment.amount_paid)}</span>
          </div>
        </div>

        <div className="px-8 py-4 border-t border-border text-center">
          <p className="text-xs text-text-tertiary">This is an official payment receipt issued by HouseTrack.</p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
