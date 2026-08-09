import React, { useState } from 'react';
import { Send, ArrowRight } from 'lucide-react';
import { SenderUser } from '../../types';

interface SenderAuthProps {
  onLogin: (user: SenderUser) => void;
}

const PRESET_SENDERS: SenderUser[] = [
  {
    id: 'SND-01',
    fullName: 'Marcus Reynolds',
    email: 'marcus.reynolds@cyber-lab.org',
    role: 'Authorized Red-Team Security Researcher',
    personaType: 'researcher'
  },
  {
    id: 'SND-02',
    fullName: 'Lottery & Prize Simulation Bot',
    email: 'lottery-bot@simulated-attacker.xyz',
    role: 'Simulated Financial Scam Campaign Engine',
    personaType: 'attacker'
  },
  {
    id: 'SND-03',
    fullName: 'Corporate Colleague (Sarah Jenkins)',
    email: 'sarah.jenkins@enterprise-demo.com',
    role: 'Authentic Internal Employee Persona',
    personaType: 'custom'
  }
];

export const SenderAuth: React.FC<SenderAuthProps> = ({ onLogin }) => {
  const [selectedPreset, setSelectedPreset] = useState<SenderUser>(PRESET_SENDERS[0]);
  const [customName, setCustomName] = useState<string>('');
  const [customRole, setCustomRole] = useState<string>('Custom External Sender');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onLogin({
      id: `SND-${Date.now().toString().slice(-4)}`,
      fullName: customName,
      email: `${customName.toLowerCase().replace(/\s+/g, '.')}@simulated-sender.com`,
      role: customRole || 'Custom External Sender',
      personaType: 'custom'
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="cyber-card" style={{ maxWidth: '520px', width: '100%', padding: '32px' }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(16, 185, 129, 0.2))',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Send size={24} color="var(--color-blue-light)" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Sender Platform Login
              </h2>
              <span className="badge badge-blue">Port 5174</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Independent Synthetic Transmission Console
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.45' }}>
          Select an academic sender persona or enter custom credentials to access the <strong>External Sender Platform</strong>. Dispatches events into CyberShield Core over REST API.
        </p>

        {/* Preset Personas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Choose a Pre-Seeded Sender Account:
          </label>

          {PRESET_SENDERS.map((p) => (
            <div 
              key={p.id}
              onClick={() => setSelectedPreset(p)}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: selectedPreset.id === p.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                border: selectedPreset.id === p.id ? '1px solid var(--color-blue)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.fullName}</span>
                <span className={`badge ${p.personaType === 'attacker' ? 'badge-danger' : 'badge-green'}`} style={{ fontSize: '0.6rem' }}>
                  {p.personaType.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.role}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onLogin(selectedPreset)}
          className="btn btn-primary-green"
          style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.85rem', marginBottom: '20px' }}
        >
          Sign In as {selectedPreset.fullName} <ArrowRight size={16} />
        </button>

        {/* Custom Persona Alternative */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Or enter a custom sender identity:
          </div>

          <form onSubmit={handleCustomLogin} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              placeholder="Sender Full Name / Persona (e.g. Unknown SMS Bot)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem'
              }}
            />
            <input
              type="text"
              placeholder="Sender Role / Affiliation (e.g. Red Team Security Tester)"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem'
              }}
            />
            <button
              type="submit"
              disabled={!customName.trim()}
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Launch Custom Sender Session
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
