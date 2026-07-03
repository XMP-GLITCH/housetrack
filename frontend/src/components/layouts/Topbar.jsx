import React from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Topbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (path === 'dashboard') return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 lg:hidden h-16 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-text-primary">
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-bold text-text-primary">{getPageTitle()}</h2>
      </div>
    </header>
  );
};
