import React, { useState } from 'react';
import { Shield, Lock, Eye, Bell, Database } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [shieldSettings, setShieldSettings] = useState({
    smsScam: true,
    emailPhishing: true,
    urlThreat: true,
    fakeNews: true,
    imageManipulation: true,
    deepfakeVideo: true,
    fakeProfile: true,
    fileSecurity: true,
    immediateAlerts: true,
    autoQuarantine: true,
  });

  const toggle = (key: keyof typeof shieldSettings) => {
    setShieldSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cyber-card-green" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-green">SYSTEM CONFIGURATION</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
            CyberShield Settings & Protection Controls
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
          Manage multi-modal AI threat engine triggers, privacy and consent policies, integration adapters, and quarantine retention parameters.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Module Protection Toggles */}
        <div className="cyber-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--color-green)" />
            AI Protection Engines (Modality Toggles)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { id: 'smsScam' as const, label: 'SMS & Message Scam Detector', desc: 'Scan prize traps and financial OTP requests' },
              { id: 'emailPhishing' as const, label: 'Email Phishing Classifier', desc: 'Scan credential harvesting and sender spoofing' },
              { id: 'urlThreat' as const, label: 'URL Threat & Domain Evaluator', desc: 'Inspect IP hosts and deceptive domains' },
              { id: 'fakeNews' as const, label: 'Fake News & Disinformation AI', desc: 'Linguistic distortion and claim flags' },
              { id: 'imageManipulation' as const, label: 'Image Manipulation & AI Detector', desc: 'Detect GAN synthesis and spliced pixels' },
              { id: 'deepfakeVideo' as const, label: 'Deepfake Video Stream Pipeline', desc: 'Temporal facial inconsistency extraction' },
              { id: 'fakeProfile' as const, label: 'Fake Profile & Bot Analyzer', desc: 'Detect synthetic followers and bot swarms' },
              { id: 'fileSecurity' as const, label: 'File Security & Signature Checker', desc: 'Inspect safe metadata and macro flags' }
            ].map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>{item.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <button
                  onClick={() => toggle(item.id)}
                  className={`btn ${shieldSettings[item.id] ? 'btn-primary-green' : 'btn-outline'}`}
                  style={{ padding: '4px 12px', fontSize: '0.75rem', minWidth: '70px' }}
                >
                  {shieldSettings[item.id] ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy, Adapters & Consent */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="cyber-card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="var(--color-blue-light)" />
              Privacy & Integration Adapter Architecture
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

          <div className="cyber-card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="var(--color-warning)" />
              Instant Notification Parameters
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
              When a threat score exceeds CRITICAL or HIGH risk thresholds, immediate notifications will prompt for BLOCK, REVIEW, or ALLOW actions.
            </p>
            <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
              Near Real-Time Dispatch Configured
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
