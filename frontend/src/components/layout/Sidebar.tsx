import React from 'react';
import { 
  LayoutDashboard, 
  Send, 
  Inbox, 
  ShieldCheck, 
  Layers, 
  Lock
} from 'lucide-react';
import { PlatformMode } from '../../types';

interface SidebarProps {
  currentMode: PlatformMode;
  setMode: (mode: PlatformMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const menuItems = [
    {
      id: 'dashboard' as PlatformMode,
      label: 'Command Center',
      subtext: 'Overview & Architecture',
      icon: LayoutDashboard,
      badge: 'Hub'
    },
    {
      id: 'sender' as PlatformMode,
      label: 'Platform 1: Sender',
      subtext: 'Attack Simulation & Content',
      icon: Send,
      badge: 'P1'
    },
    {
      id: 'receiver' as PlatformMode,
      label: 'Platform 2: Receiver',
      subtext: 'Multi-App Interceptor',
      icon: Inbox,
      badge: 'P2'
    },
    {
      id: 'security_engine' as PlatformMode,
      label: 'Platform 3: CyberShield AI',
      subtext: 'AI Model Router & Risk',
      icon: ShieldCheck,
      badge: 'P3'
    }
  ];

  return (
    <aside style={{
      width: '280px',
      background: 'rgba(10, 15, 26, 0.95)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 16px',
      gap: '24px'
    }}>
      <div>
        <span style={{ 
          fontSize: '0.7rem', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '1px', 
          color: 'var(--text-muted)' 
        }}>
          Core Platforms
        </span>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(59, 130, 246, 0.2))' : 'transparent',
                  border: isActive ? '1px solid var(--border-cyan)' : '1px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
              >
                <div style={{
                  color: isActive ? 'var(--color-cyan)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#fff' : 'inherit'
                  }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {item.subtext}
                  </div>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Module 1 Architecture Specs Box */}
      <div className="glass-panel" style={{ padding: '16px', marginTop: 'auto', background: 'rgba(5, 8, 16, 0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Layers size={16} color="var(--color-cyan)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Module 1 Active
          </span>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Project foundation verified. Fast-API backend + Cross-Platform responsive frontend ready for 33-module cycle.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', fontSize: '0.7rem', color: 'var(--color-safe)' }}>
          <Lock size={12} />
          <span>Protected Sandbox</span>
        </div>
      </div>
    </aside>
  );
};
