import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Activity, 
  Monitor, 
  Smartphone, 
  Sun, 
  Moon, 
  LogOut,
  Bell
} from 'lucide-react';
import { SystemHealth, UserProfile, ThemeMode, NavigationPage, NotificationUnreadStats } from '../../types';
import { fetchUnreadNotificationStatsAPI } from '../../services/api';

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
  currentPage?: NavigationPage;
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
  const [unreadStats, setUnreadStats] = useState<NotificationUnreadStats>({
    unread_count: 0,
    critical_count: 0,
    high_risk_count: 0,
    review_count: 0,
    total_count: 0
  });

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 3500);
    return () => clearInterval(interval);
  }, []);

  const loadUnread = async () => {
    try {
      const stats = await fetchUnreadNotificationStatsAPI();
      setUnreadStats(stats);
    } catch (e) {
      // Handled
    }
  };
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

      {/* Module 17: Interactive Receiver Real-Time Protection Badge */}
      <div style={{
        display: deviceMode === 'android' ? 'none' : 'flex',
        alignItems: 'center',
        background: 'rgba(16, 185, 129, 0.08)',
        padding: '5px 14px',
        borderRadius: '20px',
        border: '1px solid var(--border-green)',
        gap: '8px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--color-green)',
          boxShadow: '0 0 8px var(--color-green)'
        }} />
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-green)', letterSpacing: '0.02em' }}>
          RECEIVER DEFENSE ACTIVE
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>|</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          External Sender: <code style={{ color: 'var(--color-blue-light)' }}>localhost:5174</code>
        </span>
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

        {/* Notification Bell & Live Alert Badge */}
        <button
          onClick={() => setPage('notifications')}
          className="btn btn-outline"
          style={{
            position: 'relative',
            padding: '6px 12px',
            height: '34px',
            minWidth: deviceMode === 'android' ? '48px' : 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Security Notifications & Alert Center"
          aria-label="Security notifications"
        >
          <Bell size={15} color={unreadStats.critical_count > 0 ? 'var(--color-danger)' : unreadStats.unread_count > 0 ? 'var(--color-warning)' : 'var(--color-green)'} />
          {unreadStats.unread_count > 0 && (
            <span 
              className={`badge ${unreadStats.critical_count > 0 ? 'badge-danger' : 'badge-green'}`} 
              style={{ fontSize: '0.62rem', padding: '1px 6px', fontWeight: 800 }}
            >
              {unreadStats.unread_count}
            </span>
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn btn-outline"
          style={{ padding: '6px 10px', height: '34px', minWidth: deviceMode === 'android' ? '48px' : 'auto' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} color="var(--color-warning)" /> : <Moon size={15} color="var(--color-blue)" />}
          <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', display: deviceMode === 'android' ? 'none' : 'inline' }}>{theme}</span>
        </button>

        {/* Viewport Switcher (Windows Desktop vs Android Mobile View) */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-subtle)',
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
