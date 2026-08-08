import React from 'react';
import { 
  Shield, 
  Send, 
  Inbox, 
  Activity,
  LayoutDashboard, 
  History, 
  Settings, 
  Lock, 
  ChevronRight, 
  User 
} from 'lucide-react';
import { NavigationPage, UserProfile } from '../../types';

interface SidebarProps {
  currentPage: NavigationPage;
  setPage: (page: NavigationPage) => void;
  user: UserProfile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage, user }) => {
  const menuItems = [
    {
      id: 'home' as NavigationPage,
      label: 'CyberShield AI / Home',
      subtext: 'Central Defense & Threat Guard',
      icon: Shield,
      badge: 'Core'
    },
    {
      id: 'sender' as NavigationPage,
      label: 'Sender Platform',
      subtext: 'Attack Simulation & Test Hub',
      icon: Send,
      badge: 'P1'
    },
    {
      id: 'receiver' as NavigationPage,
      label: 'Receiver Platform',
      subtext: 'Multi-App Simulated Surfaces',
      icon: Inbox,
      badge: 'P2'
    },
    {
      id: 'monitor' as NavigationPage,
      label: 'Communication Monitor',
      subtext: 'Real-Time Event Stream & Bus',
      icon: Activity,
      badge: 'Stream'
    },
    {
      id: 'dashboard' as NavigationPage,
      label: 'Security Dashboard',
      subtext: 'Analytics & Threat Distribution',
      icon: LayoutDashboard,
      badge: 'Metrics'
    },
    {
      id: 'history' as NavigationPage,
      label: 'Security History',
      subtext: 'Incident Logs & Quarantine',
      icon: History,
      badge: 'Audit'
    },
    {
      id: 'settings' as NavigationPage,
      label: 'Settings',
      subtext: 'Privacy, Adapters & Shields',
      icon: Settings,
      badge: 'Config'
    }
  ];

  return (
    <aside className="desktop-sidebar">
      <div style={{ padding: '24px 18px 16px 18px' }}>
        <div style={{ 
          fontSize: '0.7rem', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '1px', 
          color: 'var(--text-muted)',
          marginBottom: '12px'
        }}>
          Navigation Center
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative'
                }}
              >
                <div className="nav-icon" style={{
                  color: isActive ? 'var(--color-green)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Icon size={19} />
                </div>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.subtext}
                  </div>
                </div>
                {isActive && (
                  <ChevronRight size={14} color="var(--color-green)" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Section & Bottom Protection Engine Badge */}
      <div style={{ marginTop: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {user && (
          <div 
            onClick={() => setPage('profile')}
            className="cyber-card" 
            style={{ 
              padding: '10px 12px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: currentPage === 'profile' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--color-green)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {user.fullName.charAt(0)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.fullName}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {user.role}
                </div>
              </div>
            </div>
            <User size={14} color="var(--text-muted)" />
          </div>
        )}

        <div className="cyber-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="live-dot" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              CyberShield Defense
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--color-green)' }}>
            <Lock size={11} />
            <span>Authenticated Session Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
