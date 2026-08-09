import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Wifi, 
  Battery 
} from 'lucide-react';
import { GatewayReceiverInboxItem } from '../types';
import { fetchReceiverInboxAPI, submitReceiverReviewActionAPI } from '../services/api';

export const ExternalReceiverApp: React.FC = () => {
  const [inbox, setInbox] = useState<GatewayReceiverInboxItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [usePhoneFrame, setUsePhoneFrame] = useState<boolean>(true);
  const [activeAlert, setActiveAlert] = useState<GatewayReceiverInboxItem | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const loadInbox = async () => {
    try {
      const items = await fetchReceiverInboxAPI();
      setInbox(items);
      if (items.length > 0 && !activeAlert) {
        // Show recent item as pop-up notification for realistic feel
        setActiveAlert(items[0]);
      }
    } catch (e) {
      console.warn('Receiver inbox load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInbox();
    const interval = setInterval(loadInbox, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleReviewAction = async (eventId: string, action: 'ALLOW' | 'BLOCK') => {
    try {
      await submitReceiverReviewActionAPI(eventId, action);
      await loadInbox();
    } catch (e) {
      console.warn('Failed to submit review action:', e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. App Header */}
      <div className="cyber-card-green" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-blue">
                <span className="live-dot" />
                SEPARATE RECEIVER MOBILE CLIENT
              </span>
              <span className="badge badge-green">
                ZERO-TRUST PROTECTED ENDPOINT
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              CyberShield External Receiver Mobile Application
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '840px', marginTop: '4px', lineHeight: '1.5' }}>
              Simulates a protected mobile endpoint receiving communications filtered through the <strong>CyberShield Core Gateway</strong>. Safe content arrives directly into the user inbox; malicious scams & phishing attacks are automatically intercepted and quarantined with forensic explanation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setUsePhoneFrame(!usePhoneFrame)}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem' }}
            >
              <Smartphone size={14} /> {usePhoneFrame ? 'Switch to Full Screen View' : 'Switch to Smartphone Bezel Frame'}
            </button>
            <button
              onClick={() => { setRefreshing(true); loadInbox(); }}
              disabled={refreshing}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem' }}
            >
              <RotateCcw size={14} className={refreshing ? 'spin' : ''} /> Refresh Inbox
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Viewport */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{
          width: '100%',
          maxWidth: usePhoneFrame ? '420px' : '900px',
          background: usePhoneFrame ? '#0f172a' : 'transparent',
          borderRadius: usePhoneFrame ? '36px' : 'var(--radius-lg)',
          border: usePhoneFrame ? '8px solid #1e293b' : 'none',
          boxShadow: usePhoneFrame ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 20px rgba(16, 185, 129, 0.15)' : 'none',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Simulated Mobile Status Bar (when phone frame active) */}
          {usePhoneFrame && (
            <div style={{
              padding: '12px 18px 8px 18px',
              background: '#090d16',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>9:41</span>
              <div style={{
                width: '90px',
                height: '18px',
                background: '#020617',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-green)' }} />
                <span style={{ fontSize: '0.6rem', color: 'var(--color-green)', fontWeight: 700 }}>SHIELD ON</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wifi size={13} />
                <Battery size={14} />
              </div>
            </div>
          )}

          {/* Device Security Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CyberShield Mobile Guard v1.0
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Protected Device Inbox
              </div>
            </div>
            <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
              GATEWAY SYNCED
            </span>
          </div>

          {/* Floating Mobile Push Alert Banner */}
          {activeAlert && (
            <div style={{
              margin: '12px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: activeAlert.delivery_state === 'NORMAL_MESSAGE' 
                ? 'rgba(16, 185, 129, 0.95)' 
                : activeAlert.delivery_state === 'CYBERSHIELD_SECURITY_WARNING' 
                ? 'rgba(239, 68, 68, 0.95)' 
                : 'rgba(245, 158, 11, 0.95)',
              color: '#ffffff',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem' }}>
                {activeAlert.delivery_state === 'NORMAL_MESSAGE' ? (
                  <CheckCircle size={18} color="#ffffff" />
                ) : (
                  <ShieldAlert size={18} color="#ffffff" />
                )}
                <div>
                  <div style={{ fontWeight: 800 }}>
                    {activeAlert.delivery_state === 'NORMAL_MESSAGE' 
                      ? 'New Message Received' 
                      : `Threat Intercepted: ${activeAlert.security_decision}`}
                  </div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.9, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeAlert.sender_id}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveAlert(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Message Thread Feed */}
          <div style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            maxHeight: usePhoneFrame ? '540px' : 'none',
            overflowY: 'auto'
          }}>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Connecting to CyberShield Gateway...
              </div>
            ) : inbox.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No messages yet. Send a test message from the External Sender App.
              </div>
            ) : (
              inbox.map((item) => {
                const isSafe = item.delivery_state === 'NORMAL_MESSAGE';
                const isThreat = item.delivery_state === 'CYBERSHIELD_SECURITY_WARNING';
                const isReview = item.delivery_state === 'PENDING_REVIEW';
                const isExpanded = expandedEventId === item.event_id;

                return (
                  <div 
                    key={item.event_id}
                    className="cyber-card"
                    style={{
                      padding: '14px',
                      background: isThreat ? 'rgba(239, 68, 68, 0.06)' : isReview ? 'rgba(245, 158, 11, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                      borderLeft: isThreat ? '4px solid var(--color-danger)' : isReview ? '4px solid var(--color-warning)' : '4px solid var(--color-green)'
                    }}
                  >
                    {/* Item Top Line */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.sender_id}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {item.event_id} • {item.content_type.toUpperCase()}
                        </div>
                      </div>

                      <span className={`badge ${isSafe ? 'badge-green' : isThreat ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.6rem' }}>
                        {item.security_decision}
                      </span>
                    </div>

                    {/* Safe Normal Message Body */}
                    {isSafe && (
                      <div style={{ padding: '8px 10px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                        "{item.content_preview}"
                      </div>
                    )}

                    {/* Threat Intercepted Shield Banner */}
                    {isThreat && (
                      <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.12)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.35)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontWeight: 800, fontSize: '0.75rem', marginBottom: '4px' }}>
                          <ShieldAlert size={15} /> CONTENT INTERCEPTED BY CYBERSHIELD AI
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          A high-confidence threat (Risk Score: <strong>{item.risk_score}/100</strong>) was isolated in the quarantine vault to prevent malware/phishing compromise.
                        </div>

                        {item.interception_reasons.length > 0 && (
                          <div style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--color-danger)' }}>
                            <strong>Interception Reason:</strong> {item.interception_reasons[0]}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pending Review Item */}
                    {isReview && (
                      <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.12)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-warning)', fontWeight: 800, fontSize: '0.75rem', marginBottom: '4px' }}>
                          <AlertTriangle size={15} /> PENDING USER SECURITY REVIEW
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          "{item.content_preview}"
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleReviewAction(item.event_id, 'ALLOW')}
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '0.7rem', color: 'var(--color-green)', borderColor: 'var(--border-green)' }}
                          >
                            ✓ Allow Once
                          </button>
                          <button
                            onClick={() => handleReviewAction(item.event_id, 'BLOCK')}
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '0.7rem', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                          >
                            ✕ Block Threat
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expandable Forensic Details */}
                    {item.interception_reasons.length > 1 && (
                      <div style={{ marginTop: '8px' }}>
                        <button
                          onClick={() => setExpandedEventId(isExpanded ? null : item.event_id)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-blue-light)', fontSize: '0.68rem', cursor: 'pointer', padding: 0 }}
                        >
                          {isExpanded ? 'Hide Forensics ▲' : 'View Full Forensic Breakdown ▼'}
                        </button>

                        {isExpanded && (
                          <ul style={{ margin: '4px 0 0 14px', padding: 0, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {item.interception_reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
