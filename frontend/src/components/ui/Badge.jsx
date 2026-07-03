import React from 'react';

export const Badge = ({ status, children, className = '' }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'paid':
      case 'available':
      case 'active':
      case 'resolved':
        return 'bg-success-light text-success';
      case 'part_payment':
      case 'occupied':
      case 'in_progress':
        return 'bg-warning-light text-warning';
      case 'overdue':
      case 'pending':
      case 'maintenance':
        return 'bg-danger-light text-danger';
      case 'vacated':
      case 'inactive':
        return 'bg-muted-light text-muted';
      default:
        return 'bg-surface-alt text-text-secondary';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-pill text-[11px] font-semibold uppercase tracking-wide inline-flex items-center ${getStatusStyles(status)} ${className}`}>
      {children || status.replace('_', ' ')}
    </span>
  );
};
