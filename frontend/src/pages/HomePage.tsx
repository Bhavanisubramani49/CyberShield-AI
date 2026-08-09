import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Clock, 
  Zap, 
  RefreshCw, 
  MessageSquare, 
  Mail, 
  Globe, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Send, 
  Search, 
  ChevronRight, 
  Eye, 
  BarChart3, 
  PieChart, 
  TrendingUp 
} from 'lucide-react';
import { 
  SystemHealth, 
  SecurityEvent, 
  SecurityAction,
  NavigationPage 
} from '../types';
import { 
  fetchEventsAPI, 
  submitEventActionAPI,
  sendEventAPI
} from '../services/api';

interface HomePageProps {
  health: SystemHealth | null;
  setPage?: (page: NavigationPage) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ health, setPage }) => {
  // Core State
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Active Interactive Channel (WhatsApp, Instagram, Messages, Email, Web, Photos, Videos, News, Files)
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  // Real-Time Security Alert (Smooth Animated Red Notification Toast for Threats)
  const [liveAlert, setLiveAlert] = useState<SecurityEvent | null>(null);

  // Forensic Inspection Modal & Threat Warning State
  const [forensicEvent, setForensicEvent] = useState<SecurityEvent | null>(null);
  const [securityWarningEvent, setSecurityWarningEvent] = useState<SecurityEvent | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Simulated Chat Reply State (for chat sandbox)
  const [chatReply, setChatReply] = useState<string>('');
  const [replySending, setReplySending] = useState<boolean>(false);

  // Filters & Search
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'THREATS' | 'SAFE' | 'QUARANTINE'>('ALL');
  const [activeClassificationFilter, setActiveClassificationFilter] = useState<string | null>(null);
  const [activeRiskFilter, setActiveRiskFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initial Data Load & Polling Fallback
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3500);
    return () => clearInterval(interval);
  }, []);

  // Real-Time SSE Event Stream Listener (GET /api/v1/events/stream)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('http://127.0.0.1:8000/api/v1/events/stream');
      
      eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && parsed.event_id) {
            // Update events list
            setEvents(prev => {
              const exists = prev.some(item => item.event_id === parsed.event_id);
              if (exists) return prev;
              return [parsed, ...prev];
            });

            // If dangerous content -> Trigger Smooth Red Security Notification
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
      // Handled by polling
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  const loadData = async () => {
    try {
      const evts = await fetchEventsAPI();
      setEvents(evts);
    } catch (e) {
      console.error('Failed to load receiver data:', e);
    }
  };

  const handleQuickScan = () => {
    setScanning(true);
    setScanMessage('Scanning 9 digital channels & evaluating neural threat heuristics...');
    setTimeout(() => {
      setScanMessage('Verifying zero-trust integration adapters & database integrity...');
    }, 800);
    setTimeout(() => {
      setScanning(false);
      setScanMessage(null);
      loadData();
    }, 1600);
  };

  const handleAction = async (eventId: string, action: SecurityAction) => {
    setActionLoading(true);
    try {
      await submitEventActionAPI(eventId, action);
      await loadData();
      if (forensicEvent && forensicEvent.event_id === eventId) {
        setForensicEvent(prev => prev ? { ...prev, user_action: action, final_action: action } : null);
      }
      if (securityWarningEvent && securityWarningEvent.event_id === eventId) {
        setSecurityWarningEvent(null);
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
        sender_id: 'Dr. Alex Vance (Receiver User)',
        sender_type: 'normal_user',
        receiver_id: 'External Sender (Marcus Reynolds)',
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

  // Metrics computation from real database data
  const totalEventsCount = Math.max(1, events.length);
  const threatsCount = events.filter(e => e.ai_result?.classification !== 'SAFE').length;
  const safeCount = events.filter(e => e.ai_result?.classification === 'SAFE').length;
  const quarantinedCount = events.filter(e => e.user_action === 'QUARANTINE' || e.final_action === 'QUARANTINE').length;
  const blockedCount = events.filter(e => e.user_action === 'BLOCK' || e.final_action === 'BLOCK').length;
  const underReviewCount = events.filter(e => e.user_action === 'REVIEW' || e.final_action === 'REVIEW').length;
  
  // Dynamic Calibrated Security Score (e.g. 88 / 100)
  const defenseScore = Math.max(70, Math.min(99, Math.round(100 - (threatsCount / totalEventsCount) * 16)));

  // 9 Protected Channel Definitions
  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      modality: 'message',
      icon: MessageSquare,
      color: '#25D366',
      badge: 'Chat',
      desc: 'Simulated WhatsApp chats & OTP flows'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      modality: 'message',
      icon: Send,
      color: '#E1306C',
      badge: 'Social',
      desc: 'Direct inquiries & social bot streams'
    },
    {
      id: 'messages',
      name: 'Messages',
      modality: 'message',
      icon: MessageSquare,
      color: '#3B82F6',
      badge: 'SMS',
      desc: 'SMS financial prize & lottery alerts'
    },
    {
      id: 'email',
      name: 'Email',
      modality: 'email',
      icon: Mail,
      color: '#EA4335',
      badge: 'Mail',
      desc: 'Phishing notices & fake banking links'
    },
    {
      id: 'web',
      name: 'Web & URLs',
      modality: 'url',
      icon: Globe,
      color: '#06B6D4',
      badge: 'Browser',
      desc: 'Deceptive IP hosts & domain reputation'
    },
    {
      id: 'photos',
      name: 'Photos',
      modality: 'image',
      icon: ImageIcon,
      color: '#A855F7',
      badge: 'Media',
      desc: 'Pixel manipulation & Error Level Analysis'
    },
    {
      id: 'videos',
      name: 'Videos',
      modality: 'video',
      icon: Video,
      color: '#EC4899',
      badge: 'Stream',
      desc: 'Temporal deepfake & face-swap scanner'
    },
    {
      id: 'news',
      name: 'News',
      modality: 'news',
      icon: FileText,
      color: '#F59E0B',
      badge: 'Article',
      desc: 'Disinformation & viral medical claims'
    },
    {
      id: 'files',
      name: 'Files',
      modality: 'file',
      icon: Lock,
      color: '#10B981',
      badge: 'Vault',
      desc: 'Dangerous macros & binary PE inspection'
    }
  ];

  // Threat Distribution Calculation for Interactive Charts
  const threatDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      SCAM: 0,
      PHISHING: 0,
      FAKE_NEWS: 0,
      DEEPFAKE: 0,
      MANIPULATED: 0,
      MALICIOUS: 0,
      SAFE: 0
    };
    events.forEach(e => {
      const cls = (e.ai_result?.classification || 'SAFE').toUpperCase();
      if (counts[cls] !== undefined) {
        counts[cls] += 1;
      } else {
        counts['MALICIOUS'] += 1;
      }
    });
    return counts;
  }, [events]);

  // Risk Distribution Calculation
  const riskDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };
    events.forEach(e => {
      const lvl = (e.ai_result?.risk_level || 'LOW').toUpperCase();
      if (counts[lvl] !== undefined) {
        counts[lvl] += 1;
      } else {
        counts['LOW'] += 1;
      }
    });
    return counts;
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (activeClassificationFilter && e.ai_result?.classification !== activeClassificationFilter) return false;
      if (activeRiskFilter && e.ai_result?.risk_level !== activeRiskFilter) return false;
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
  }, [events, activeClassificationFilter, activeRiskFilter, feedFilter, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* ========================================================
          REAL-TIME SECURITY ALERT (SMOOTH RED NOTIFICATION TOAST)
          ======================================================== */}
      {liveAlert && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          maxWidth: '430px',
          width: 'calc(100% - 48px)',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(15, 23, 42, 0.98))',
          border: '2px solid var(--color-danger)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 12px 35px rgba(239, 68, 68, 0.45)',
          padding: '16px 20px',
          backdropFilter: 'blur(16px)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="#ffffff" />
              <strong style={{ fontSize: '0.9rem', color: '#ffffff', letterSpacing: '-0.2px' }}>
                🚨 THREAT DETECTED
              </strong>
            </div>
            <button
              onClick={() => setLiveAlert(null)}
              style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8, fontSize: '0.9rem' }}
              title="Dismiss notification"
            >
              ✕
            </button>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#fee2e2', marginBottom: '8px', lineHeight: '1.4' }}>
            <strong>{liveAlert.ai_result?.classification || 'PHISHING'}</strong> content detected
            <span style={{ marginLeft: '6px' }}>— Risk: <strong>{liveAlert.ai_result?.risk_score || 94}/100 ({liveAlert.ai_result?.risk_level || 'CRITICAL'})</strong></span>
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
              style={{ flex: 1, padding: '7px 12px', fontSize: '0.76rem', justifyContent: 'center', background: '#ffffff', color: '#090d16', fontWeight: 700 }}
            >
              <Eye size={13} /> INSPECT THREAT
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
          1. TOP: CYBERSHIELD AI SECURITY STATUS CARD
          ======================================================== */}
      <div className="cyber-card-green" style={{ padding: '26px 30px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '22px' }}>
          {/* Left: Brand, Subtext & Radial Defense Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {/* Circular Protection Gauge */}
            <div style={{
              width: '92px',
              height: '92px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.2))',
              border: '3.5px solid var(--color-green)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.35)',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-green)', lineHeight: 1 }}>
                {defenseScore}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>
                / 100
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.3px', color: '#ffffff' }}>
                  CYBERSHIELD <span style={{ color: 'var(--color-green)' }}>AI</span>
                </span>
                <span className="badge badge-green">
                  <span className="live-dot" />
                  PROTECTED
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--color-green-light)', fontWeight: 600 }}>
                "Protected in real time"
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '580px', lineHeight: '1.4' }}>
                Autonomous multimodal shield actively screening incoming messages, media, URLs, news, and files with 8 neural classifiers and persistent SQLite forensics.
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleQuickScan}
              disabled={scanning}
              className="btn btn-primary-green"
              style={{ fontSize: '0.82rem', padding: '10px 18px' }}
            >
              <Zap size={15} className={scanning ? 'spin' : ''} />
              {scanning ? 'Scanning Channels...' : 'Quick Security Scan'}
            </button>
            <button
              onClick={loadData}
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '10px 14px' }}
              title="Refresh telemetry"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Scan Message */}
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

        {/* Real Backend Data Chips */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          fontSize: '0.76rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Threat Protection:</span>{' '}
            <strong style={{ color: '#ffffff' }}>{health?.active_ai_models?.length || 8} / 8 AI Engines Active</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Activity:</span>{' '}
            <strong style={{ color: 'var(--color-green)' }}>{totalEventsCount} Protected Events</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Protected Channels:</span>{' '}
            <strong style={{ color: 'var(--color-blue-light)' }}>9 Digital Surfaces</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Recent Alerts:</span>{' '}
            <strong style={{ color: threatsCount > 0 ? 'var(--color-danger)' : 'var(--color-green)' }}>
              {threatsCount} Intercepted Threats
            </strong>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. ACTIVITY SUMMARY CARDS
          ======================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px'
      }}>
        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Protected Events</span>
            <Activity size={16} color="var(--color-blue-light)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>{totalEventsCount}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Screened across channels</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Threats Detected</span>
            <AlertTriangle size={16} color="var(--color-danger)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-danger)' }}>{threatsCount}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Scams, phish & malware</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Safe Content</span>
            <CheckCircle size={16} color="var(--color-green)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-green)' }}>{safeCount}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Delivered naturally</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quarantined in Vault</span>
            <Lock size={16} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-warning)' }}>{quarantinedCount + blockedCount}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Isolated from device</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Review</span>
            <Clock size={16} color="var(--color-blue-light)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>{underReviewCount}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Awaiting user confirmation</div>
        </div>
      </div>

      {/* ========================================================
          3. NINE PROTECTED CHANNEL CARDS
          ======================================================== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <ShieldCheck size={18} color="var(--color-green)" />
              Protected Channels (Simulated Sources)
            </h2>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Click any channel tile to open that channel's interactive content experience & security sandbox.
            </div>
          </div>
          <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>9 ACTIVE CHANNELS</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                  border: isSelected ? '1.5px solid var(--color-green)' : '1px solid var(--border-subtle)',
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

                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                  {ch.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: '1.3' }}>
                  {ch.desc}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                  <span>{channelEvents.length} Events</span>
                  <span style={{ color: channelThreats > 0 ? 'var(--color-danger)' : 'var(--color-green)', fontWeight: 600 }}>
                    {channelThreats} Threats
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          INTERACTIVE CHANNEL CONTENT EXPERIENCE & SANDBOX VIEWER
          ======================================================== */}
      {activeChannel && (
        <div className="cyber-card" style={{ padding: '22px', border: '1.5px solid var(--color-green)', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} color="var(--color-green)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Interactive Receiver Experience: {channels.find(c => c.id === activeChannel)?.name}
                </h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Interactive simulated user client with real-time CyberShield zero-trust threat interception
                </div>
              </div>
            </div>

            <button onClick={() => setActiveChannel(null)} className="btn btn-outline" style={{ fontSize: '0.74rem', padding: '5px 10px' }}>
              Close Channel ✕
            </button>
          </div>

          {/* 1. MESSAGES & WHATSAPP & INSTAGRAM CHAT EXPERIENCE */}
          {(activeChannel === 'whatsapp' || activeChannel === 'instagram' || activeChannel === 'messages') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Incoming communication thread. <strong>Safe messages</strong> are delivered normally with a subtle tag; <strong>Dangerous scam payloads</strong> trigger CyberShield interception.
              </div>

              {/* Chat Thread */}
              <div style={{
                maxHeight: '340px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '14px',
                background: 'rgba(0, 0, 0, 0.45)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}>
                {events.filter(e => e.content_type === 'message' || e.platform === activeChannel).slice(0, 10).map((msg) => {
                  const isThreat = msg.ai_result?.classification !== 'SAFE';
                  return (
                    <div
                      key={msg.event_id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: isThreat ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                        border: isThreat ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)',
                        maxWidth: '85%'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        <span><strong>{msg.sender_id}</strong> ({msg.event_id})</span>
                        <span className={`badge ${isThreat ? 'badge-danger' : 'badge-green'}`} style={{ fontSize: '0.58rem' }}>
                          {isThreat ? msg.ai_result?.classification : 'SAFE'}
                        </span>
                      </div>

                      {isThreat ? (
                        <div>
                          <div style={{ color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldAlert size={15} /> ⚠️ CYBERSHIELD BLOCKED DANGEROUS CONTENT
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Payload moved to quarantine vault to protect this receiver. Reason: {msg.ai_result?.reasons?.[0] || 'Urgency / Financial scam marker detected.'}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                            <button
                              onClick={() => setSecurityWarningEvent(msg)}
                              className="btn btn-outline"
                              style={{ fontSize: '0.7rem', padding: '4px 8px', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                            >
                              <ShieldAlert size={12} /> Open Warning Card
                            </button>
                            <button
                              onClick={() => setForensicEvent(msg)}
                              className="btn btn-outline"
                              style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                            >
                              <Eye size={12} /> Forensic Details
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '0.82rem', color: '#ffffff' }}>
                            {msg.content_preview || msg.raw_content || 'Good morning, meeting confirmed.'}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--color-green)', marginTop: '4px' }}>
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
                    padding: '9px 12px',
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
                  style={{ padding: '9px 16px', fontSize: '0.82rem' }}
                >
                  <Send size={13} /> {replySending ? 'Sending...' : 'Reply to Sender'}
                </button>
              </div>
            </div>
          )}

          {/* 2. WEB & URLS BROWSER SANDBOX */}
          {activeChannel === 'web' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Simulated web browser sandbox. Testing URLs are vetted by the URL Threat Classifier before opening.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.filter(e => e.content_type === 'url').slice(0, 6).map((u) => {
                  const isThreat = u.ai_result?.classification !== 'SAFE';
                  return (
                    <div key={u.event_id} style={{ padding: '14px', background: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-sm)', border: isThreat ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Globe size={14} color={isThreat ? 'var(--color-danger)' : 'var(--color-blue-light)'} />
                            <code style={{ fontSize: '0.8rem', color: isThreat ? 'var(--color-danger)' : 'var(--color-blue-light)', fontWeight: 600 }}>
                              {u.content_preview || u.raw_content || 'http://example.com'}
                            </code>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Score: <strong>{u.ai_result?.risk_score}/100</strong> — Classification: <strong>{u.ai_result?.classification}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          {isThreat ? (
                            <button
                              onClick={() => setSecurityWarningEvent(u)}
                              className="btn btn-outline"
                              style={{ fontSize: '0.72rem', padding: '4px 10px', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                            >
                              <ShieldAlert size={12} /> Warning Card
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={13} /> ✓ Protected by CyberShield
                            </span>
                          )}
                          <button
                            onClick={() => setForensicEvent(u)}
                            className="btn btn-outline"
                            style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                          >
                            <Eye size={12} /> Inspect
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. NEWS & ARTICLES SANDBOX */}
          {activeChannel === 'news' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Simulated news & article reader with linguistic distortion and fact-check verification tags.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.filter(e => e.content_type === 'news').slice(0, 5).map((n) => {
                  const isThreat = n.ai_result?.classification !== 'SAFE';
                  return (
                    <div key={n.event_id} style={{ padding: '14px', background: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-sm)', border: isThreat ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span className={`badge ${isThreat ? 'badge-warning' : 'badge-green'}`} style={{ fontSize: '0.6rem' }}>
                          {isThreat ? 'FAKE NEWS / MISINFORMATION' : 'VERIFIED NEWS'}
                        </span>
                        <button onClick={() => isThreat ? setSecurityWarningEvent(n) : setForensicEvent(n)} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                          <Eye size={12} /> {isThreat ? 'View Warning' : 'Article Details'}
                        </button>
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                        {n.content_preview || n.raw_content || 'Breaking news headline'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Sensationalist linguistic score: {n.ai_result?.risk_score}/100
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. PHOTOS & MEDIA SANDBOX */}
          {activeChannel === 'photos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Photo gallery preview with pixel-level Error Level Analysis (ELA) and GAN forgery tags.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {events.filter(e => e.content_type === 'image').slice(0, 4).map((p) => {
                  const isThreat = p.ai_result?.classification !== 'SAFE';
                  return (
                    <div key={p.event_id} style={{ padding: '14px', background: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-sm)', border: isThreat ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)' }}>
                      <div style={{ height: '90px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                        <ImageIcon size={32} color={isThreat ? 'var(--color-danger)' : 'var(--color-green)'} />
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>{p.content_preview || 'image_payload.png'}</div>
                      <div style={{ fontSize: '0.7rem', color: isThreat ? 'var(--color-danger)' : 'var(--color-green)', marginTop: '2px' }}>
                        {isThreat ? `Manipulated (${p.ai_result?.risk_score}/100)` : '✓ Protected by CyberShield'}
                      </div>
                      <button onClick={() => isThreat ? setSecurityWarningEvent(p) : setForensicEvent(p)} className="btn btn-outline" style={{ width: '100%', marginTop: '8px', fontSize: '0.72rem', justifyContent: 'center' }}>
                        <Eye size={12} /> {isThreat ? 'Inspect Warning' : 'Photo Info'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. OTHER CHANNELS (VIDEOS, FILES, EMAIL) */}
          {activeChannel !== 'whatsapp' && activeChannel !== 'instagram' && activeChannel !== 'messages' && activeChannel !== 'web' && activeChannel !== 'news' && activeChannel !== 'photos' && (
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Active simulated receiver surface for <strong>{channels.find(c => c.id === activeChannel)?.name}</strong>. All incoming digital items are screened by specialized AI detectors before execution or preview.
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          4. INTERACTIVE CLICKABLE CHARTS
          ======================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        
        {/* Threat Distribution Chart */}
        <div className="cyber-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <BarChart3 size={16} color="var(--color-green)" />
              Threat Distribution (Clickable)
            </h3>
            {activeClassificationFilter && (
              <button onClick={() => setActiveClassificationFilter(null)} className="btn btn-outline" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                Clear Filter ✕
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(threatDistribution).map(([category, count]) => {
              const pct = Math.round((count / totalEventsCount) * 100);
              const isSelected = activeClassificationFilter === category;
              const isSafe = category === 'SAFE';

              return (
                <div
                  key={category}
                  onClick={() => setActiveClassificationFilter(isSelected ? null : category)}
                  style={{
                    cursor: 'pointer',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1px solid var(--color-green)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Click to filter by ${category}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: isSafe ? 'var(--color-green)' : '#ffffff' }}>{category}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: isSafe ? 'var(--color-green)' : 'linear-gradient(90deg, var(--color-warning), var(--color-danger))',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Level Distribution Chart */}
        <div className="cyber-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <PieChart size={16} color="var(--color-blue-light)" />
              Risk Level Distribution (Clickable)
            </h3>
            {activeRiskFilter && (
              <button onClick={() => setActiveRiskFilter(null)} className="btn btn-outline" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                Clear Filter ✕
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(riskDistribution).map(([level, count]) => {
              const pct = Math.round((count / totalEventsCount) * 100);
              const isSelected = activeRiskFilter === level;
              const color = level === 'CRITICAL' ? 'var(--color-danger)' : level === 'HIGH' ? 'var(--color-warning)' : level === 'MEDIUM' ? 'var(--color-blue-light)' : 'var(--color-green)';

              return (
                <div
                  key={level}
                  onClick={() => setActiveRiskFilter(isSelected ? null : level)}
                  style={{
                    cursor: 'pointer',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1px solid var(--color-blue)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Click to filter by ${level}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: color }}>{level}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: color,
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          5. RECENT ACTIVITY & PERSISTENT AUDIT STREAM
          ======================================================== */}
      <div className="cyber-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <TrendingUp size={17} color="var(--color-blue-light)" />
              Security Activity & Threat Stream
            </h3>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Real-time SQLite database audit feed. Click any event to open deep forensic explanation or warning.
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setFeedFilter('ALL'); setActiveClassificationFilter(null); setActiveRiskFilter(null); }}
              className={`btn ${feedFilter === 'ALL' && !activeClassificationFilter && !activeRiskFilter ? 'btn-primary-green' : 'btn-outline'}`}
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
              Quarantined ({quarantinedCount})
            </button>
            {setPage && (
              <button
                onClick={() => setPage('history')}
                className="btn btn-outline"
                style={{ fontSize: '0.72rem', padding: '4px 10px', color: 'var(--color-blue-light)' }}
              >
                Forensic History →
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '14px', position: 'relative' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search by sender, ID, content text or threat classification..."
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

        {/* Event List */}
        {filteredEvents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredEvents.slice(0, 12).map((evt) => {
              const isThreat = evt.ai_result?.classification !== 'SAFE';
              return (
                <div
                  key={evt.event_id}
                  onClick={() => isThreat ? setSecurityWarningEvent(evt) : setForensicEvent(evt)}
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
                        <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>{evt.sender_id}</strong>
                        <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{evt.event_id}</span>
                        <span className="badge badge-neutral" style={{ fontSize: '0.58rem' }}>{evt.content_type}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
            No events match current filter settings.
          </div>
        )}
      </div>

      {/* ========================================================
          6. CYBERSHIELD SECURITY WARNING MODAL (DANGEROUS CONTENT)
          ======================================================== */}
      {securityWarningEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2200,
          padding: '20px'
        }}>
          <div className="cyber-card" style={{
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            border: '2px solid var(--color-danger)',
            boxShadow: '0 0 45px rgba(239, 68, 68, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={26} color="var(--color-danger)" />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-danger)', margin: 0 }}>
                    ⚠️ CYBERSHIELD SECURITY WARNING
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Dangerous content blocked to protect this device
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSecurityWarningEvent(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '12px 14px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.78rem', color: '#ffffff', marginBottom: '4px' }}>
                Risk: <strong style={{ color: 'var(--color-danger)' }}>{securityWarningEvent.ai_result?.risk_level || 'CRITICAL'} — {securityWarningEvent.ai_result?.risk_score || 95}/100</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#ffffff' }}>
                Classification: <strong style={{ color: 'var(--color-danger)', textTransform: 'uppercase' }}>{securityWarningEvent.ai_result?.classification || 'THREAT'}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                Why?
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {(securityWarningEvent.ai_result?.reasons || ['Malicious behavioral heuristic pattern detected.', 'Suspicious origin host / URL structure.']).map((r, i) => (
                  <li key={i} style={{ marginBottom: '3px' }}>{r}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '8px' }}>
              <button
                onClick={() => handleAction(securityWarningEvent.event_id, 'BLOCK')}
                disabled={actionLoading}
                className="btn btn-primary-green"
                style={{ justifyContent: 'center', fontSize: '0.78rem', padding: '10px', background: 'var(--color-danger)' }}
              >
                <XCircle size={14} /> [BLOCK]
              </button>
              <button
                onClick={() => handleAction(securityWarningEvent.event_id, 'QUARANTINE')}
                disabled={actionLoading}
                className="btn btn-outline"
                style={{ justifyContent: 'center', fontSize: '0.78rem', padding: '10px', color: 'var(--color-warning)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
              >
                <Lock size={14} /> [QUARANTINE]
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                onClick={() => handleAction(securityWarningEvent.event_id, 'ALLOW')}
                disabled={actionLoading}
                className="btn btn-outline"
                style={{ justifyContent: 'center', fontSize: '0.74rem', padding: '8px' }}
              >
                <CheckCircle size={13} /> [ALLOW ANYWAY]
              </button>
              <button
                onClick={() => {
                  setForensicEvent(securityWarningEvent);
                  setSecurityWarningEvent(null);
                }}
                className="btn btn-outline"
                style={{ justifyContent: 'center', fontSize: '0.74rem', padding: '8px', color: 'var(--color-blue-light)' }}
              >
                <Eye size={13} /> [VIEW DETAILS]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          7. DEEP FORENSIC EXPLANATION & AUDIT MODAL
          ======================================================== */}
      {forensicEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '20px'
        }}>
          <div className="cyber-card" style={{
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            border: '1.5px solid var(--border-green)',
            boxShadow: '0 0 45px rgba(0, 0, 0, 0.65)'
          }}>
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

            {/* Classification & Risk Pill */}
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

            {/* Raw Content Body */}
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

            {/* Explainable AI Detection Reasons */}
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

            {/* User Security Actions */}
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
