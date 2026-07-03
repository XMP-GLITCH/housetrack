import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export const ConfirmDialog = ({ isOpen, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-surface rounded-[16px] shadow-xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-danger-light' : 'bg-warning-light'}`}>
          <AlertTriangle size={22} className={danger ? 'text-danger' : 'text-warning'} />
        </div>
        <h3 className="text-base font-bold text-text-primary mb-1.5">{title}</h3>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} className="flex-1">
            {confirmLabel}
          </Button>
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
