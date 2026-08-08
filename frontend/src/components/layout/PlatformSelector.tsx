import React from 'react';
import { Shield, Send, Inbox, LayoutDashboard, History, Settings } from 'lucide-react';
import { NavigationPage } from '../../types';

interface PlatformSelectorProps {
  currentPage: NavigationPage;
  setPage: (page: NavigationPage) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ currentPage, setPage }) => {
  const items = [
    { id: 'home' as NavigationPage, name: 'Home', icon: Shield },
    { id: 'sender' as NavigationPage, name: 'Sender Platform', icon: Send },
    { id: 'receiver' as NavigationPage, name: 'Receiver Platform', icon: Inbox },
    { id: 'dashboard' as NavigationPage, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'history' as NavigationPage, name: 'History', icon: History },
    { id: 'settings' as NavigationPage, name: 'Settings', icon: Settings },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      padding: '6px',
      background: 'rgba(12, 18, 30, 0.8)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)',
      marginBottom: '18px',
      overflowX: 'auto'
    }}>
      {items.map((p) => {
        const Icon = p.icon;
        const isActive = currentPage === p.id;
        return (
          <button
            key={p.id}
            onClick={() => setPage(p.id)}
            className={`btn ${isActive ? 'btn-primary-green' : 'btn-ghost'}`}
            style={{
              flex: '1',
              minWidth: '130px',
              fontSize: '0.78rem',
              padding: '6px 10px'
            }}
          >
            <Icon size={14} />
            <span>{p.name}</span>
          </button>
        );
      })}
    </div>
  );
};
