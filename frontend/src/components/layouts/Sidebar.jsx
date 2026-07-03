import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Building, Users, CreditCard, MessageSquare, PieChart, LogOut, Menu, Settings } from 'lucide-react';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = {
    landlord: [
      { path: '/landlord/dashboard', label: 'Dashboard', icon: Home },
      { path: '/landlord/properties', label: 'Properties', icon: Building },
      { path: '/landlord/tenants', label: 'Tenants', icon: Users },
      { path: '/landlord/payments', label: 'Payments', icon: CreditCard },
      { path: '/landlord/complaints', label: 'Complaints', icon: MessageSquare },
      { path: '/landlord/reports', label: 'Reports', icon: PieChart },
      { path: '/landlord/settings', label: 'Settings', icon: Settings },
    ],
    tenant: [
      { path: '/tenant/dashboard', label: 'Dashboard', icon: Home },
      { path: '/tenant/payments', label: 'Payments', icon: CreditCard },
      { path: '/tenant/complaints', label: 'Complaints', icon: MessageSquare },
    ],
    admin: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
      { path: '/admin/users',     label: 'Users',      icon: Users },
    ]
  };

  const links = user ? navItems[user.role] : [];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed inset-y-0 left-0 bg-surface border-r border-border w-60 transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between lg:justify-center">
          <h1 className="text-2xl font-bold text-accent tracking-tight">HouseTrack</h1>
          <button className="lg:hidden text-text-secondary" onClick={toggleSidebar}>
            <Menu />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-btn text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-accent-light text-accent' 
                      : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                  }`
                }
              >
                <Icon size={20} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="mb-4 px-2">
            <p className="text-sm font-semibold text-text-primary">{user?.full_name}</p>
            <p className="text-xs text-text-tertiary capitalize">{user?.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-danger hover:bg-danger-light rounded-btn transition-colors text-sm font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
