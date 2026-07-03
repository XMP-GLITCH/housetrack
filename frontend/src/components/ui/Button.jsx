import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled, 
  ...props 
}) => {
  const baseStyle = "px-5 py-2.5 rounded-btn font-semibold transition-all duration-200 flex items-center justify-center";
  
  const variants = {
    primary: "bg-accent text-white hover:bg-[#B8711A] active:scale-[0.98]",
    secondary: "bg-surface border border-border text-text-primary hover:bg-surface-alt active:scale-[0.98]",
    danger: "bg-danger text-white hover:bg-[#A93226] active:scale-[0.98]",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${disabled || isLoading ? 'opacity-70 cursor-not-allowed active:scale-100' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};
