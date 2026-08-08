import React from 'react';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Activity, 
  Monitor, 
  Smartphone,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { SystemHealth, UserProfile, ThemeMode, NavigationPage } from '../../types';

interface HeaderProps {
  health: SystemHealth | null;
  user: UserProfile | null;
  deviceMode: 'windows' | 'android';
  setDeviceMode: (mode: 'windows' | 'android') => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  setPage: (p: NavigationPage) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  health, 
  user,
  deviceMode, 
  setDeviceMode,
  mobileMenuOpen,
  setMobileMenuOpen,
  theme,
  setTheme,
  setPage,
  onLogout
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'var(--bg-card)',
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
          }}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div 
          onClick={() => setPage('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.25))',
            border: '1px solid var(--border-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.2)'
          }}>
            <ShieldCheck size={22} color="var(--color-green)" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                CYBERSHIELD <span style={{ color: 'var(--color-green)' }}>AI</span>
              </span>
              <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
                PROTECTED
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Cybersecurity Protection Ecosystem
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls: Telemetry, Theme Switcher, Device Switcher & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn btn-outline"
          style={{ padding: '6px 10px', height: '34px' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} color="var(--color-warning)" /> : <Moon size={15} color="var(--color-blue)" />}
          <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{theme}</span>
        </button>

        {/* Viewport Switcher (Windows Desktop vs Android Mobile View) */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.25)',
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
            style={{ padding: '5px 10px', fontSize: '0.72rem' }}
          >
            <Monitor size={13} />
            Win
          </button>
          <button
            onClick={() => setDeviceMode('android')}
            className={`btn ${deviceMode === 'android' ? 'btn-primary-green' : 'btn-ghost'}`}
            style={{ padding: '5px 10px', fontSize: '0.72rem' }}
          >
            <Smartphone size={13} />
            Android
          </button>
        </div>

        {/* User Profile Chip & Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setPage('profile')}
              className="btn btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 10px',
                height: '34px'
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'var(--color-green)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                {user.fullName.charAt(0)}
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.fullName.split(' ')[0]}
              </span>
            </button>

            <button
              onClick={onLogout}
              className="btn btn-ghost"
              style={{ padding: '6px', color: 'var(--color-danger)' }}
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
