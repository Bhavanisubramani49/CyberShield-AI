import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  RotateCcw, 
  Eye, 
  Cpu, 
  ArrowRight, 
  Zap, 
  Server, 
  Radio, 
  Shield
} from 'lucide-react';
import { SecurityEvent, EventStats, SecurityAction } from '../types';
import { fetchEventsAPI, fetchEventStatsAPI, updateEventActionAPI } from '../services/api';

export const MonitorPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [modalityFilter, setModalityFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3500);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const [evts, st] = await Promise.all([
      fetchEventsAPI(),
      fetchEventStatsAPI()
    ]);
    setEvents(evts);
    setStats(st);
  };

  const handleAction = async (eventId: string, action: SecurityAction) => {
    await updateEventActionAPI(eventId, action);
    await loadData();
    if (selectedEvent?.event_id === eventId) {
      setSelectedEvent(prev => prev ? { ...prev, user_action: action, final_action: action } : null);
    }
  };

  const filteredEvents = events.filter(evt => {
    // 1. Modality Filter
    if (modalityFilter !== 'ALL') {
      if (evt.content_type.toLowerCase() !== modalityFilter.toLowerCase()) return false;
    }
    // 2. Risk Filter
    if (riskFilter !== 'ALL') {
      const rLevel = evt.risk_level || evt.ai_result?.risk_level;
      if (rLevel !== riskFilter) return false;
    }
    // 3. Action Filter
    if (actionFilter !== 'ALL') {
      const act = evt.user_action || evt.final_action || evt.ai_result?.recommendation;
      if (act !== actionFilter) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Banner & Live Pipeline Indicator */}
      <div className="cyber-card-green" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-green">
                <span className="live-dot" />
                EVENT BUS ONLINE
              </span>
              <span className="badge badge-blue">
                REAL-TIME TELEMETRY ENGINE
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Communication Monitor & Event Pipeline
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '820px', marginTop: '4px', lineHeight: '1.5' }}>
              Centralized CyberShield AI Event Dispatcher managing end-to-end event ingestion, AI model routing, standardized risk scoring, automated quarantine decisions, and Receiver Platform delivery.
            </p>
          </div>

          <button 
            onClick={loadData}
            className="btn btn-outline"
            style={{ fontSize: '0.78rem' }}
          >
            <RotateCcw size={14} /> Refresh Stream
          </button>
        </div>
      </div>

      {/* Security Disclaimer Notice */}
      <div style={{ padding: '10px 14px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        <Shield size={16} color="var(--color-blue-light)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Simulated Event Pipeline:</strong> All communications flow strictly inside the CyberShield AI sandboxed event engine between the Sender and Receiver platforms.
        </span>
      </div>

      {/* 2. SECTION A: Real-Time Event Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Events</span>
            <Layers size={15} color="var(--color-blue-light)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats?.total_events || events.length}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Ingested by Event Bus</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Safe Events</span>
            <CheckCircle size={15} color="var(--color-green)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-green)' }}>
            {stats?.safe_events || events.filter(e => e.classification === 'SAFE' || e.user_action === 'ALLOW').length}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Verified & Allowed</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Threats Detected</span>
            <XCircle size={15} color="var(--color-danger)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-danger)' }}>
            {stats?.threats_detected || events.filter(e => e.classification !== 'SAFE').length}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Flagged by AI Models</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quarantined</span>
            <Lock size={15} color="var(--color-danger)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-danger)' }}>
            {stats?.quarantined || events.filter(e => e.user_action === 'QUARANTINE' || e.recommended_action === 'QUARANTINE').length}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Masked in Vault</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Under Review</span>
            <AlertTriangle size={15} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-warning)' }}>
            {stats?.under_review || events.filter(e => e.user_action === 'REVIEW' || e.recommended_action === 'REVIEW').length}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Awaiting Decision</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Latency</span>
            <Cpu size={15} color="var(--color-green)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-blue-light)' }}>
            {stats?.avg_latency_ms || 22.4}ms
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Inference + Dispatch</div>
        </div>
      </div>

      {/* 3. SECTION C: Central Event Processing Pipeline Visualizer */}
      <div className="cyber-card" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={16} color="var(--color-green)" />
          Central CyberShield AI Event Processing Pipeline
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          position: 'relative'
        }}>
          {[
            { step: '1. CREATED', desc: 'Sender Platform', icon: Zap, status: 'DONE' },
            { step: '2. RECEIVED', desc: 'Event Bus Ingestion', icon: Radio, status: 'DONE' },
            { step: '3. ANALYZING', desc: '8-Model AI Router', icon: Cpu, status: 'DONE' },
            { step: '4. ANALYZED', desc: 'Risk Score (0-100)', icon: Activity, status: 'DONE' },
            { step: '5. DECISION', desc: 'ALLOW / QUARANTINE', icon: ShieldCheck, status: 'DONE' },
            { step: '6. RECEIVER', desc: 'Protected Surface', icon: ArrowRight, status: 'DONE' },
          ].map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                style={{
                  padding: '12px 10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-green)', marginBottom: '2px' }}>
                  <Icon size={14} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{st.step}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{st.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SECTION B & D: Live Event Activity Stream & Filterable Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Live Event Stream Panel */}
        <div className="cyber-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={16} color="var(--color-green)" />
              Live Security Event Stream
            </h3>
            <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>
              <span className="live-dot" /> STREAM ACTIVE
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
            {events.slice(0, 8).map((evt) => {
              const isCrit = evt.risk_level === 'CRITICAL' || evt.ai_result?.risk_level === 'CRITICAL';
              const isHigh = evt.risk_level === 'HIGH' || evt.ai_result?.risk_level === 'HIGH';
              const isSafe = evt.classification === 'SAFE' || evt.user_action === 'ALLOW';

              return (
                <div
                  key={evt.event_id}
                  onClick={() => setSelectedEvent(evt)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: selectedEvent?.event_id === evt.event_id ? '1px solid var(--color-green)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-blue-light)' }}>
                        {evt.event_id}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.55rem' }}>
                        {evt.content_type}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        [{evt.timestamp.split(' ')[0]}]
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {evt.content_preview}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${isCrit ? 'badge-danger' : isHigh ? 'badge-warning' : isSafe ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '0.58rem' }}>
                      {evt.classification || 'ANALYZED'}
                    </span>
                    <div style={{ fontSize: '0.62rem', color: isCrit ? 'var(--color-danger)' : 'var(--color-green)', marginTop: '2px' }}>
                      {evt.user_action || evt.recommended_action || 'ALLOW'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Event Details & Processing Timeline Panel */}
        <div className="cyber-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={16} color="var(--color-blue-light)" />
            Security Event Forensic Detail
          </h3>

          {selectedEvent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Event Header */}
              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-blue-light)', fontWeight: 800 }}>
                    {selectedEvent.event_id}
                  </span>
                  <span className={`badge ${selectedEvent.risk_level === 'CRITICAL' ? 'badge-danger' : selectedEvent.risk_level === 'HIGH' ? 'badge-warning' : 'badge-green'}`} style={{ fontSize: '0.62rem' }}>
                    {selectedEvent.risk_level || 'LOW'} RISK ({selectedEvent.risk_score || 15}/100)
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <strong>Sender:</strong> {selectedEvent.sender_id} ({selectedEvent.sender_type})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  <strong>AI Model:</strong> <code style={{ color: 'var(--color-green)' }}>{selectedEvent.ai_model || selectedEvent.ai_result?.model}</code>
                </div>
              </div>

              {/* Content Preview */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Simulated Content Payload:
                </div>
                <div style={{ padding: '10px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  "{selectedEvent.content_preview}"
                </div>
              </div>

              {/* Forensic Reasons */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Explainable AI Indicators:
                </div>
                <ul style={{ paddingLeft: '16px', fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(selectedEvent.forensic_reasons || selectedEvent.ai_result?.reasons || ['Zero threat indicators']).map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* 6. Processing Timeline Milestones */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Processing Lifecycle Timeline:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(selectedEvent.timeline && selectedEvent.timeline.length > 0 ? selectedEvent.timeline : [
                    { step: 'Event Created', timestamp: '10:42:11', detail: 'Dispatched via Sender' },
                    { step: 'Event Received', timestamp: '10:42:12', detail: 'Ingested into Event Bus' },
                    { step: 'AI Analysis Completed', timestamp: '10:42:13', detail: `Classified as ${selectedEvent.classification}` },
                    { step: 'Receiver Routed', timestamp: '10:42:13', detail: `Destination: ${selectedEvent.receiver_surface || 'Messages'}` }
                  ]).map((tl, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--color-green)' }}>✓</span>
                      <strong style={{ color: 'var(--text-primary)', minWidth: '130px' }}>{tl.step}</strong>
                      <span style={{ color: 'var(--color-blue-light)', fontFamily: 'var(--font-mono)' }}>{tl.timestamp}</span>
                      {tl.detail && <span style={{ color: 'var(--text-muted)' }}>({tl.detail})</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Decision Controls */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => handleAction(selectedEvent.event_id, 'ALLOW')}
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--color-green)' }}
                >
                  <CheckCircle size={13} /> Allow
                </button>
                <button
                  onClick={() => handleAction(selectedEvent.event_id, 'BLOCK')}
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--color-danger)' }}
                >
                  <XCircle size={13} /> Block
                </button>
                <button
                  onClick={() => handleAction(selectedEvent.event_id, 'QUARANTINE')}
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--color-warning)' }}
                >
                  <Lock size={13} /> Quarantine
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Activity size={32} color="var(--color-blue-light)" style={{ margin: '0 auto 10px auto' }} />
              <div>Select any event from the stream or table to inspect deep forensic indicators and lifecycle timeline.</div>
            </div>
          )}
        </div>
      </div>

      {/* 5. SECTION D: Recent Events Interactive Table with 3-Way Filters */}
      <div className="cyber-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--color-blue-light)" />
            Recent Security Events Audit Table
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Filter size={14} color="var(--color-green)" />
            
            {/* Modality Filter */}
            <select 
              value={modalityFilter} 
              onChange={(e) => setModalityFilter(e.target.value)}
              className="cyber-input"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.72rem' }}
            >
              <option value="ALL">All Modalities</option>
              <option value="message">Message / SMS</option>
              <option value="email">Email</option>
              <option value="url">URLs & Links</option>
              <option value="news">News Article</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="profile">User Profile</option>
              <option value="file">File Attachment</option>
            </select>

            {/* Risk Filter */}
            <select 
              value={riskFilter} 
              onChange={(e) => setRiskFilter(e.target.value)}
              className="cyber-input"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.72rem' }}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>

            {/* Action Filter */}
            <select 
              value={actionFilter} 
              onChange={(e) => setActionFilter(e.target.value)}
              className="cyber-input"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.72rem' }}
            >
              <option value="ALL">All Decisions</option>
              <option value="ALLOW">Allowed</option>
              <option value="REVIEW">Under Review</option>
              <option value="BLOCK">Blocked</option>
              <option value="QUARANTINE">Quarantined</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 8px' }}>Event ID</th>
                <th style={{ padding: '10px 8px' }}>Modality</th>
                <th style={{ padding: '10px 8px' }}>Sender</th>
                <th style={{ padding: '10px 8px' }}>AI Detector</th>
                <th style={{ padding: '10px 8px' }}>Classification</th>
                <th style={{ padding: '10px 8px' }}>Risk</th>
                <th style={{ padding: '10px 8px' }}>Decision</th>
                <th style={{ padding: '10px 8px' }}>Time</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((evt) => {
                const isCrit = evt.risk_level === 'CRITICAL' || evt.ai_result?.risk_level === 'CRITICAL';
                const isHigh = evt.risk_level === 'HIGH' || evt.ai_result?.risk_level === 'HIGH';
                const isSafe = evt.classification === 'SAFE' || evt.user_action === 'ALLOW';

                return (
                  <tr key={evt.event_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', color: 'var(--color-blue-light)', fontWeight: 700 }}>
                      {evt.event_id}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.6rem' }}>
                        {evt.content_type}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-primary)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {evt.sender_id}
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                      {evt.ai_model || evt.ai_result?.model}
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: 600, color: isSafe ? 'var(--color-green)' : 'var(--color-danger)' }}>
                      {evt.classification || 'ANALYZED'}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className={`badge ${isCrit ? 'badge-danger' : isHigh ? 'badge-warning' : isSafe ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '0.58rem' }}>
                        {evt.risk_level || 'LOW'} ({evt.risk_score || 15}%)
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className={`badge ${evt.user_action === 'QUARANTINE' ? 'badge-danger' : evt.user_action === 'REVIEW' ? 'badge-warning' : 'badge-green'}`} style={{ fontSize: '0.58rem' }}>
                        {evt.user_action || evt.recommended_action || 'ALLOW'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>
                      {evt.timestamp}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="btn btn-outline"
                        style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
