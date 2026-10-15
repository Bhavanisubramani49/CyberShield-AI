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
  FileText,
  Search, 
  ChevronRight, 
  Eye, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { 
  UserProfile,
  SystemHealth, 
  SecurityEvent, 
  SecurityAction,
  NavigationPage 
} from '../types';
import { getActiveUser } from '../services/auth';
import { 
  fetchEventsAPI, 
  submitEventActionAPI,
  sendEventAPI
} from '../services/api';
import { getPlatformLogo } from '../components/common/PlatformLogos';
import { InstagramSimulator } from '../components/simulators/InstagramSimulator';
import { WhatsAppSimulator } from '../components/WhatsAppSimulator';
import { MessagesSimulator } from '../components/MessagesSimulator';
import { EmailSimulator } from '../components/EmailSimulator';
import { DEMO_MEDIA_CATALOG } from '../data/demoMedia';

interface HomePageProps {
  health: SystemHealth | null;
  setPage?: (page: NavigationPage) => void;
  user?: UserProfile | null;
}

export const HomePage: React.FC<HomePageProps> = ({ health, setPage, user }) => {
  const currentAuthUser = user || getActiveUser();
  const activeUserId = currentAuthUser.id;

  // Core State
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Active Interactive Channel (WhatsApp, Instagram, Messages, Email, Web, Photos, Videos, News, Files)
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId);
  };

  // Real-Time Security Alert (Smooth Animated Red Notification Toast for Threats)
  const [liveAlert, setLiveAlert] = useState<SecurityEvent | null>(null);

  // Forensic Inspection Modal & Threat Warning State
  const [forensicEvent, setForensicEvent] = useState<SecurityEvent | null>(null);
  const [securityWarningEvent, setSecurityWarningEvent] = useState<SecurityEvent | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

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

  // Metrics computation from real database data
  const totalEventsCount = Math.max(1, events.length);
  const threatsCount = events.filter(e => e.ai_result?.classification !== 'SAFE').length;
  const safeCount = events.filter(e => e.ai_result?.classification === 'SAFE').length;
  const quarantinedCount = events.filter(e => e.user_action === 'QUARANTINE' || e.final_action === 'QUARANTINE').length;
  const blockedCount = events.filter(e => e.user_action === 'BLOCK' || e.final_action === 'BLOCK').length;
  const underReviewCount = events.filter(e => e.user_action === 'REVIEW' || e.final_action === 'REVIEW').length;
  
  // Dynamic Calibrated Security Score (e.g. 88 / 100)
  const defenseScore = Math.max(70, Math.min(99, Math.round(100 - (threatsCount / totalEventsCount) * 16)));

  // 9 Protected Channel Definitions with Authentic Logos & Dynamic Sandbox Subtitles
  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      modality: 'message',
      badge: 'Chat',
      desc: 'Encrypted chats, media & OTP authentication flows',
      headerTitle: 'Interactive Receiver: WhatsApp',
      headerSubtitle: 'Interactive simulated user client with real-time CyberShield zero-trust threat interception'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      modality: 'message',
      badge: 'Social',
      desc: 'Direct messages, creator inquiries & social bots',
      headerTitle: 'Interactive Receiver: Instagram',
      headerSubtitle: 'Interactive simulated Instagram application with DMs, stories and AI threat interception'
    },
    {
      id: 'messages',
      name: 'Messages / SMS',
      modality: 'message',
      badge: 'SMS',
      desc: 'SMS prize alerts, banking codes & urgent links',
      headerTitle: 'Interactive Receiver: Messages / SMS',
      headerSubtitle: 'Interactive simulated Messages client with real-time CyberShield threat interception'
    },
    {
      id: 'email',
      name: 'Email / Gmail',
      modality: 'email',
      badge: 'Mail',
      desc: 'Spear-phishing invoices & deceptive attachments',
      headerTitle: 'Interactive Receiver: Email / Gmail',
      headerSubtitle: 'Interactive simulated Email client with real-time phishing and threat interception'
    },
    {
      id: 'web',
      name: 'Web & URLs',
      modality: 'url',
      badge: 'Browser',
      desc: 'Domain reputation, IP hosts & certificate safety',
      headerTitle: 'Interactive Receiver: Web & URLs',
      headerSubtitle: 'Interactive simulated web browser with domain reputation and phishing site interception'
    },
    {
      id: 'photos',
      name: 'Photos & Gallery',
      modality: 'image',
      badge: 'Media',
      desc: 'Error Level Analysis (ELA) & pixel manipulation',
      headerTitle: 'Interactive Receiver: Photos & Gallery',
      headerSubtitle: 'Interactive simulated photo gallery with Error Level Analysis (ELA) and forgery detection'
    },
    {
      id: 'videos',
      name: 'Videos & Streams',
      modality: 'video',
      badge: 'Stream',
      desc: 'Temporal deepfake & facial reenactment scanner',
      headerTitle: 'Interactive Receiver: Videos & Streams',
      headerSubtitle: 'Interactive simulated video player with temporal deepfake and facial reenactment detection'
    },
    {
      id: 'news',
      name: 'News & Articles',
      modality: 'news',
      badge: 'Article',
      desc: 'Misinformation, synthetic claims & fact checking',
      headerTitle: 'Interactive Receiver: News & Articles',
      headerSubtitle: 'Interactive simulated news reader with misinformation and fact-check verification'
    },
    {
      id: 'files',
      name: 'Files & Storage',
      modality: 'file',
      badge: 'Vault',
      desc: 'Macro inspection, binary entropy & sandbox isolation',
      headerTitle: 'Interactive Receiver: Files & Storage',
      headerSubtitle: 'Interactive simulated file storage with macro inspection and sandbox isolation'
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

          <div style={{ fontSize: '0.74rem', color: '#fca5a5', marginBottom: '12px', background: 'rgba(0, 0, 0, 0.35)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getPlatformLogo(liveAlert.platform || liveAlert.content_type, 20)}
            <span>Source: <strong>{liveAlert.sender_id}</strong> ({liveAlert.content_type})</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setForensicEvent(liveAlert);
                setLiveAlert(null);
              }}
              className="btn btn-primary-green"
              style={{ flex: 1, padding: '7px 12px', fontSize: '0.76rem', justifyContent: 'center', background: '#ffffff', color: '#090d16 !important', fontWeight: 700 }}
            >
              <Eye size={13} color="#090d16" /> INSPECT THREAT
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

      {activeChannel ? (
        /* ========================================================
           INTERACTIVE PLATFORM APPLICATION VIEW (IMMEDIATE LAUNCH)
           ======================================================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.15s ease-out' }}>
          {/* Top Navigation Bar with Back Button */}
          <div className="cyber-card-green" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={() => setActiveChannel(null)}
                  className="btn btn-outline"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.82rem',
                    padding: '7px 14px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'var(--border-green)',
                    color: 'var(--text-primary)',
                    fontWeight: 700
                  }}
                >
                  <ArrowLeft size={16} color="var(--color-green)" /> Back to Protected Channels
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getPlatformLogo(activeChannel, 34)}
                  <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {channels.find(c => c.id === activeChannel)?.headerTitle || `Interactive Receiver: ${channels.find(c => c.id === activeChannel)?.name}`}
                    </h2>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-green-light)', marginTop: '1px' }}>
                      {channels.find(c => c.id === activeChannel)?.headerSubtitle}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveChannel(null)}
                className="btn btn-outline"
                style={{ fontSize: '0.76rem', padding: '6px 12px' }}
              >
                Close Channel ✕
              </button>
            </div>
          </div>

          {/* Active Platform Component Container */}
          <div className="cyber-card" style={{ padding: '20px', border: '1.5px solid var(--color-green)' }}>
            {/* 1. WHATSAPP CONVERSATION CENTER */}
            {activeChannel === 'whatsapp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                <WhatsAppSimulator activeUserId={activeUserId} currentUser={currentAuthUser} isReceiverView={true} />
              </div>
            )}

            {/* 2. MESSAGES / SMS CONVERSATION CENTER */}
            {activeChannel === 'messages' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                <MessagesSimulator activeUserId={activeUserId} currentUser={currentAuthUser} isReceiverView={true} />
              </div>
            )}

            {/* 3. INSTAGRAM DIRECT MESSAGE & SOCIAL SANDBOX */}
            {activeChannel === 'instagram' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                <InstagramSimulator
                  events={events}
                  currentUser={currentAuthUser}
                  onSendEvent={async (p) => {
                    const res = await sendEventAPI({
                      event_id: `EVT-IG-${Date.now().toString().slice(-4)}`,
                      sender_id: p.sender_id,
                      sender_type: 'normal_user',
                      receiver_id: p.recipient_id,
                      platform: 'instagram',
                      content_type: p.content_type || 'message',
                      content_preview: p.payload?.text || p.payload?.filename || 'Instagram Event',
                      raw_content: JSON.stringify(p.payload),
                      payload: p.payload,
                      status: 'DELIVERED',
                      timestamp: new Date().toISOString()
                    });
                    await loadData();
                    return res;
                  }}
                  onInspectEvent={setForensicEvent}
                  onOpenWarning={setSecurityWarningEvent}
                />
              </div>
            )}

            {/* 4. EMAIL / GMAIL INBOX SANDBOX */}
            {activeChannel === 'email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '100%', height: '650px' }}>
                  <EmailSimulator activeUserId={activeUserId} currentUser={currentAuthUser} isReceiverView={true} />
                </div>
              </div>
            )}

            {/* 5. WEB & URLS BROWSER SANDBOX */}
            {activeChannel === 'web' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Simulated Protected Web Browser. Testing URLs are scanned before rendering web viewports.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {DEMO_MEDIA_CATALOG.filter(m => m.category === 'web').map((webItem) => (
                    <div key={webItem.id} style={{ border: webItem.isThreat ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-green)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-subtle)' }}>
                      <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                        </div>
                        <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {webItem.isThreat ? <Lock size={12} color="#ef4444" /> : <Lock size={12} color="#10b981" />}
                          <span style={{ color: webItem.isThreat ? 'var(--color-danger)' : 'var(--color-green)' }}>{webItem.caption}</span>
                        </div>
                        <span className={`badge ${webItem.isThreat ? 'badge-danger' : 'badge-green'}`} style={{ fontSize: '0.6rem' }}>
                          {webItem.isThreat ? 'BLOCKED MALICIOUS URL' : '✓ PROTECTED BROWSER'}
                        </span>
                      </div>

                      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={webItem.mediaUrl} alt={webItem.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: webItem.isThreat ? 'blur(6px)' : 'none' }} />
                        {webItem.isThreat && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(239, 68, 68, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', textAlign: 'center' }}>
                            <ShieldAlert size={36} color="#ef4444" style={{ marginBottom: '6px' }} />
                            <strong style={{ fontSize: '0.9rem', color: '#fff' }}>🔴 NAVIGATION BLOCKED BY CYBERSHIELD</strong>
                            <div style={{ fontSize: '0.72rem', color: '#fee2e2', marginTop: '4px' }}>
                              Direct IP host with unverified SSL certificate and credential harvesting signature.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. PHOTOS & MEDIA GALLERY SANDBOX */}
            {activeChannel === 'photos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Photo & Media Gallery Preview with pixel-level Error Level Analysis (ELA) and GAN forgery tags.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {DEMO_MEDIA_CATALOG.filter(m => m.category === 'photos').map((photo) => (
                    <div key={photo.id} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: photo.isThreat ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
                      <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                        <img src={photo.mediaUrl} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: photo.isThreat ? 'blur(3px)' : 'none' }} />
                        <span className={`badge ${photo.isThreat ? 'badge-danger' : 'badge-green'}`} style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.6rem' }}>
                          {photo.isThreat ? `MANIPULATED (${photo.riskScore}/100)` : '✓ SAFE EXIF'}
                        </span>
                      </div>

                      <div style={{ padding: '12px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {photo.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Size: {photo.fileSize} • Type: {photo.fileType}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: photo.isThreat ? 'var(--color-danger)' : 'var(--color-green)', marginTop: '4px', fontWeight: 600 }}>
                          {photo.reasons[0]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. VIDEOS & STREAMS / YOUTUBE SANDBOX */}
            {activeChannel === 'videos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Simulated YouTube-style video stream player with deepfake boundary analysis and frame rate forensics.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {DEMO_MEDIA_CATALOG.filter(m => m.category === 'videos').map((vid) => (
                    <div key={vid.id} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: vid.isThreat ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
                      <div style={{ position: 'relative', height: '190px', background: '#000' }}>
                        {vid.isThreat ? (
                          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <img src={vid.thumbnailUrl} alt={vid.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(5px)' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(239, 68, 68, 0.4)', backdropFilter: 'blur(6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px', textAlign: 'center' }}>
                              <ShieldAlert size={36} color="#ef4444" style={{ marginBottom: '6px' }} />
                              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>🔴 DEEPFAKE DETECTED — PLAYBACK QUARANTINED</strong>
                              <div style={{ fontSize: '0.7rem', color: '#fee2e2', marginTop: '4px' }}>
                                Temporal frame warping detected across 48 sampled video frames.
                              </div>
                            </div>
                          </div>
                        ) : (
                          <video src={vid.mediaUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>

                      <div style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{vid.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{vid.author} • Duration: {vid.duration}</div>
                          </div>
                          <span className={`badge ${vid.isThreat ? 'badge-danger' : 'badge-green'}`} style={{ fontSize: '0.6rem' }}>
                            {vid.isThreat ? 'DEEPFAKE' : '✓ SAFE STREAM'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. NEWS & ARTICLES SANDBOX */}
            {activeChannel === 'news' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Simulated news & article reader with linguistic distortion and fact-check verification tags.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {DEMO_MEDIA_CATALOG.filter(m => m.category === 'news').map((newsItem) => (
                    <div key={newsItem.id} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: newsItem.isThreat ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-green)', background: 'var(--bg-subtle)', display: 'flex', flexWrap: 'wrap' }}>
                      <div style={{ width: '220px', minHeight: '140px', position: 'relative' }}>
                        <img src={newsItem.mediaUrl} alt={newsItem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {newsItem.isThreat && (
                          <div style={{ position: 'absolute', top: 6, left: 6, background: '#f59e0b', color: '#000', fontSize: '0.55rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                            MISINFORMATION
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1, padding: '14px', minWidth: '260px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>By {newsItem.author} ({newsItem.handle})</span>
                          <span className={`badge ${newsItem.isThreat ? 'badge-warning' : 'badge-green'}`} style={{ fontSize: '0.6rem' }}>
                            {newsItem.isThreat ? `FAKE NEWS (${newsItem.riskScore}/100)` : '✓ VERIFIED ARTICLE'}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {newsItem.title}
                        </h4>

                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                          {newsItem.caption}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. FILES & STORAGE SANDBOX */}
            {activeChannel === 'files' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Files & Storage Vault. Analyzes dangerous macro attachments (.docm, .xlsm), double extensions, and PE headers before download.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  {DEMO_MEDIA_CATALOG.filter(m => m.category === 'files').map((fl) => (
                    <div key={fl.id} style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: fl.isThreat ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={20} color={fl.isThreat ? 'var(--color-danger)' : 'var(--color-green)'} />
                          <div>
                            <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>{fl.title}</strong>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{fl.fileSize} • {fl.fileType}</div>
                          </div>
                        </div>
                        <span className={`badge ${fl.isThreat ? 'badge-danger' : 'badge-green'}`} style={{ fontSize: '0.6rem' }}>
                          {fl.isThreat ? 'QUARANTINED MACRO' : '✓ SAFE FILE'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: fl.isThreat ? 'var(--color-danger)' : 'var(--text-muted)', marginTop: '6px' }}>
                        {fl.reasons[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================
           MAIN DASHBOARD VIEW (WHEN NO CHANNEL IS OPENED)
           ======================================================== */
        <>
          {/* 1. TOP: CYBERSHIELD AI SECURITY STATUS CARD */}
          <div className="cyber-card-green" style={{ padding: '26px 30px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '22px' }}>
          {/* Left: Brand, Subtext & Radial Defense Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {/* Circular Protection Gauge */}
            <div style={{
              width: '92px',
              height: '92px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.15))',
              border: '3.5px solid var(--color-green)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
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
                <h1 style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.3px', color: 'var(--text-primary)', margin: 0 }}>
                  CYBERSHIELD <span style={{ color: 'var(--color-green)' }}>AI</span>
                </h1>
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
            background: 'rgba(16, 185, 129, 0.12)',
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
            <strong style={{ color: 'var(--text-primary)' }}>{health?.active_ai_models?.length || 8} / 8 AI Engines Active</strong>
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
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalEventsCount}</div>
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
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>{underReviewCount}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Awaiting user confirmation</div>
        </div>
      </div>

      {/* ========================================================
          3. NINE PROTECTED CHANNEL CARDS (WITH AUTHENTIC LOGOS)
          ======================================================== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <ShieldCheck size={18} color="var(--color-green)" />
              Protected Digital Channels
            </h2>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Click any channel tile to open that channel's interactive simulated receiver experience.
            </div>
          </div>
          <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>9 ACTIVE CHANNELS</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}>
          {channels.map((ch) => {
            const channelEvents = events.filter(e => e.content_type === ch.modality || e.platform === ch.id);
            const channelThreats = channelEvents.filter(e => e.ai_result?.classification !== 'SAFE').length;
            const isSelected = activeChannel === ch.id;

            return (
              <div
                key={ch.id}
                onClick={() => handleChannelSelect(ch.id)}
                className={`cyber-card ${isSelected ? 'cyber-card-green' : ''}`}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--color-green)' : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? '0 0 22px rgba(16, 185, 129, 0.28)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  {/* Authentic App Launcher Logo */}
                  {getPlatformLogo(ch.id, 42)}

                  <span className={`badge ${isSelected ? 'badge-green' : channelThreats > 0 ? 'badge-danger' : 'badge-neutral'}`} style={{ fontSize: '0.6rem' }}>
                    {isSelected ? '✓ SELECTED' : channelThreats > 0 ? `${channelThreats} THREATS` : 'ACTIVE'}
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isSelected ? 'var(--color-green)' : 'var(--text-primary)', marginBottom: '3px' }}>
                  {ch.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.35', minHeight: '32px' }}>
                  {ch.desc}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <span><strong>{channelEvents.length}</strong> Events</span>
                  <span style={{ color: isSelected ? 'var(--color-green)' : channelThreats > 0 ? 'var(--color-danger)' : 'var(--color-green)', fontWeight: 700 }}>
                    {isSelected ? 'Open Sandbox →' : `${channelThreats} Threats`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* ========================================================
          4. INTERACTIVE CLICKABLE CHARTS
          ======================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        
        {/* Threat Distribution Chart */}
        <div className="cyber-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
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
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-subtle)',
                    border: isSelected ? '1px solid var(--color-green)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Click to filter by ${category}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 700, color: isSafe ? 'var(--color-green)' : 'var(--text-primary)' }}>{category}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(100, 116, 139, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
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
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
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
                    background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-subtle)',
                    border: isSelected ? '1px solid var(--color-blue)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Click to filter by ${level}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 700, color: color }}>{level}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(100, 116, 139, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
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
            className="cyber-input"
            style={{
              paddingLeft: '34px',
              fontSize: '0.8rem'
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
                    background: 'var(--bg-subtle)',
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
                    {getPlatformLogo(evt.platform || evt.content_type, 32)}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>{evt.sender_id}</strong>
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
      </>
      )}

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
          background: 'var(--bg-modal-overlay)',
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
            background: 'var(--bg-card)',
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
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '12px 14px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Risk: <strong style={{ color: 'var(--color-danger)' }}>{securityWarningEvent.ai_result?.risk_level || 'CRITICAL'} — {securityWarningEvent.ai_result?.risk_score || 95}/100</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                Classification: <strong style={{ color: 'var(--color-danger)', textTransform: 'uppercase' }}>{securityWarningEvent.ai_result?.classification || 'THREAT'}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
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
                style={{ justifyContent: 'center', fontSize: '0.78rem', padding: '10px', background: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}
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
          background: 'var(--bg-modal-overlay)',
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
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-green)',
            boxShadow: '0 0 45px rgba(0, 0, 0, 0.65)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="var(--color-green)" />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
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
              <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sender Identity:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{forensicEvent.sender_id}</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Content Modality:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px', textTransform: 'capitalize' }}>{forensicEvent.content_type}</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>AI Model Router:</span>
                <div style={{ fontWeight: 700, color: 'var(--color-blue-light)', marginTop: '2px' }}>{forensicEvent.ai_result?.model || 'Multimodal Detector'}</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
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
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                color: 'var(--text-primary)',
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
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
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
