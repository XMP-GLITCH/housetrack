import React from 'react';

export const Card = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-surface border border-border rounded-card p-5 shadow-card transition-shadow duration-200 ${onClick ? 'cursor-pointer hover:shadow-card-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
