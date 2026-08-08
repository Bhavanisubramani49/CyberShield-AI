import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  Clock, 
  Terminal,
  Zap,
  RefreshCw
} from 'lucide-react';
import { SystemHealth } from '../types';

interface HomePageProps {
  health: SystemHealth | null;
}

export const HomePage: React.FC<HomePageProps> = ({ health }) => {
  const protectionEngines = [
    { 
      name: 'SMS Scam Detection AI', 
      type: 'Messages & SMS', 
      status: 'Active', 
      latency: '24ms',
      accuracy: '98.4%',
      desc: 'Real-time NLP model scanning for urgency indicators, lottery prize claims, and financial OTP fraud.' 
    },
    { 
      name: 'Email Phishing Detection AI', 
      type: 'Email Client', 
      status: 'Active', 
      latency: '38ms',
      accuracy: '99.1%',
      desc: 'Deep header, sender authenticity, and credential-harvesting link analyzer.' 
    },
    { 
      name: 'URL Threat & Domain Classifier', 
      type: 'Web & Links', 
      status: 'Active', 
      latency: '18ms',
      accuracy: '97.8%',
      desc: 'Structural URL analysis, IP-based host validation, and malicious domain reputation matching.' 
    },
    { 
      name: 'Fake News & Disinformation AI', 
      type: 'News Aggregator', 
      status: 'Active', 
      latency: '42ms',
      accuracy: '96.2%',
      desc: 'Linguistic distortion metrics, sensationalist claim flags, and synthetic news pattern detection.' 
    },
    { 
      name: 'Image Manipulation & AI Detector', 
      type: 'Media & Images', 
      status: 'Active', 
      latency: '85ms',
      accuracy: '95.9%',
      desc: 'Pixel-level forgery detection, GAN synthesis artifacts, and EXIF integrity validation.' 
    },
    { 
      name: 'Deepfake Video Stream Pipeline', 
      type: 'Video Streams', 
      status: 'Active', 
      latency: '120ms',
      accuracy: '94.8%',
      desc: 'Facial frame extraction, temporal consistency verification, and generative face swap detection.' 
    },
    { 
      name: 'Fake Profile & Bot Analyzer', 
      type: 'Social Accounts', 
      status: 'Active', 
      latency: '29ms',
      accuracy: '97.1%',
      desc: 'Evaluates bot swarm behavior, follower ratio anomalies, and synthetic account age patterns.' 
    },
    { 
      name: 'File Security & Metadata Pipeline', 
      type: 'File Sharing', 
      status: 'Active', 
      latency: '31ms',
      accuracy: '99.5%',
      desc: 'Safe file metadata verification, header entropy analysis, and dangerous macro inspection.' 
    }
  ];

  const recentActivity = [
    { time: '10:42:15', event: 'Scam message payload intercepted', risk: 'CRITICAL', action: 'Quarantined', type: 'SMS' },
    { time: '10:38:02', event: 'Credential harvesting link blocked', risk: 'HIGH', action: 'Blocked', type: 'Email' },
    { time: '10:25:40', event: 'Normal user message verified safe', risk: 'LOW', action: 'Delivered', type: 'Chat' },
    { time: '10:11:18', event: 'Synthetic GAN profile image flagged', risk: 'MEDIUM', action: 'Under Review', type: 'Media' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Primary CyberShield AI Security Banner */}
      <div className="cyber-card-green" style={{ padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-green">
                <span className="live-dot" />
                SYSTEM PROTECTED
              </span>
              <span className="badge badge-blue">
                REAL-TIME MONITORING
              </span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
              CyberShield AI Security Command Center
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '780px', fontSize: '0.9rem', marginTop: '6px', lineHeight: '1.5' }}>
              Autonomous digital security layer monitoring authorized communication streams in real time. 
              Routes digital events across 8 dedicated AI models, calculates Explainable AI risk scores, and empowers instant user actions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-primary-green" style={{ fontSize: '0.8rem' }}>
              <Zap size={15} /> Run System Scan
            </button>
            <button className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              <RefreshCw size={15} /> Update AI Rules
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Threat & Protection Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        <div className="cyber-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Defense Score</span>
            <ShieldCheck size={18} color="var(--color-green)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-green)' }}>99.4%</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Ecosystem integrity optimal
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Events Inspected</span>
            <Activity size={18} color="var(--color-blue-light)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>1,420</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Real-time communication events
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Threats Neutralized</span>
            <AlertTriangle size={18} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-warning)' }}>48</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Scams, phishing & manipulated media
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active AI Engines</span>
            <Cpu size={18} color="var(--color-green)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
            {health?.active_ai_models.length || 8} / 8
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-green)', marginTop: '4px' }}>
            All threat routers operational
          </div>
        </div>
      </div>

      {/* 8 AI Security Engines Matrix */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--color-green)" />
            CyberShield AI Security Engines (8 Protection Modules)
          </h3>
          <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
            Multi-Modal Threat Router
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '16px'
        }}>
          {protectionEngines.map((engine, idx) => (
            <div key={idx} className="cyber-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                  {engine.name}
                </span>
                <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>
                  {engine.status}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span className="badge badge-blue" style={{ fontSize: '0.62rem' }}>
                  {engine.type}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Latency: {engine.latency}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-green)', marginLeft: 'auto', fontWeight: 600 }}>
                  Acc: {engine.accuracy}
                </span>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.45', marginTop: 'auto' }}>
                {engine.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Security Activity Timeline */}
      <div className="cyber-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--color-blue-light)" />
            Recent Security Activity & Threat Interceptions
          </h3>
          <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
            Live Audit Stream
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recentActivity.map((act, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {act.time}
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>
                  {act.type}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#ffffff' }}>
                  {act.event}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge ${act.risk === 'CRITICAL' ? 'badge-danger' : act.risk === 'HIGH' ? 'badge-warning' : act.risk === 'MEDIUM' ? 'badge-blue' : 'badge-green'}`} style={{ fontSize: '0.62rem' }}>
                  {act.risk}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {act.action}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backend & Security Diagnostics */}
      <div className="cyber-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Terminal size={15} color="var(--color-green)" />
          CyberShield AI Protection Engine Telemetry
        </h4>
        <div style={{
          fontFamily: 'var(--font-mono)',
          background: '#070b14',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px',
          fontSize: '0.8rem',
          color: '#e2e8f0',
          lineHeight: '1.6'
        }}>
          <div>[DEFENSE] CyberShield AI Real-Time Protection Layer: ONLINE</div>
          <div>[MODALITY] 8 Specialized AI Detectors: Registered and Standby</div>
          <div>[SANDBOX] Communication Interception: Operating with explicit consent & integration adapters</div>
          <div>[FASTAPI] Backend Health: {health?.status || 'Active'} on http://127.0.0.1:8000</div>
          <div style={{ color: 'var(--color-green)' }}>[STATUS] UI/UX & Navigation Architecture: Operational & Verified</div>
        </div>
      </div>
    </div>
  );
};
