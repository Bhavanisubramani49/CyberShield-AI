import React from 'react';
import { 
  Shield, 
  Send, 
  Inbox, 
  LayoutDashboard, 
  History, 
  Settings, 
  Lock,
  ChevronRight
} from 'lucide-react';
import { NavigationPage } from '../../types';

interface SidebarProps {
  currentPage: NavigationPage;
  setPage: (page: NavigationPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage }) => {
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
                    color: isActive ? '#ffffff' : 'var(--text-secondary)'
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

      {/* Bottom Protection Engine Badge */}
      <div style={{ marginTop: 'auto', padding: '18px' }}>
        <div className="cyber-card" style={{ padding: '14px', background: 'rgba(19, 28, 46, 0.95)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="live-dot" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>
              CyberShield Defense
            </span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Real-time multi-modal monitoring initialized for authorized communication events.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.7rem', color: 'var(--color-green)' }}>
            <Lock size={12} />
            <span>Encrypted Sandbox Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
