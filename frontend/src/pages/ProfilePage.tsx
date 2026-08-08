import React from 'react';
import { 
  User, 
  ShieldCheck, 
  LogOut, 
  Sun, 
  Moon
} from 'lucide-react';
import { UserProfile, ThemeMode } from '../types';

interface ProfilePageProps {
  user: UserProfile | null;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  user, 
  theme, 
  setTheme, 
  onLogout 
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cyber-card-green" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.35))',
              border: '1px solid var(--border-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.2)'
            }}>
              <User size={28} color="var(--color-green)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                  {user?.fullName || 'Dr. Alex Vance'}
                </h2>
                <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
                  {user?.accountStatus || 'ACTIVE PROTECTED'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {user?.email || 'officer@cybershield.ai'} • {user?.role || 'Lead Cybersecurity Architect'}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-outline"
            style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--color-danger)' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Account Details & Status */}
        <div className="cyber-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--color-green)" />
            Security Profile Credentials
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Officer ID</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{user?.id || 'USR-8821'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security Clearance</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-green)' }}>LEVEL-4 ARCHITECT</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Session Encryption</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-blue-light)' }}>TLS 1.3 / AES-256</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Protection Scope</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>8 Modalities Monitored</span>
            </div>
          </div>
        </div>

        {/* Theme & Workspace Appearance */}
        <div className="cyber-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={18} color="var(--color-warning)" />
            Workspace Theme & Display
          </h3>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
            Switch instantly between the default dark cybersecurity theme and the crisp enterprise light theme.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => setTheme('dark')}
              className={`btn ${theme === 'dark' ? 'btn-primary-green' : 'btn-outline'}`}
              style={{ padding: '12px', justifyContent: 'center' }}
            >
              <Moon size={16} /> Dark Theme
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`btn ${theme === 'light' ? 'btn-primary-green' : 'btn-outline'}`}
              style={{ padding: '12px', justifyContent: 'center' }}
            >
              <Sun size={16} /> Light Theme
            </button>
          </div>

          <div style={{ marginTop: '16px', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Active theme preference is automatically remembered across browser refreshes via local storage.
          </div>
        </div>
      </div>
    </div>
  );
};
