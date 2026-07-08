import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');

  const [status, setStatus] = useState('verifying'); // verifying | confirmed | failed

  useEffect(() => {
    if (!reference) { setStatus('confirmed'); return; }

    const verify = async () => {
      try {
        const res = await api.post('/payments/verify', { reference });
        setStatus(res.data.success ? 'confirmed' : 'failed');
      } catch {
        // Verification failed (network, DB down, etc.) — don't block the user
        setStatus('failed');
      }
    };

    verify();
  }, [reference]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-surface border border-border rounded-card p-10 text-center max-w-md w-full shadow-card">

        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 bg-surface-alt rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader size={36} className="text-accent animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Confirming Payment…</h1>
            <p className="text-sm text-text-secondary">Please wait while we verify your payment with Notchpay.</p>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-success" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Payment Confirmed!</h1>
            <p className="text-sm text-text-secondary mb-6">
              Your rent payment has been verified and a receipt has been generated.
            </p>
            {reference && (
              <p className="text-xs text-text-tertiary mb-6 bg-surface-alt px-4 py-2 rounded-btn">
                Reference: <span className="font-semibold text-text-primary">{reference}</span>
              </p>
            )}
            <Link
              to="/tenant/payments"
              className="inline-flex items-center justify-center px-8 py-3 bg-accent text-white rounded-btn text-sm font-semibold hover:bg-[#B8711A] transition-colors"
            >
              View My Payments
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-warning-light rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-warning" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Payment Received</h1>
            <p className="text-sm text-text-secondary mb-6">
              Notchpay confirmed your payment. Your records will update shortly — check your payments page in a moment.
            </p>
            {reference && (
              <p className="text-xs text-text-tertiary mb-6 bg-surface-alt px-4 py-2 rounded-btn">
                Reference: <span className="font-semibold text-text-primary">{reference}</span>
              </p>
            )}
            <Link
              to="/tenant/payments"
              className="inline-flex items-center justify-center px-8 py-3 bg-accent text-white rounded-btn text-sm font-semibold hover:bg-[#B8711A] transition-colors"
            >
              View My Payments
            </Link>
          </>
        )}

      </div>
    </div>
  );
};

export default PaymentSuccess;
