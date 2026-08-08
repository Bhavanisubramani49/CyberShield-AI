import React from 'react';
import { Send, UserCheck, UserX, FileText, Globe, Image, Video, Mail, MessageSquare } from 'lucide-react';
import { ContentType, SenderAccountType } from '../types';

export const SenderPage: React.FC = () => {
  const contentTypes = [
    { type: 'message' as ContentType, label: 'Message / SMS', icon: MessageSquare, example: 'Scam/Phishing Text' },
    { type: 'email' as ContentType, label: 'Email', icon: Mail, example: 'Credential Harvesting' },
    { type: 'url' as ContentType, label: 'URL / Link', icon: Globe, example: 'Suspicious Domain' },
    { type: 'news' as ContentType, label: 'News Article', icon: FileText, example: 'Fake News / Distortion' },
    { type: 'image' as ContentType, label: 'Image', icon: Image, example: 'AI Generated / Manipulated' },
    { type: 'video' as ContentType, label: 'Video', icon: Video, example: 'Deepfake Simulation' },
    { type: 'profile' as ContentType, label: 'User Profile', icon: UserCheck, example: 'Fake Bot Profile' },
    { type: 'file' as ContentType, label: 'File Attachment', icon: FileText, example: 'Suspicious File' }
  ];

  const senderAccounts = [
    { type: 'normal_user' as SenderAccountType, label: 'Normal User', desc: 'Legitimate sender with safe content' },
    { type: 'unknown_user' as SenderAccountType, label: 'Unknown User', desc: 'Unregistered or new sender' },
    { type: 'fake_account' as SenderAccountType, label: 'Fake Account', desc: 'Synthetic bot account with anomalous metadata' },
    { type: 'simulated_attacker' as SenderAccountType, label: 'Simulated Attacker', desc: 'Sends phishing links and scam language' },
    { type: 'simulated_hacker' as SenderAccountType, label: 'Simulated Hacker', desc: 'Sends manipulated media and malicious payloads' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-neutral">PLATFORM 1</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sender Platform (Attack Simulation & Testing Hub)</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Controlled communication and attack-simulation environment. Allows authorized testing of safe and malicious payloads across all 8 content modalities.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Sender Persona Selection */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserX size={18} color="var(--color-warning)" />
            Simulated Sender Account Personas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {senderAccounts.map((acc, idx) => (
              <div key={idx} style={{
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{acc.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Modalities */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} color="var(--color-cyan)" />
            Supported Digital Content Types
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {contentTypes.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div key={idx} style={{
                  padding: '12px',
                  background: 'rgba(0, 240, 255, 0.04)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Icon size={16} color="var(--color-cyan)" />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{c.label}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{c.example}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
