import React from 'react';
import { 
  Shield, 
  Send, 
  Inbox, 
  Activity,
  LayoutDashboard, 
  History, 
  Settings, 
  X, 
  ShieldCheck, 
  ChevronRight, 
  User, 
  LogOut, 
  Sun, 
  Moon 
} from 'lucide-react';
import { NavigationPage, UserProfile, ThemeMode } from '../../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: NavigationPage;
  setPage: (page: NavigationPage) => void;
  user: UserProfile | null;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  onLogout: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ 
  isOpen, 
  onClose, 
  currentPage, 
  setPage, 
  user, 
  theme, 
  setTheme, 
  onLogout 
}) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'home' as NavigationPage, label: 'CyberShield AI / Home', icon: Shield, desc: 'Central Threat Guard' },
    { id: 'sender' as NavigationPage, label: 'Sender Platform', icon: Send, desc: 'Attack Simulation Hub' },
    { id: 'receiver' as NavigationPage, label: 'Receiver Platform', icon: Inbox, desc: 'Multi-App Simulated Surfaces' },
    { id: 'monitor' as NavigationPage, label: 'Communication Monitor', icon: Activity, desc: 'Real-Time Event Stream & Bus' },
    { id: 'dashboard' as NavigationPage, label: 'Security Dashboard', icon: LayoutDashboard, desc: 'Threat Distribution' },
    { id: 'history' as NavigationPage, label: 'Security History', icon: History, desc: 'Audit & Quarantine' },
    { id: 'settings' as NavigationPage, label: 'Settings', icon: Settings, desc: 'Privacy & Configuration' },
    { id: 'profile' as NavigationPage, label: 'User Profile', icon: User, desc: 'Security Credentials' },
  ];

  const handleSelect = (page: NavigationPage) => {
    setPage(page);
    onClose();
  };

  return (
    <>
      <div className="mobile-drawer-overlay" onClick={onClose} />
      <div className="mobile-drawer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.3))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <ShieldCheck size={18} color="var(--color-green)" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>CyberShield AI</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Android Navigation Menu</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '6px', minWidth: '32px', height: '32px' }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div style={{ padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-green)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                {user.fullName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.fullName}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn btn-ghost"
              style={{ padding: '4px' }}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={15} color="var(--color-warning)" /> : <Moon size={15} color="var(--color-blue)" />}
            </button>
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                style={{ minHeight: '44px' }}
              >
                <div className="nav-icon" style={{
                  color: isActive ? 'var(--color-green)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {item.desc}
                  </div>
                </div>
                {isActive && <ChevronRight size={15} color="var(--color-green)" />}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="btn btn-outline"
            style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--color-danger)', fontSize: '0.8rem' }}
          >
            <LogOut size={14} /> Sign Out Session
          </button>
        </div>
      </div>
    </>
  );
};
