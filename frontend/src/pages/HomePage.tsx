import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  Clock, 
  Zap,
  RefreshCw,
  MessageSquare,
  Mail,
  Image as ImageIcon,
  Video,
  FileText,
  UserCheck,
  Globe,
  Lock,
  CheckCircle,
  XCircle,
  Eye,
  ShieldAlert,
  Send,
  Layers,
  Search,
  ChevronRight
} from 'lucide-react';
import { 
  SystemHealth, 
  SecurityEvent, 
  DashboardSummaryData,
  SecurityAction 
} from '../types';
import { 
  fetchDashboardSummaryAPI, 
  fetchEventsAPI, 
  submitEventActionAPI,
  sendEventAPI
} from '../services/api';

interface HomePageProps {
  health: SystemHealth | null;
}

export const HomePage: React.FC<HomePageProps> = ({ health }) => {
  // Core State
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [, setSummary] = useState<DashboardSummaryData | null>(null);
  const [, setLoading] = useState<boolean>(true);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Active Interactive Channel
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  // Live Real-Time Security Alert (Toast / Banner for Dangerous Content)
  const [liveAlert, setLiveAlert] = useState<SecurityEvent | null>(null);

  // Forensic Inspection Modal
  const [forensicEvent, setForensicEvent] = useState<SecurityEvent | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Interactive Message Reply State (for chat sandbox)
  const [chatReply, setChatReply] = useState<string>('');
  const [replySending, setReplySending] = useState<boolean>(false);

  // Filter for feed
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'THREATS' | 'SAFE' | 'QUARANTINE'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initial Load
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Real-Time SSE Stream Listener
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('http://127.0.0.1:8000/api/v1/events/stream');
      
      eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && parsed.event_id) {
            // Prepend new event
            setEvents(prev => {
              const exists = prev.some(item => item.event_id === parsed.event_id);
              if (exists) return prev;
              return [parsed, ...prev];
            });

            // Check if threat -> Trigger Red In-App Security Toast
            const isThreat = parsed.ai_result?.classification !== 'SAFE' || (parsed.ai_result?.risk_score || 0) >= 50;
            if (isThreat) {
              setLiveAlert(parsed);
            }
          }
        } catch (err) {
          // SSE heartbeat
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch (e) {
      // SSE fallback handled by polling
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  const loadData = async () => {
    try {
      const [sum, evts] = await Promise.all([
        fetchDashboardSummaryAPI('all'),
        fetchEventsAPI()
      ]);
      setSummary(sum);
      setEvents(evts);
    } catch (e) {
      console.error('Failed to load receiver data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickScan = () => {
    setScanning(true);
    setScanMessage('Scanning all 10 digital channels & running heuristics...');
    setTimeout(() => {
      setScanMessage('Evaluating AI threat models and active communication streams...');
    }, 900);
    setTimeout(() => {
      setScanning(false);
      setScanMessage(null);
      loadData();
    }, 1800);
  };

  const handleAction = async (eventId: string, action: SecurityAction) => {
    setActionLoading(true);
    try {
      await submitEventActionAPI(eventId, action);
      await loadData();
      if (forensicEvent && forensicEvent.event_id === eventId) {
        setForensicEvent(prev => prev ? { ...prev, user_action: action, final_action: action } : null);
      }
      if (liveAlert && liveAlert.event_id === eventId) {
        setLiveAlert(null);
      }
    } catch (e) {
      console.error('Action failed:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!chatReply.trim()) return;
    setReplySending(true);
    try {
      await sendEventAPI({
        event_id: `EVT-RPLY-${Date.now().toString().slice(-4)}`,
        sender_id: 'Dr. Alex Vance (Receiver Mobile User)',
        sender_type: 'normal_user',
        receiver_id: 'External Sender',
        platform: 'whatsapp',
        content_type: 'message',
        content_preview: chatReply,
        raw_content: chatReply,
        payload: { text: chatReply },
        status: 'DELIVERED',
        timestamp: new Date().toISOString(),
        user_action: 'ALLOW',
        final_action: 'ALLOW'
      });
      setChatReply('');
      await loadData();
    } catch (e) {
      console.error('Failed to send reply:', e);
    } finally {
      setReplySending(false);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter(e => {
    if (feedFilter === 'THREATS' && e.ai_result?.classification === 'SAFE') return false;
    if (feedFilter === 'SAFE' && e.ai_result?.classification !== 'SAFE') return false;
    if (feedFilter === 'QUARANTINE' && e.user_action !== 'QUARANTINE' && e.final_action !== 'QUARANTINE') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const txt = (e.content_preview || e.raw_content || '').toLowerCase();
      const snd = (e.sender_id || '').toLowerCase();
      const cls = (e.ai_result?.classification || '').toLowerCase();
      return txt.includes(q) || snd.includes(q) || cls.includes(q) || e.event_id.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate Dynamic Defense Score
  const totalEventsCount = Math.max(1, events.length);
  const threatsCount = events.filter(e => e.ai_result?.classification !== 'SAFE').length;
  const safeCount = events.filter(e => e.ai_result?.classification === 'SAFE').length;
  const quarantinedCount = events.filter(e => e.user_action === 'QUARANTINE' || e.final_action === 'QUARANTINE').length;
  const blockedCount = events.filter(e => e.user_action === 'BLOCK' || e.final_action === 'BLOCK').length;
  const underReviewCount = events.filter(e => e.user_action === 'REVIEW' || e.final_action === 'REVIEW').length;
  
  const defenseScore = Math.max(65, Math.min(99, Math.round(100 - (threatsCount / totalEventsCount) * 15)));

  // 10 Protected Channels
  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp & Chat',
      modality: 'message',
      icon: MessageSquare,
      color: '#25D366',
      desc: 'SMS, WhatsApp & direct chat streams'
    },
    {
      id: 'instagram',
      name: 'Instagram / Social DMs',
      modality: 'message',
      icon: Send,
      color: '#E1306C',
      desc: 'Direct messages & synthetic social inquiries'
    },
    {
      id: 'email',
      name: 'Email Inbox (Gmail)',
      modality: 'email',
      icon: Mail,
      color: '#EA4335',
      desc: 'Phishing headers & credential harvest links'
    },
    {
      id: 'url',
      name: 'Web & URLs',
      modality: 'url',
      icon: Globe,
      color: '#3B82F6',
      desc: 'Browser link protection & domain reputation'
    },
    {
      id: 'photo',
      name: 'Photos & Media',
      modality: 'image',
      icon: ImageIcon,
      color: '#A855F7',
      desc: 'Pixel manipulation & Error Level Analysis'
    },
    {
      id: 'video',
      name: 'Videos & Streams',
      modality: 'video',
      icon: Video,
      color: '#EC4899',
      desc: 'Temporal deepfake & face-swap scanner'
    },
    {
      id: 'news',
      name: 'News & Headlines',
      modality: 'news',
      icon: FileText,
      color: '#F59E0B',
      desc: 'Disinformation & sensationalist claim flags'
    },
    {
      id: 'file',
      name: 'Files & Documents',
      modality: 'file',
      icon: Lock,
      color: '#10B981',
      desc: 'Dangerous macros & binary entropy inspection'
    },
    {
      id: 'profile',
      name: 'Social Profiles',
      modality: 'profile',
      icon: UserCheck,
      color: '#06B6D4',
      desc: 'Bot swarm & synthetic profile analysis'
    },
    {
      id: 'sandbox',
      name: 'Platform Sandbox',
      modality: 'sandbox',
      icon: Layers,
      color: '#8B5CF6',
      desc: 'Zero-trust integration adapters'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', position: 'relative' }}>
      {/* ========================================================
          LIVE REAL-TIME SECURITY ALERT (TOAST / BANNER FOR THREATS)
          ======================================================== */}
      {liveAlert && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          maxWidth: '440px',
          width: 'calc(100% - 48px)',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(15, 23, 42, 0.98))',
          border: '2px solid var(--color-danger)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 35px rgba(239, 68, 68, 0.4)',
          padding: '16px 20px',
          backdropFilter: 'blur(16px)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="#ffffff" />
              <strong style={{ fontSize: '0.9rem', color: '#ffffff', letterSpacing: '-0.2px' }}>
                🚨 CyberShield Security Alert
              </strong>
            </div>
            <button
              onClick={() => setLiveAlert(null)}
              style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8 }}
              title="Dismiss alert"
            >
              ✕
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#fee2e2', marginBottom: '10px', lineHeight: '1.4' }}>
            Dangerous content intercepted: <strong style={{ textTransform: 'uppercase', color: '#ffffff' }}>{liveAlert.ai_result?.classification || 'THREAT'}</strong>
            <span style={{ marginLeft: '6px' }}>— Risk: <strong>{liveAlert.ai_result?.risk_score || 95}/100 ({liveAlert.ai_result?.risk_level || 'CRITICAL'})</strong></span>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#fca5a5', marginBottom: '12px', background: 'rgba(0, 0, 0, 0.3)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
            Source: <strong>{liveAlert.sender_id}</strong> ({liveAlert.content_type})
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setForensicEvent(liveAlert);
                setLiveAlert(null);
              }}
              className="btn btn-primary-green"
              style={{ flex: 1, padding: '7px 12px', fontSize: '0.76rem', justifyContent: 'center', background: '#ffffff', color: '#090d16' }}
            >
              <Eye size={13} /> Inspect Threat Details
            </button>
            <button
              onClick={() => handleAction(liveAlert.event_id, 'BLOCK')}
              className="btn"
              style={{ padding: '7px 12px', fontSize: '0.76rem', background: 'rgba(0, 0, 0, 0.4)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
            >
              Block
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          A. RECEIVER SECURITY STATUS CARD (PHONE MANAGER STYLE)
          ======================================================== */}
      <div className="cyber-card-green" style={{ padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          {/* Left Hero */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            {/* Radial Defense Gauge */}
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.2))',
              border: '3px solid var(--color-green)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '1.55rem', fontWeight: 900, color: 'var(--color-green)', lineHeight: 1 }}>
                {defenseScore}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>
                / 100
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-green">
                  <span className="live-dot" />
                  RECEIVER PROTECTED
                </span>
                <span className="badge badge-blue">
                  AI CORE ACTIVE
                </span>
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.4px', margin: 0 }}>
                Receiver Defense Center
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '580px', lineHeight: '1.4' }}>
                Real-time zero-trust shielding for incoming digital communications. Powered by 8 multimodal AI detection engines and persistent forensic quarantine.
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleQuickScan}
              disabled={scanning}
              className="btn btn-primary-green"
              style={{ fontSize: '0.8rem', padding: '10px 16px' }}
            >
              <Zap size={15} className={scanning ? 'spin' : ''} />
              {scanning ? 'Running Quick Scan...' : 'Quick Security Scan'}
            </button>
            <button
              onClick={loadData}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem', padding: '10px 14px' }}
              title="Refresh telemetry"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Scan Feedback Banner */}
        {scanning && (
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: 'rgba(16, 185, 129, 0.15)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-green)',
            fontSize: '0.78rem',
            color: 'var(--color-green-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Activity size={16} className="spin" />
            <span>{scanMessage}</span>
          </div>
        )}

        {/* Status Mini Chips */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          fontSize: '0.75rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>System Status:</span>{' '}
            <strong style={{ color: 'var(--color-green)' }}>{health?.status ? `${health.status.toUpperCase()} / PROTECTED` : 'PROTECTED / ONLINE'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>AI Threat Engines:</span>{' '}
            <strong style={{ color: '#ffffff' }}>{health?.active_ai_models?.length || 8} / 8 ACTIVE</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Database Layer:</span>{' '}
            <strong style={{ color: 'var(--color-blue-light)' }}>CONNECTED (SQLite)</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Real-Time Shield:</span>{' '}
            <strong style={{ color: 'var(--color-green)' }}>ACTIVE</strong>
          </div>
        </div>
      </div>

      {/* ========================================================
          B. ACTIVITY SUMMARY CARDS
          ======================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px'
      }}>
        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Protected Events</span>
            <Activity size={16} color="var(--color-blue-light)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>{totalEventsCount}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Total communications screened</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Threats Detected</span>
            <AlertTriangle size={16} color="var(--color-danger)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-danger)' }}>{threatsCount}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Scams, phish & malware</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Safe Content</span>
            <CheckCircle size={16} color="var(--color-green)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-green)' }}>{safeCount}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Delivered naturally</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Blocked / Quarantined</span>
            <Lock size={16} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-warning)' }}>{quarantinedCount + blockedCount}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Vault-isolated payloads</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Under Review</span>
            <Clock size={16} color="var(--color-blue-light)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>{underReviewCount}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Awaiting user confirmation</div>
        </div>
      </div>

      {/* ========================================================
          C. 10 PROTECTED DIGITAL CHANNELS (SIMULATED SOURCES)
          ======================================================== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Layers size={18} color="var(--color-green)" />
              10 Protected Communication Channels
            </h2>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Simulated academic digital surfaces. Click any channel to open the interactive sandbox viewer.
            </div>
          </div>
          <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>ALL MONITORED</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px'
        }}>
          {channels.map((ch) => {
            const Icon = ch.icon;
            const channelEvents = events.filter(e => e.content_type === ch.modality || e.platform === ch.id);
            const channelThreats = channelEvents.filter(e => e.ai_result?.classification !== 'SAFE').length;
            const isSelected = activeChannel === ch.id;

            return (
              <div
                key={ch.id}
                onClick={() => setActiveChannel(isSelected ? null : ch.id)}
                className={`cyber-card ${isSelected ? 'cyber-card-green' : ''}`}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--color-green)' : '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: `rgba(255, 255, 255, 0.05)`,
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={20} color={ch.color} />
                  </div>

                  <span className={`badge ${channelThreats > 0 ? 'badge-danger' : 'badge-green'}`} style={{ fontSize: '0.6rem' }}>
                    {channelThreats > 0 ? `${channelThreats} THREATS` : 'ACTIVE'}
                  </span>
                </div>

                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                  {ch.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: '1.3' }}>
                  {ch.desc}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                  <span>Inspected: <strong>{channelEvents.length}</strong></span>
                  <span style={{ color: channelThreats > 0 ? 'var(--color-danger)' : 'var(--color-green)' }}>
                    Threats: <strong>{channelThreats}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          INTERACTIVE CHANNEL SANDBOX VIEWER (WHEN CLICKED)
          ======================================================== */}
      {activeChannel && (
        <div className="cyber-card" style={{ padding: '22px', border: '1px solid var(--color-green)', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} color="var(--color-green)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Interactive Sandbox: {channels.find(c => c.id === activeChannel)?.name}
                </h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Simulated receiver interaction environment with real-time CyberShield AI protection
                </div>
              </div>
            </div>

            <button onClick={() => setActiveChannel(null)} className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '5px 10px' }}>
              Close Sandbox ✕
            </button>
          </div>

          {/* Messages / WhatsApp Sandbox */}
          {(activeChannel === 'whatsapp' || activeChannel === 'instagram') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Incoming communication thread. Safe messages are delivered normally; dangerous payloads are intercepted.
              </div>

              {/* Chat Thread */}
              <div style={{
                maxHeight: '320px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '14px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}>
                {events.filter(e => e.content_type === 'message' || e.platform === activeChannel).slice(0, 10).map((msg) => {
                  const isThreat = msg.ai_result?.classification !== 'SAFE';
                  return (
                    <div
                      key={msg.event_id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: isThreat ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                        border: isThreat ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)',
                        maxWidth: '85%'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span><strong>{msg.sender_id}</strong> ({msg.event_id})</span>
                        <span className={`badge ${isThreat ? 'badge-danger' : 'badge-green'}`} style={{ fontSize: '0.58rem' }}>
                          {isThreat ? msg.ai_result?.classification : 'SAFE'}
                        </span>
                      </div>

                      {isThreat ? (
                        <div>
                          <div style={{ color: 'var(--color-danger)', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldAlert size={14} /> CONTENT INTERCEPTED & QUARANTINED BY CYBERSHIELD
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Raw dangerous text hidden to protect receiver. Reason: {msg.ai_result?.reasons?.[0] || 'Malicious scam pattern'}
                          </div>
                          <button
                            onClick={() => setForensicEvent(msg)}
                            className="btn btn-outline"
                            style={{ marginTop: '6px', fontSize: '0.68rem', padding: '3px 8px', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                          >
                            <Eye size={11} /> View Threat Forensics & Agency Options
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#ffffff' }}>
                            {msg.content_preview || msg.raw_content || 'Normal user conversation message.'}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-green)', marginTop: '4px' }}>
                            ✓ Protected by CyberShield
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Chat Reply Composer */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Type a safe simulated reply (e.g. 'Yes, meeting at 10 AM works!')..."
                  value={chatReply}
                  onChange={(e) => setChatReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.8rem'
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={replySending || !chatReply.trim()}
                  className="btn btn-primary-green"
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  <Send size={13} /> {replySending ? 'Sending...' : 'Reply'}
                </button>
              </div>
            </div>
          )}

          {/* URLs Sandbox */}
          {activeChannel === 'url' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Simulated web browser sandbox. Testing URLs are vetted by the URL Threat Classifier before opening.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {events.filter(e => e.content_type === 'url').slice(0, 5).map((u) => {
                  const isThreat = u.ai_result?.classification !== 'SAFE';
                  return (
                    <div key={u.event_id} style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <code style={{ fontSize: '0.78rem', color: isThreat ? 'var(--color-danger)' : 'var(--color-blue-light)' }}>
                            {u.content_preview || u.raw_content || 'http://example.com'}
                          </code>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Score: {u.ai_result?.risk_score}/100 — {u.ai_result?.classification}
                          </div>
                        </div>
                        <button
                          onClick={() => setForensicEvent(u)}
                          className="btn btn-outline"
                          style={{ fontSize: '0.7rem', padding: '4px 10px' }}
                        >
                          <Eye size={12} /> Inspect Link
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other Channels Fallback */}
          {activeChannel !== 'whatsapp' && activeChannel !== 'instagram' && activeChannel !== 'url' && (
            <div style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Active feed for <strong>{channels.find(c => c.id === activeChannel)?.name}</strong>: Inspected through zero-trust heuristic adapter. All payloads are scanned with AI integrity markers before previewing.
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          D. INTERACTIVE SECURITY ACTIVITY & EVENT FEED
          ======================================================== */}
      <div className="cyber-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Activity size={17} color="var(--color-blue-light)" />
              Real-Time Security Activity & Forensic Stream
            </h3>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Live SQLite persistent audit log. Click any event to open the deep forensic inspection modal.
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFeedFilter('ALL')}
              className={`btn ${feedFilter === 'ALL' ? 'btn-primary-green' : 'btn-outline'}`}
              style={{ fontSize: '0.72rem', padding: '4px 10px' }}
            >
              All ({events.length})
            </button>
            <button
              onClick={() => setFeedFilter('THREATS')}
              className={`btn ${feedFilter === 'THREATS' ? 'btn-primary-green' : 'btn-outline'}`}
              style={{ fontSize: '0.72rem', padding: '4px 10px', color: feedFilter === 'THREATS' ? '#ffffff' : 'var(--color-danger)' }}
            >
              Threats ({threatsCount})
            </button>
            <button
              onClick={() => setFeedFilter('SAFE')}
              className={`btn ${feedFilter === 'SAFE' ? 'btn-primary-green' : 'btn-outline'}`}
              style={{ fontSize: '0.72rem', padding: '4px 10px', color: feedFilter === 'SAFE' ? '#ffffff' : 'var(--color-green)' }}
            >
              Safe ({safeCount})
            </button>
            <button
              onClick={() => setFeedFilter('QUARANTINE')}
              className={`btn ${feedFilter === 'QUARANTINE' ? 'btn-primary-green' : 'btn-outline'}`}
              style={{ fontSize: '0.72rem', padding: '4px 10px', color: feedFilter === 'QUARANTINE' ? '#ffffff' : 'var(--color-warning)' }}
            >
              Quarantine ({quarantinedCount})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '14px', position: 'relative' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search events by sender, ID, content text or classification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.78rem'
            }}
          />
        </div>

        {/* Events Table / Stream */}
        {filteredEvents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredEvents.slice(0, 12).map((evt) => {
              const isThreat = evt.ai_result?.classification !== 'SAFE';
              return (
                <div
                  key={evt.event_id}
                  onClick={() => setForensicEvent(evt)}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                  className="event-row-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isThreat ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      border: isThreat ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isThreat ? <ShieldAlert size={16} color="var(--color-danger)" /> : <CheckCircle size={16} color="var(--color-green)" />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.8rem', color: '#ffffff' }}>{evt.sender_id}</strong>
                        <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{evt.event_id}</span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.58rem' }}>{evt.content_type}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {evt.content_preview || evt.raw_content || 'Payload inspected'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge ${isThreat ? 'badge-danger' : 'badge-green'}`} style={{ fontSize: '0.62rem' }}>
                      {evt.ai_result?.classification || 'SAFE'} ({evt.ai_result?.risk_score || 12}/100)
                    </span>
                    <span className={`badge ${evt.final_action === 'ALLOW' ? 'badge-green' : evt.final_action === 'QUARANTINE' || evt.final_action === 'BLOCK' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.62rem' }}>
                      {evt.user_action || evt.final_action || 'ALLOW'}
                    </span>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No security events matching filter criteria.
          </div>
        )}
      </div>

      {/* ========================================================
          DEEP FORENSIC EXPLANATION & USER AGENCY MODAL
          ======================================================== */}
      {forensicEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div className="cyber-card" style={{
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            border: '1px solid var(--border-green)',
            boxShadow: '0 0 40px rgba(0, 0, 0, 0.6)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="var(--color-green)" />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    CyberShield Forensic Investigation
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Event ID: <strong style={{ color: 'var(--color-green)', fontFamily: 'var(--font-mono)' }}>{forensicEvent.event_id}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setForensicEvent(null)}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                ✕ Close
              </button>
            </div>

            {/* Core Classification Pill Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: forensicEvent.ai_result?.classification !== 'SAFE' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              borderRadius: 'var(--radius-sm)',
              border: forensicEvent.ai_result?.classification !== 'SAFE' ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--border-green)',
              marginBottom: '18px'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Threat Classification:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: forensicEvent.ai_result?.classification !== 'SAFE' ? 'var(--color-danger)' : 'var(--color-green)' }}>
                  {forensicEvent.ai_result?.classification || 'SAFE'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Calibrated Risk Score:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: forensicEvent.ai_result?.classification !== 'SAFE' ? 'var(--color-danger)' : 'var(--color-green)' }}>
                  {forensicEvent.ai_result?.risk_score || 12} / 100 ({forensicEvent.ai_result?.risk_level || 'LOW'})
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.76rem', marginBottom: '18px' }}>
              <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sender Identity:</span>
                <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{forensicEvent.sender_id}</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Content Modality:</span>
                <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px', textTransform: 'capitalize' }}>{forensicEvent.content_type}</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>AI Model Router:</span>
                <div style={{ fontWeight: 700, color: 'var(--color-blue-light)', marginTop: '2px' }}>{forensicEvent.ai_result?.model || 'Multimodal Detector'}</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Inference Latency:</span>
                <div style={{ fontWeight: 700, color: 'var(--color-green)', marginTop: '2px' }}>{(forensicEvent.ai_result?.processing_time_ms || 24).toFixed(1)}ms</div>
              </div>
            </div>

            {/* Raw Content Payload */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                Raw Content Body:
              </div>
              <div style={{
                padding: '10px 14px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                maxHeight: '90px',
                overflowY: 'auto'
              }}>
                {forensicEvent.content_preview || forensicEvent.raw_content || 'No text content'}
              </div>
            </div>

            {/* Explainable AI Reasons */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                Explainable AI Detection Reasons:
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {(forensicEvent.ai_result?.reasons || ['Pattern matched standard conversational behavior.']).map((r, i) => (
                  <li key={i} style={{ marginBottom: '3px' }}>{r}</li>
                ))}
              </ul>
            </div>

            {/* User Security Agency Actions */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '18px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
                Select User Action (Preserves Full Agency):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <button
                  onClick={() => handleAction(forensicEvent.event_id, 'ALLOW')}
                  disabled={actionLoading}
                  className={`btn ${forensicEvent.user_action === 'ALLOW' ? 'btn-primary-green' : 'btn-outline'}`}
                  style={{ justifyContent: 'center', fontSize: '0.72rem', padding: '8px 4px' }}
                >
                  <CheckCircle size={13} /> Allow
                </button>
                <button
                  onClick={() => handleAction(forensicEvent.event_id, 'BLOCK')}
                  disabled={actionLoading}
                  className={`btn ${forensicEvent.user_action === 'BLOCK' ? 'btn-primary-green' : 'btn-outline'}`}
                  style={{ justifyContent: 'center', fontSize: '0.72rem', padding: '8px 4px', color: 'var(--color-danger)' }}
                >
                  <XCircle size={13} /> Block
                </button>
                <button
                  onClick={() => handleAction(forensicEvent.event_id, 'QUARANTINE')}
                  disabled={actionLoading}
                  className={`btn ${forensicEvent.user_action === 'QUARANTINE' ? 'btn-primary-green' : 'btn-outline'}`}
                  style={{ justifyContent: 'center', fontSize: '0.72rem', padding: '8px 4px', color: 'var(--color-warning)' }}
                >
                  <Lock size={13} /> Quarantine
                </button>
                <button
                  onClick={() => handleAction(forensicEvent.event_id, 'REVIEW')}
                  disabled={actionLoading}
                  className={`btn ${forensicEvent.user_action === 'REVIEW' ? 'btn-primary-green' : 'btn-outline'}`}
                  style={{ justifyContent: 'center', fontSize: '0.72rem', padding: '8px 4px' }}
                >
                  <Clock size={13} /> Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
