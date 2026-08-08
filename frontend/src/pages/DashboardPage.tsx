import React from 'react';
import { 
  ShieldCheck, 
  Send, 
  Inbox, 
  Cpu, 
  Terminal, 
  Layers,
  ArrowRight,
  Smartphone,
  Monitor
} from 'lucide-react';
import { SystemHealth, PlatformMode } from '../types';

interface DashboardPageProps {
  health: SystemHealth | null;
  setMode: (mode: PlatformMode) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ health, setMode }) => {
  const aiModels = [
    { name: 'SMS Scam Detection', type: 'Messages', status: 'Ready', desc: 'Analyzes scam urgency, prize claims, and financial OTP requests.' },
    { name: 'Email Phishing Model', type: 'Email', status: 'Ready', desc: 'Analyzes headers, credential harvesting links, and deceptive sender spoofing.' },
    { name: 'URL Threat Detection', type: 'URLs', status: 'Ready', desc: 'Evaluates domain entropy, IP hosts, homograph attacks, and phishing lists.' },
    { name: 'Fake News Classifier', type: 'News Feed', status: 'Ready', desc: 'Linguistic distortion, sensationalist claim flags, and headline analysis.' },
    { name: 'Image Manipulation AI', type: 'Images', status: 'Ready', desc: 'Detects AI generation artifacts, copy-move manipulation, and EXIF flags.' },
    { name: 'Deepfake Video Pipeline', type: 'Videos', status: 'Ready', desc: 'Frame-by-frame facial extraction, temporal inconsistency, and GAN artifact checks.' },
    { name: 'Fake Profile Analyzer', type: 'Profiles', status: 'Ready', desc: 'Detects synthetic bot accounts, suspicious ratios, and bot swarm patterns.' },
    { name: 'File Security Analyzer', type: 'Files', status: 'Ready', desc: 'Analyzes safe file headers, metadata, entropy, and dangerous macros.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / System Architecture Status */}
      <div className="glass-panel-glow" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-safe">ECOSYSTEM STATUS: ONLINE</span>
              <span className="badge badge-cyan">MODULE 1 VERIFIED</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>
              CyberShield AI Security Ecosystem
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '750px', fontSize: '0.9rem', marginTop: '6px' }}>
              Cross-platform cybersecurity protection layer monitoring authorized digital events in real-time.
              Detects threats across 8 digital modalities, generates Explainable AI risk scores, and empowers instant user control.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Monitor size={20} color="var(--color-cyan)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Windows Engine</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-safe)' }}>Supported</div>
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Smartphone size={20} color="var(--color-cyan)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Android Engine</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-safe)' }}>Supported</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The 3 Core Platforms Architecture Flow */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Layers size={18} color="var(--color-cyan)" />
        Three-Platform Architecture Flow
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {/* Platform 1 Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Send size={20} color="var(--color-blue)" />
            </div>
            <span className="badge badge-neutral">PLATFORM 1</span>
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Sender Platform</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Controlled attack simulation & safe communication generation environment.
            </p>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>• Normal & Unknown user simulation</div>
            <div>• Fake accounts, simulated attackers & hackers</div>
            <div>• Safe & malicious test payloads for all 8 content types</div>
          </div>
          <button 
            onClick={() => setMode('sender')}
            className="btn-cyber btn-outline" 
            style={{ marginTop: 'auto', width: '100%', fontSize: '0.8rem' }}
          >
            Open Sender Platform <ArrowRight size={14} />
          </button>
        </div>

        {/* Platform 2 Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Inbox size={20} color="var(--color-safe)" />
            </div>
            <span className="badge badge-neutral">PLATFORM 2</span>
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Receiver Platform</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Simulated multi-app communication environment.
            </p>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>• WhatsApp-style message inbox</div>
            <div>• Email client, Social feed, News aggregator</div>
            <div>• Safe file & media sandbox receiver</div>
          </div>
          <button 
            onClick={() => setMode('receiver')}
            className="btn-cyber btn-outline" 
            style={{ marginTop: 'auto', width: '100%', fontSize: '0.8rem' }}
          >
            Open Receiver Platform <ArrowRight size={14} />
          </button>
        </div>

        {/* Platform 3 Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(0, 240, 255, 0.2)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={20} color="var(--color-cyan)" />
            </div>
            <span className="badge badge-cyan">PLATFORM 3</span>
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>CyberShield AI Engine</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Central intelligence & risk decision ecosystem.
            </p>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>• Real-time Event Manager & Content Detector</div>
            <div>• AI Model Router (8 Specialized AI Models)</div>
            <div>• Risk Scoring, Explainable AI & User Action Engine</div>
          </div>
          <button 
            onClick={() => setMode('security_engine')}
            className="btn-cyber btn-cyan" 
            style={{ marginTop: 'auto', width: '100%', fontSize: '0.8rem' }}
          >
            Inspect Security Engine <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* AI Model Matrix */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Cpu size={18} color="var(--color-cyan)" />
          AI Model Router Matrix (8 Specialized Detectors)
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px'
        }}>
          {aiModels.map((m, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{m.name}</span>
                <span className="badge badge-safe" style={{ fontSize: '0.6rem' }}>{m.status}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', marginBottom: '8px' }}>
                Target: {m.type}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Backend & Architecture Diagnostics */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Terminal size={16} color="var(--color-cyan)" />
          Module 1 Technical Foundation Diagnostics
        </h4>
        <div className="terminal-block">
          <div>[SYSTEM] CyberShield AI Architecture Initialized.</div>
          <div>[PLATFORM 1] Sender Simulator: Ready for payload injection (Normal / Phishing / Deepfake).</div>
          <div>[PLATFORM 2] Receiver Platform: Multi-app environment initialized (WhatsApp/Email/Social/News/Files).</div>
          <div>[PLATFORM 3] AI Security Engine: FastAPI Backend connected at http://127.0.0.1:8000.</div>
          <div>[DIAGNOSTIC] Sandboxing: Explicit consent & official adapter architecture active.</div>
          <div style={{ color: '#10b981' }}>
            [STATUS] {health?.project_name || 'CyberShield AI'}: {health?.status || 'Active & Operational'}.
          </div>
        </div>
      </div>
    </div>
  );
};
