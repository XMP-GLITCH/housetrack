import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: CheckCircle2, iconCls: 'text-success', borderCls: 'border-success/25' },
  error:   { icon: XCircle,      iconCls: 'text-danger',  borderCls: 'border-danger/25'  },
  info:    { icon: Info,         iconCls: 'text-accent',  borderCls: 'border-accent/25'  },
};

const ToastItem = ({ toast, onRemove }) => {
  const v = VARIANTS[toast.type] ?? VARIANTS.info;
  const Icon = v.icon;
  return (
    <div
      className={`flex items-start gap-3 w-72 bg-surface border ${v.borderCls} rounded-card shadow-card p-4`}
      style={{ animation: 'slideUp 0.2s ease' }}
    >
      <Icon size={17} className={`${v.iconCls} flex-shrink-0 mt-0.5`} />
      <p className="text-sm text-text-primary flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-text-tertiary hover:text-text-primary transition-colors flex-shrink-0 -mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 lg:bottom-6">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
