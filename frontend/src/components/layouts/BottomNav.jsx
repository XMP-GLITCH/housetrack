import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Building, Users, CreditCard, Settings, MessageSquare } from 'lucide-react';

export const BottomNav = () => {
  const { user } = useAuth();

  const navItems = {
    landlord: [
      { path: '/landlord/dashboard', label: 'Home',     icon: Home     },
      { path: '/landlord/properties', label: 'Props',    icon: Building },
      { path: '/landlord/tenants',    label: 'Tenants',  icon: Users    },
      { path: '/landlord/payments',   label: 'Payments', icon: CreditCard },
      { path: '/landlord/settings',   label: 'Settings', icon: Settings },
    ],
    tenant: [
      { path: '/tenant/dashboard', label: 'Home', icon: Home },
      { path: '/tenant/payments', label: 'Payments', icon: CreditCard },
      { path: '/tenant/complaints', label: 'Issues', icon: MessageSquare },
    ],
    admin: [
      { path: '/admin/dashboard', label: 'Home', icon: Home },
      { path: '/admin/users', label: 'Users', icon: Users },
    ]
  };

  const links = user ? navItems[user.role] : [];
  
  // Mobile bottom nav should generally max out at 5 items for visual clarity
  const mobileLinks = links.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-md border-t border-border/50 pb-safe lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors ${
                  isActive ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-accent rounded-full" />
                  )}
                  <Icon size={21} className="mb-1" />
                  <span className={`text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {link.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
