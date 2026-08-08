import React from 'react';
import { Shield, LayoutDashboard, History, Settings, Bell } from 'lucide-react';
import { NavigationPage } from '../../types';

interface MobileBottomNavProps {
  currentPage: NavigationPage;
  setPage: (page: NavigationPage) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentPage, setPage }) => {
  const tabs = [
    { id: 'home' as NavigationPage, label: 'Home', icon: Shield },
    { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notifications' as NavigationPage, label: 'Alerts', icon: Bell },
    { id: 'history' as NavigationPage, label: 'History', icon: History },
    { id: 'settings' as NavigationPage, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="mobile-bottom-bar" aria-label="Mobile navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPage === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setPage(tab.id)}
            className={`mobile-bottom-btn ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} color={isActive ? 'var(--color-green)' : 'var(--text-muted)'} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
