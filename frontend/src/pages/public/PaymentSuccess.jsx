import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-surface border border-border rounded-card p-10 text-center max-w-md w-full shadow-card">
        <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-success" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Payment Successful!</h1>
        <p className="text-sm text-text-secondary mb-6">
          Your rent payment has been received and a receipt has been generated.
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
      </div>
    </div>
  );
};

export default PaymentSuccess;
