import React from 'react';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Activity, 
  Cpu, 
  Monitor, 
  Smartphone 
} from 'lucide-react';
import { SystemHealth } from '../../types';

interface HeaderProps {
  health: SystemHealth | null;
  deviceMode: 'windows' | 'android';
  setDeviceMode: (mode: 'windows' | 'android') => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  health, 
  deviceMode, 
  setDeviceMode,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 24px',
      background: 'rgba(12, 18, 30, 0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 60
    }}>
      {/* Brand & Mobile Hamburger Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-outline"
          style={{
            display: deviceMode === 'android' ? 'flex' : 'none',
            padding: '8px',
            minWidth: '40px',
            height: '40px',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} color="#f8fafc" /> : <Menu size={20} color="#f8fafc" />}
        </button>

        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.25))',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(16, 185, 129, 0.2)'
        }}>
          <ShieldCheck size={22} color="var(--color-green)" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.3px', color: '#ffffff' }}>
              CYBERSHIELD <span style={{ color: 'var(--color-green)' }}>AI</span>
            </span>
            <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
              PROTECTION ACTIVE
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Enterprise AI Cybersecurity Ecosystem (Android + Windows)
          </div>
        </div>
      </div>

      {/* Center / Right Telemetry & Device Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Backend API Health Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem'
        }}>
          <Activity size={15} color="var(--color-green)" />
          <span style={{ color: 'var(--text-secondary)' }}>API:</span>
          <span style={{ color: 'var(--color-green)', fontWeight: 600 }}>
            {health?.status || 'Online'}
          </span>
        </div>

        <div style={{
          display: deviceMode === 'windows' ? 'flex' : 'none',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem'
        }}>
          <Cpu size={15} color="var(--color-blue-light)" />
          <span style={{ color: 'var(--text-secondary)' }}>AI Engines:</span>
          <span style={{ color: 'var(--color-blue-light)', fontWeight: 600 }}>
            {health?.active_ai_models.length || 8} Operational
          </span>
        </div>

        {/* Viewport Switcher (Windows Desktop vs Android Mobile View) */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => {
              setDeviceMode('windows');
              setMobileMenuOpen(false);
            }}
            className={`btn ${deviceMode === 'windows' ? 'btn-accent-blue' : 'btn-ghost'}`}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            <Monitor size={14} />
            Windows
          </button>
          <button
            onClick={() => setDeviceMode('android')}
            className={`btn ${deviceMode === 'android' ? 'btn-primary-green' : 'btn-ghost'}`}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            <Smartphone size={14} />
            Android
          </button>
        </div>
      </div>
    </header>
  );
};
