import React from 'react';
import { MessageSquare, Mail, Globe, Image, Video, FileText, Bell, Users } from 'lucide-react';

export const ReceiverPage: React.FC = () => {
  const sections = [
    { name: 'Messages', icon: MessageSquare, desc: 'WhatsApp-style simulated chat receiver.' },
    { name: 'Email', icon: Mail, desc: 'Simulated email client with attachment safety.' },
    { name: 'Social Feed', icon: Users, desc: 'Instagram/Facebook-style simulated social activity.' },
    { name: 'News Feed', icon: FileText, desc: 'Simulated news aggregator with fact & language checks.' },
    { name: 'URLs & Links', icon: Globe, desc: 'Link interceptor and domain reputation scanner.' },
    { name: 'Media / Images', icon: Image, desc: 'Image manipulation & generative AI analysis viewer.' },
    { name: 'Videos', icon: Video, desc: 'Deepfake video stream extraction & frame preview.' },
    { name: 'Notifications', icon: Bell, desc: 'Real-time CyberShield instant warning center.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-neutral">PLATFORM 2</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Receiver Platform (Multi-App Environment)</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Controlled multi-service communication environment. Represents the receiver's application surface intercepted by CyberShield AI security layers.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div key={idx} className="glass-panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={18} color="var(--color-safe)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{sec.name}</h4>
                  <span className="badge badge-safe" style={{ fontSize: '0.6rem' }}>MONITORED</span>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sec.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
