import React from 'react';
import { Send, Inbox, Shield, LayoutGrid } from 'lucide-react';
import { PlatformMode } from '../../types';

interface PlatformSelectorProps {
  currentMode: PlatformMode;
  setMode: (mode: PlatformMode) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ currentMode, setMode }) => {
  const platforms = [
    { id: 'dashboard' as PlatformMode, name: 'Overview', icon: LayoutGrid },
    { id: 'sender' as PlatformMode, name: 'Platform 1: Sender', icon: Send },
    { id: 'receiver' as PlatformMode, name: 'Platform 2: Receiver', icon: Inbox },
    { id: 'security_engine' as PlatformMode, name: 'Platform 3: CyberShield AI', icon: Shield },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '8px',
      background: 'rgba(10, 15, 26, 0.8)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      marginBottom: '20px',
      overflowX: 'auto'
    }}>
      {platforms.map((p) => {
        const Icon = p.icon;
        const isActive = currentMode === p.id;
        return (
          <button
            key={p.id}
            onClick={() => setMode(p.id)}
            className={`btn-cyber ${isActive ? 'btn-cyan' : 'btn-outline'}`}
            style={{
              flex: '1',
              minWidth: '160px',
              fontSize: '0.8rem',
              padding: '8px 14px'
            }}
          >
            <Icon size={16} />
            <span>{p.name}</span>
          </button>
        );
      })}
    </div>
  );
};
