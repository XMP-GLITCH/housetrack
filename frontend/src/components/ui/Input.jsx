import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <input
        ref={ref}
        className={`bg-surface border rounded-btn px-3.5 py-2.5 text-sm text-text-primary outline-none transition-colors 
        ${error ? 'border-danger focus:border-danger' : 'border-border focus:border-accent'}`}
        {...props}
      />
      {error && <span className="text-xs text-danger mt-1">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
