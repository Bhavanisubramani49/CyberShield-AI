import React from 'react';
import { 
  Send, 
  UserX, 
  MessageSquare, 
  Mail, 
  Globe, 
  FileText, 
  Image, 
  Video, 
  UserCheck
} from 'lucide-react';
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
    { type: 'normal_user' as SenderAccountType, label: 'Normal User', desc: 'Legitimate sender generating safe daily communications.' },
    { type: 'unknown_user' as SenderAccountType, label: 'Unknown User', desc: 'New unverified account with baseline scrutiny.' },
    { type: 'fake_account' as SenderAccountType, label: 'Fake Account', desc: 'Synthetic bot account with anomalous follower/following ratios.' },
    { type: 'simulated_attacker' as SenderAccountType, label: 'Simulated Attacker', desc: 'Controlled persona generating phishing links & financial prize scams.' },
    { type: 'simulated_hacker' as SenderAccountType, label: 'Simulated Hacker', desc: 'Simulates manipulated media, deepfakes, and suspicious payloads.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="cyber-card-blue" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-blue">PLATFORM 1</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
            Sender Platform (Controlled Simulation Hub)
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
          Academic attack simulation and safe communication environment. Allows researchers and evaluators to generate safe or synthetic cybersecurity test cases across all 8 content modalities without performing real-world exploits.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Sender Persona Selection Card */}
        <div className="cyber-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserX size={18} color="var(--color-warning)" />
            Simulated Sender Personas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {senderAccounts.map((acc, idx) => (
              <div key={idx} style={{
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>{acc.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{acc.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Modalities Card */}
        <div className="cyber-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} color="var(--color-blue-light)" />
            Target Content Modalities
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {contentTypes.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div key={idx} style={{
                  padding: '12px',
                  background: 'rgba(59, 130, 246, 0.04)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Icon size={16} color="var(--color-blue-light)" />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>{c.label}</div>
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
