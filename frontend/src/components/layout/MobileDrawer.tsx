import React from 'react';
import { 
  Shield, 
  Send, 
  Inbox, 
  LayoutDashboard, 
  History, 
  Settings, 
  X, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { NavigationPage } from '../../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: NavigationPage;
  setPage: (page: NavigationPage) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ 
  isOpen, 
  onClose, 
  currentPage, 
  setPage 
}) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'home' as NavigationPage, label: 'CyberShield AI / Home', icon: Shield, desc: 'Central Threat Guard' },
    { id: 'sender' as NavigationPage, label: 'Sender Platform', icon: Send, desc: 'Attack Simulation Hub' },
    { id: 'receiver' as NavigationPage, label: 'Receiver Platform', icon: Inbox, desc: 'Multi-App Simulated Surfaces' },
    { id: 'dashboard' as NavigationPage, label: 'Security Dashboard', icon: LayoutDashboard, desc: 'Threat Distribution' },
    { id: 'history' as NavigationPage, label: 'Security History', icon: History, desc: 'Audit & Quarantine' },
    { id: 'settings' as NavigationPage, label: 'Settings', icon: Settings, desc: 'Privacy & Configuration' },
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
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>CyberShield AI</div>
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

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`nav-item-btn ${isActive ? 'active' : ''}`}
                style={{ minHeight: '48px' }}
              >
                <div className="nav-icon" style={{
                  color: isActive ? 'var(--color-green)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ 
                    fontSize: '0.88rem', 
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#ffffff' : 'var(--text-secondary)'
                  }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {item.desc}
                  </div>
                </div>
                {isActive && <ChevronRight size={16} color="var(--color-green)" />}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--color-green)' }}>
            <span className="live-dot" />
            <span>8 AI Protection Engines Active</span>
          </div>
        </div>
      </div>
    </>
  );
};
