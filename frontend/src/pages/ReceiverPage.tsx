import React from 'react';
import { MessageSquare, Mail, Globe, Image, Video, FileText, Bell, Users } from 'lucide-react';

export const ReceiverPage: React.FC = () => {
  const receiverSections = [
    { name: 'Messages & SMS', icon: MessageSquare, desc: 'WhatsApp / SMS simulated chat receiver intercepted by CyberShield scam AI.' },
    { name: 'Email Inbox', icon: Mail, desc: 'Simulated email client scanning headers, body text, and attachments.' },
    { name: 'Social Feed', icon: Users, desc: 'Instagram / Facebook-style simulated feed analyzing bot profiles & suspicious posts.' },
    { name: 'News Feed', icon: FileText, desc: 'Simulated news aggregator scanning article claims and linguistic distortion.' },
    { name: 'URLs & Links', icon: Globe, desc: 'Link interceptor analyzing domain reputation, IP structures, and homographs.' },
    { name: 'Media & Images', icon: Image, desc: 'Image manipulation & generative AI synthesis analysis viewer.' },
    { name: 'Videos', icon: Video, desc: 'Deepfake video stream extraction and frame-level verification viewer.' },
    { name: 'Instant Alerts', icon: Bell, desc: 'Real-time CyberShield instant warning and decision overlay center.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="cyber-card-green" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-green">PLATFORM 2</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
            Receiver Platform (Multi-App Environment)
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
          Controlled multi-service communication environment. Represents the receiver's application surface intercepted by CyberShield AI security layers.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {receiverSections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div key={idx} className="cyber-card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}>
                  <Icon size={18} color="var(--color-green)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{sec.name}</h4>
                  <span className="badge badge-green" style={{ fontSize: '0.58rem' }}>AI GUARD ACTIVE</span>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {sec.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
