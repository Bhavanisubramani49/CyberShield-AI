import React, { useState } from 'react';
import { Shield, Lock, Eye, Database, Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types';

interface SettingsPageProps {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ theme, setTheme }) => {
  const [shieldSettings, setShieldSettings] = useState({
    smsScam: true,
    emailPhishing: true,
    urlThreat: true,
    fakeNews: true,
    imageManipulation: true,
    deepfakeVideo: true,
    fakeProfile: true,
    fileSecurity: true,
  });

  const toggle = (key: keyof typeof shieldSettings) => {
    setShieldSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cyber-card-green" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-green">SYSTEM CONFIGURATION</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            CyberShield Settings & Protection Controls
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
          Manage multi-modal AI threat engine triggers, workspace theme & appearance, privacy policies, and quarantine retention parameters.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Appearance & Theme Selector */}
        <div className="cyber-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={18} color="var(--color-warning)" />
            Workspace Appearance (Theme)
          </h3>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
            Choose between CyberShield Dark Mode and Enterprise Light Mode.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
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

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Current Theme: <strong style={{ color: 'var(--color-green)', textTransform: 'capitalize' }}>{theme} Mode</strong> (Persisted in browser storage)
          </div>
        </div>

        {/* Privacy & Consent Policies */}
        <div className="cyber-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--color-blue-light)" />
            Privacy & Integration Policies
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div>• Zero third-party sandbox tampering or private key bypass.</div>
            <div>• Operates via authorized simulation adapters and explicit user consent.</div>
            <div>• User retains 100% agency over quarantine, unblock, and data deletion.</div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" style={{ fontSize: '0.75rem' }}>
              <Eye size={14} /> View Privacy Policy
            </button>
            <button className="btn btn-outline" style={{ fontSize: '0.75rem' }}>
              <Database size={14} /> Clear Local Cache
            </button>
          </div>
        </div>

        {/* Module Protection Toggles */}
        <div className="cyber-card" style={{ padding: '22px', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--color-green)" />
            AI Protection Engines (Modality Toggles)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {[
              { id: 'smsScam' as const, label: 'SMS & Message Scam AI', desc: 'Scan prize traps and OTP fraud' },
              { id: 'emailPhishing' as const, label: 'Email Phishing Classifier', desc: 'Scan credential harvesting links' },
              { id: 'urlThreat' as const, label: 'URL Threat & Domain Evaluator', desc: 'Inspect IP hosts & phishing domains' },
              { id: 'fakeNews' as const, label: 'Fake News & Disinformation AI', desc: 'Linguistic distortion & claim flags' },
              { id: 'imageManipulation' as const, label: 'Image Manipulation Detector', desc: 'Detect GAN synthesis & spliced pixels' },
              { id: 'deepfakeVideo' as const, label: 'Deepfake Video Pipeline', desc: 'Temporal facial inconsistency extraction' },
              { id: 'fakeProfile' as const, label: 'Fake Profile & Bot Analyzer', desc: 'Detect synthetic bot accounts' },
              { id: 'fileSecurity' as const, label: 'File Security & Signature Checker', desc: 'Inspect safe metadata & macro flags' }
            ].map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <button
                  onClick={() => toggle(item.id)}
                  className={`btn ${shieldSettings[item.id] ? 'btn-primary-green' : 'btn-outline'}`}
                  style={{ padding: '4px 12px', fontSize: '0.75rem', minWidth: '65px' }}
                >
                  {shieldSettings[item.id] ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
