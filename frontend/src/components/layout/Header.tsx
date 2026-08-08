import React from 'react';
import { ShieldAlert, Cpu, Smartphone, Monitor, Activity } from 'lucide-react';
import { SystemHealth } from '../../types';

interface HeaderProps {
  health: SystemHealth | null;
  deviceMode: 'windows' | 'android';
  setDeviceMode: (mode: 'windows' | 'android') => void;
}

export const Header: React.FC<HeaderProps> = ({ health, deviceMode, setDeviceMode }) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      background: 'rgba(13, 19, 34, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand logo & ecosystem info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(59, 130, 246, 0.4))',
          border: '1px solid var(--border-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
        }}>
          <ShieldAlert size={24} color="#00f0ff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              CYBERSHIELD <span style={{ color: 'var(--color-cyan)' }}>AI</span>
            </h1>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>MODULE 1 FOUNDATION</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Cross-Platform Cybersecurity Protection Ecosystem (Android + Windows)
          </p>
        </div>
      </div>

      {/* Center status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <Activity size={16} color="#10b981" />
          <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>{health?.status || 'Active'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <Cpu size={16} color="#00f0ff" />
          <span style={{ color: 'var(--text-secondary)' }}>AI Models:</span>
          <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>
            {health?.active_ai_models.length || 8} Active
          </span>
        </div>

        {/* Viewport switch: Windows Desktop vs Android Mobile Preview */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setDeviceMode('windows')}
            className={`btn-cyber ${deviceMode === 'windows' ? 'btn-cyan' : 'btn-outline'}`}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            <Monitor size={14} />
            Windows View
          </button>
          <button
            onClick={() => setDeviceMode('android')}
            className={`btn-cyber ${deviceMode === 'android' ? 'btn-cyan' : 'btn-outline'}`}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            <Smartphone size={14} />
            Android View
          </button>
        </div>
      </div>
    </header>
  );
};
