import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  Mail, 
  Globe, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Bell, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Lock, 
  RotateCcw, 
  Trash2, 
  Filter, 
  Layers, 
  Eye, 
  Shield
} from 'lucide-react';
import { SecurityEvent, SecurityAction } from '../types';
import { fetchEventsAPI, updateEventActionAPI } from '../services/api';

export const ReceiverPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [activeSurface, setActiveSurface] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [selectedEventDetails, setSelectedEventDetails] = useState<SecurityEvent | null>(null);

  // Load events from shared backend and local simulation storage
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const list = await fetchEventsAPI();
    setEvents(list);
  };

  const handleAction = async (eventId: string, action: SecurityAction) => {
    await updateEventActionAPI(eventId, action);
    setEvents(prev => prev.map(evt => {
      if (evt.event_id === eventId) {
        return { ...evt, user_action: action };
      }
      return evt;
    }));
    if (selectedEventDetails?.event_id === eventId) {
      setSelectedEventDetails(prev => prev ? { ...prev, user_action: action } : null);
    }
  };

  const handleDelete = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.event_id !== eventId));
    if (selectedEventDetails?.event_id === eventId) {
      setSelectedEventDetails(null);
    }
  };

  // Metrics computation
  const totalEvents = events.length;
  const safeEvents = events.filter(e => e.user_action === 'ALLOW' || e.ai_result?.classification === 'SAFE').length;
  const blockedEvents = events.filter(e => e.user_action === 'BLOCK' || e.user_action === 'QUARANTINE' || e.ai_result?.classification === 'SCAM' || e.ai_result?.classification === 'PHISHING' || e.ai_result?.classification === 'MALICIOUS').length;
  const reviewEvents = events.filter(e => e.user_action === 'REVIEW' || e.ai_result?.recommendation === 'REVIEW').length;
  const quarantinedEvents = events.filter(e => e.user_action === 'QUARANTINE' || e.ai_result?.recommendation === 'QUARANTINE').length;

  const surfaces = [
    { id: 'all', label: 'All Surfaces', icon: Layers },
    { id: 'message', label: 'Messages / SMS', icon: MessageSquare },
    { id: 'email', label: 'Email Inbox', icon: Mail },
    { id: 'social', label: 'Social Feed', icon: Users },
    { id: 'news', label: 'News Feed', icon: FileText },
    { id: 'url', label: 'URLs & Links', icon: Globe },
    { id: 'image', label: 'Media & Images', icon: ImageIcon },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'alerts', label: 'Instant Alerts', icon: Bell },
  ];

  // Filter events by selected surface and filter tag
  const filteredEvents = events.filter(evt => {
    const surfaceMatch = activeSurface === 'all' 
      ? true 
      : activeSurface === 'social' 
        ? evt.content_type === 'profile' 
        : activeSurface === 'alerts'
          ? true
          : evt.content_type === activeSurface;

    if (!surfaceMatch) return false;

    if (filterTag === 'ALL') return true;
    if (filterTag === 'SAFE') return evt.ai_result?.classification === 'SAFE';
    if (filterTag === 'SCAM') return evt.ai_result?.classification === 'SCAM';
    if (filterTag === 'PHISHING') return evt.ai_result?.classification === 'PHISHING';
    if (filterTag === 'MANIPULATED') return evt.ai_result?.classification === 'MANIPULATED';
    if (filterTag === 'DEEPFAKE') return evt.ai_result?.classification === 'DEEPFAKE';
    if (filterTag === 'QUARANTINED') return evt.user_action === 'QUARANTINE' || evt.ai_result?.recommendation === 'QUARANTINE';
    if (filterTag === 'BLOCKED') return evt.user_action === 'BLOCK' || evt.ai_result?.recommendation === 'BLOCK';
    if (filterTag === 'REVIEW') return evt.user_action === 'REVIEW' || evt.ai_result?.recommendation === 'REVIEW';

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. RECEIVER HOME: Status Banner & Security Overview */}
      <div className="cyber-card-green" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-green">
                <span className="live-dot" />
                CYBERSHIELD AI PROTECTION ACTIVE
              </span>
              <span className="badge badge-blue">
                RECEIVER PLATFORM SIMULATION
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Receiver Platform (Protected Multi-App Simulation)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '840px', marginTop: '4px', lineHeight: '1.5' }}>
              Controlled communication surface protected by CyberShield AI. Intercepts incoming messages, emails, social feeds, media, and files in real-time before they can harm the receiver.
            </p>
          </div>

          <button 
            onClick={loadEvents}
            className="btn btn-outline"
            style={{ fontSize: '0.78rem' }}
          >
            <RotateCcw size={14} /> Refresh Events
          </button>
        </div>
      </div>

      {/* Security Disclaimer Notice */}
      <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-green)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        <Shield size={16} color="var(--color-green)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Receiver Platform is a controlled simulation environment:</strong> Third-party applications are not accessed or controlled. All events are synthetic and processed within the CyberShield AI demonstration sandbox.
        </span>
      </div>

      {/* Aggregate Protection Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Received</span>
            <Layers size={16} color="var(--color-blue-light)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalEvents}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Intercepted by CyberShield</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Safe Events</span>
            <CheckCircle size={16} color="var(--color-green)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-green)' }}>{safeEvents}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Verified & Delivered</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Threats Blocked</span>
            <XCircle size={16} color="var(--color-danger)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-danger)' }}>{blockedEvents}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Neutralized automatically</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Under Review</span>
            <AlertTriangle size={16} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-warning)' }}>{reviewEvents}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Awaiting user agency</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quarantined</span>
            <Lock size={16} color="var(--color-danger)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-danger)' }}>{quarantinedEvents}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Isolated in vault</div>
        </div>
      </div>

      {/* Surface Selector Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '6px',
        background: 'rgba(12, 18, 30, 0.8)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        overflowX: 'auto'
      }}>
        {surfaces.map((s) => {
          const Icon = s.icon;
          const isActive = activeSurface === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSurface(s.id)}
              className={`btn ${isActive ? 'btn-primary-green' : 'btn-ghost'}`}
              style={{
                flex: '1',
                minWidth: '135px',
                fontSize: '0.78rem',
                padding: '7px 10px',
                justifyContent: 'center'
              }}
            >
              <Icon size={14} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Category Bar */}
      <div className="cyber-card" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Filter size={15} color="var(--color-green)" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Classification:</span>
          {['ALL', 'SAFE', 'SCAM', 'PHISHING', 'MANIPULATED', 'DEEPFAKE', 'QUARANTINED', 'REVIEW'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterTag(f)}
              className={`btn ${filterTag === f ? 'btn-accent-blue' : 'btn-outline'}`}
              style={{ padding: '3px 10px', fontSize: '0.72rem' }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing {filteredEvents.length} items
        </div>
      </div>

      {/* Main Content Area: Active Surface Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredEvents.length === 0 ? (
          <div className="cyber-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <ShieldCheck size={36} color="var(--color-green)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Receiver Surface Clean
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '6px auto 0 auto' }}>
              No incoming events currently match this filter. Open the <strong>Sender Platform</strong> to dispatch a new safe or attack simulation event.
            </p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isThreat = evt.ai_result?.classification !== 'SAFE';
            const isQuarantined = evt.user_action === 'QUARANTINE' || evt.user_action === 'BLOCK' || (evt.user_action !== 'ALLOW' && (evt.ai_result?.recommendation === 'QUARANTINE' || evt.ai_result?.recommendation === 'BLOCK'));
            const isReview = evt.user_action === 'REVIEW' || (evt.user_action !== 'ALLOW' && evt.ai_result?.recommendation === 'REVIEW');

            return (
              <div key={evt.event_id} className={`cyber-card ${isQuarantined ? 'cyber-card-danger' : isReview ? 'cyber-card-blue' : 'cyber-card-green'}`} style={{ padding: '20px' }}>
                {/* Event Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-blue-light)', fontWeight: 700 }}>
                        {evt.event_id}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>
                        {evt.content_type.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        From: <strong style={{ color: 'var(--text-primary)' }}>{evt.sender_id}</strong>
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Intercepted: {evt.timestamp} • Model: <code style={{ color: 'var(--color-blue-light)' }}>{evt.ai_result?.model || 'cyber_ai_engine'}</code>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${evt.ai_result?.risk_level === 'CRITICAL' ? 'badge-danger' : evt.ai_result?.risk_level === 'HIGH' ? 'badge-warning' : evt.ai_result?.risk_level === 'MEDIUM' ? 'badge-blue' : 'badge-green'}`} style={{ fontSize: '0.62rem' }}>
                      {evt.ai_result?.risk_level || 'LOW'} RISK ({Math.round((evt.ai_result?.confidence || 0.95) * 100)}%)
                    </span>
                    <span className={`badge ${isQuarantined ? 'badge-danger' : isReview ? 'badge-warning' : 'badge-green'}`} style={{ fontSize: '0.62rem' }}>
                      {isQuarantined ? 'QUARANTINED' : isReview ? 'UNDER REVIEW' : 'DELIVERED SAFE'}
                    </span>
                  </div>
                </div>

                {/* Simulated Content Body with CyberShield Protection Logic */}
                {isQuarantined ? (
                  /* 12. QUARANTINE SYSTEM VIEW */
                  <div style={{
                    padding: '14px 16px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                      <Lock size={15} /> CyberShield AI intercepted this event before delivery.
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Potential {evt.ai_result?.classification} threat isolated in quarantine vault to protect the receiver. Content masked for security.
                    </p>
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <strong>Forensic Reasons:</strong> {evt.ai_result?.reasons.join(' • ')}
                    </div>
                  </div>
                ) : isReview ? (
                  /* 13. REVIEW SYSTEM VIEW */
                  <div style={{
                    padding: '14px 16px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                      <AlertTriangle size={15} /> CyberShield AI requires user decision.
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', margin: '6px 0', fontFamily: 'var(--font-mono)' }}>
                      "{evt.content_preview}"
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <strong>Indicators:</strong> {evt.ai_result?.reasons.join(' • ')}
                    </div>
                  </div>
                ) : (
                  /* 14. SAFE EVENT DELIVERY VIEW */
                  <div style={{
                    padding: '14px 16px',
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-green)', fontWeight: 600, fontSize: '0.75rem', marginBottom: '6px' }}>
                      <CheckCircle size={14} /> Verified Safe by CyberShield AI
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                      {evt.content_preview}
                    </div>
                  </div>
                )}

                {/* User Agency & Decision Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setSelectedEventDetails(selectedEventDetails?.event_id === evt.event_id ? null : evt)}
                      className="btn btn-outline"
                      style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                    >
                      <Eye size={13} /> {selectedEventDetails?.event_id === evt.event_id ? 'Hide Details' : 'View Details'}
                    </button>

                    {isQuarantined && (
                      <button
                        onClick={() => handleAction(evt.event_id, 'ALLOW')}
                        className="btn btn-outline"
                        style={{ padding: '5px 12px', fontSize: '0.75rem', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--color-green)' }}
                      >
                        <CheckCircle size={13} /> Allow / Unquarantine
                      </button>
                    )}

                    {isReview && (
                      <>
                        <button
                          onClick={() => handleAction(evt.event_id, 'ALLOW')}
                          className="btn btn-outline"
                          style={{ padding: '5px 12px', fontSize: '0.75rem', color: 'var(--color-green)' }}
                        >
                          <CheckCircle size={13} /> Allow
                        </button>
                        <button
                          onClick={() => handleAction(evt.event_id, 'BLOCK')}
                          className="btn btn-outline"
                          style={{ padding: '5px 12px', fontSize: '0.75rem', color: 'var(--color-danger)' }}
                        >
                          <XCircle size={13} /> Block
                        </button>
                        <button
                          onClick={() => handleAction(evt.event_id, 'QUARANTINE')}
                          className="btn btn-outline"
                          style={{ padding: '5px 12px', fontSize: '0.75rem', color: 'var(--color-warning)' }}
                        >
                          <Lock size={13} /> Quarantine
                        </button>
                      </>
                    )}

                    {!isQuarantined && isThreat && (
                      <button
                        onClick={() => handleAction(evt.event_id, 'QUARANTINE')}
                        className="btn btn-outline"
                        style={{ padding: '5px 12px', fontSize: '0.75rem', color: 'var(--color-danger)' }}
                      >
                        <Lock size={13} /> Keep Quarantined
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(evt.event_id)}
                    className="btn btn-ghost"
                    style={{ padding: '5px 10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                    title="Delete simulated event"
                  >
                    <Trash2 size={13} /> Delete Simulation
                  </button>
                </div>

                {/* Deep Forensic Modal / Expandable View */}
                {selectedEventDetails?.event_id === evt.event_id && (
                  <div style={{ marginTop: '14px', padding: '14px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                      Detailed Forensic Analysis Report ({evt.event_id})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                      <div><strong>Modality:</strong> {evt.content_type}</div>
                      <div><strong>Sender Persona:</strong> {evt.sender_type}</div>
                      <div><strong>AI Detector:</strong> {evt.ai_result?.model}</div>
                      <div><strong>Inference Latency:</strong> {evt.ai_result?.processing_time_ms}ms</div>
                    </div>
                    <div>
                      <strong>Full Forensic Reasons:</strong>
                      <ul style={{ paddingLeft: '18px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                        {evt.ai_result?.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
