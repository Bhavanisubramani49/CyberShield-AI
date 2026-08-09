import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  Lock, 
  RotateCcw, 
  CheckCheck, 
  Trash2, 
  Eye, 
  Clock, 
  Radio, 
  Cpu
} from 'lucide-react';
import { SecurityNotification, NotificationUnreadStats, SecurityAction, SecurityEvent } from '../types';
import { 
  fetchNotificationsAPI, 
  fetchUnreadNotificationStatsAPI, 
  markNotificationReadAPI, 
  markAllNotificationsReadAPI, 
  deleteNotificationAPI,
  updateEventActionAPI,
  fetchEventsAPI
} from '../services/api';

interface NotificationsPageProps {
  onOpenForensicEvent?: (eventId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = () => {
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [unreadStats, setUnreadStats] = useState<NotificationUnreadStats>({
    unread_count: 0,
    critical_count: 0,
    high_risk_count: 0,
    review_count: 0,
    total_count: 0
  });
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedForensicEvent, setSelectedForensicEvent] = useState<SecurityEvent | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3500);
    return () => clearInterval(interval);
  }, [filterSeverity]);

  const loadData = async () => {
    try {
      const [notifs, stats] = await Promise.all([
        fetchNotificationsAPI({ severity: filterSeverity }),
        fetchUnreadNotificationStatsAPI()
      ]);
      setNotifications(notifs);
      setUnreadStats(stats);
    } catch (e) {
      console.warn('Notification load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notifId: string, isRead: boolean) => {
    await markNotificationReadAPI(notifId, isRead);
    setNotifications(prev => prev.map(n => n.notification_id === notifId ? { ...n, is_read: isRead } : n));
    setUnreadStats(prev => ({
      ...prev,
      unread_count: Math.max(0, prev.unread_count + (isRead ? -1 : 1))
    }));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadAPI();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadStats(prev => ({ ...prev, unread_count: 0, critical_count: 0, high_risk_count: 0, review_count: 0 }));
  };

  const handleDeleteNotif = async (notifId: string) => {
    await deleteNotificationAPI(notifId);
    setNotifications(prev => prev.filter(n => n.notification_id !== notifId));
  };

  const handleAction = async (eventId: string, action: SecurityAction, notifId: string) => {
    await updateEventActionAPI(eventId, action);
    await markNotificationReadAPI(notifId, true);
    setNotifications(prev => prev.map(n => n.notification_id === notifId ? { ...n, action, is_read: true } : n));
    if (selectedForensicEvent?.event_id === eventId) {
      setSelectedForensicEvent(prev => prev ? { ...prev, user_action: action, final_action: action } : null);
    }
  };

  const openForensics = async (eventId: string) => {
    try {
      const allEvents = await fetchEventsAPI();
      const match = allEvents.find(e => e.event_id === eventId);
      if (match) {
        setSelectedForensicEvent(match);
      }
    } catch (e) {
      console.warn('Failed to load event forensics:', e);
    }
  };

  const filteredNotifications = filterSeverity === 'ALL'
    ? notifications
    : filterSeverity === 'UNREAD'
      ? notifications.filter(n => !n.is_read)
      : notifications.filter(n => n.severity === filterSeverity);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Banner & Real-Time Alert Center Overview */}
      <div className="cyber-card-green" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-green">
                <span className="live-dot" />
                REAL-TIME SECURITY ALERT CENTER
              </span>
              <span className={`badge ${unreadStats.critical_count > 0 ? 'badge-danger' : 'badge-blue'}`}>
                {unreadStats.unread_count} UNREAD ALERTS
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Security Notifications & Incident Response Hub
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '820px', marginTop: '4px', lineHeight: '1.5' }}>
              Instant notifications dispatched from the CyberShield AI detection pipeline upon threat detection across all 8 modalities. Execute immediate containment actions (Block, Quarantine, Review, or Allow).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleMarkAllRead}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem' }}
            >
              <CheckCheck size={14} /> Mark All as Read
            </button>
            <button 
              onClick={loadData}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem' }}
            >
              <RotateCcw size={14} /> Refresh Alerts
            </button>
          </div>
        </div>
      </div>

      {/* 2. Unread & Severity Overview Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Unread Alerts</span>
            <Bell size={15} color="var(--color-blue-light)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: unreadStats.unread_count > 0 ? 'var(--color-warning)' : 'var(--text-primary)' }}>
            {unreadStats.unread_count}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Pending Officer Attention</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Critical Threats</span>
            <AlertTriangle size={15} color="var(--color-danger)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-danger)' }}>
            {unreadStats.critical_count}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Urgent Action Recommended</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>High-Risk Alerts</span>
            <Radio size={15} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-warning)' }}>
            {unreadStats.high_risk_count}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Score 60-84 Indicators</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Review Requests</span>
            <Lock size={15} color="var(--color-blue-light)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-blue-light)' }}>
            {unreadStats.review_count}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Awaiting User Consent</div>
        </div>
      </div>

      {/* 3. Severity Filter Tabs */}
      <div className="cyber-card" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Severity:</span>
          {[
            { id: 'ALL', label: 'All Alerts' },
            { id: 'UNREAD', label: `Unread (${unreadStats.unread_count})` },
            { id: 'CRITICAL', label: 'Critical' },
            { id: 'HIGH_RISK', label: 'High-Risk' },
            { id: 'REVIEW', label: 'Review' },
            { id: 'INFO', label: 'Safe / Info' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterSeverity(tab.id)}
              className={`btn ${filterSeverity === tab.id ? 'btn-accent-blue' : 'btn-outline'}`}
              style={{ padding: '4px 12px', fontSize: '0.72rem', minHeight: '36px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing {filteredNotifications.length} alerts
        </div>
      </div>

      {/* 4. Notification Alert Cards Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Loading live security alerts from SQLite repository...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="cyber-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <CheckCircle size={36} color="var(--color-green)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              No Active Security Alerts
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '4px auto 0 auto' }}>
              Your notification queue is completely clear. Any simulated attacks or suspicious events dispatched in the <strong>Sender Platform</strong> will appear here in real time.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isCrit = notif.severity === 'CRITICAL';
            const isHigh = notif.severity === 'HIGH_RISK';
            const isRev = notif.severity === 'REVIEW';
            const isUnread = !notif.is_read;

            return (
              <div 
                key={notif.notification_id} 
                className={`cyber-card ${isCrit ? 'cyber-card-danger' : isHigh ? 'cyber-card-warning' : isRev ? 'cyber-card-blue' : 'cyber-card-green'}`}
                style={{ 
                  padding: '18px 20px',
                  position: 'relative',
                  borderLeft: isCrit ? '4px solid var(--color-danger)' : isHigh ? '4px solid var(--color-warning)' : isRev ? '4px solid var(--color-blue)' : '4px solid var(--color-green)',
                  background: isUnread ? 'rgba(255, 255, 255, 0.035)' : 'var(--bg-card)'
                }}
              >
                {/* Top Notification Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {notif.title}
                    </span>
                    <span className={`badge ${isCrit ? 'badge-danger' : isHigh ? 'badge-warning' : isRev ? 'badge-blue' : 'badge-green'}`} style={{ fontSize: '0.6rem' }}>
                      {notif.severity} ({notif.risk_score}/100)
                    </span>
                    {isUnread && (
                      <span className="badge badge-danger" style={{ fontSize: '0.55rem', padding: '1px 5px' }}>
                        NEW
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {notif.created_at ? notif.created_at.slice(11, 19) : 'Just now'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-blue-light)', fontWeight: 600 }}>
                      {notif.event_id}
                    </span>
                  </div>
                </div>

                {/* Notification Content Preview */}
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: '4px 0 12px 0' }}>
                  {notif.message}
                </p>

                {/* Action Buttons & Forensic Drawer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {isCrit || isHigh ? (
                      <>
                        <button
                          onClick={() => handleAction(notif.event_id, 'BLOCK', notif.notification_id)}
                          className="btn btn-primary-green"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                        >
                          <XCircle size={13} /> Block Threat
                        </button>
                        <button
                          onClick={() => handleAction(notif.event_id, 'QUARANTINE', notif.notification_id)}
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--color-warning)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                        >
                          <Lock size={13} /> Quarantine in Vault
                        </button>
                      </>
                    ) : isRev ? (
                      <>
                        <button
                          onClick={() => handleAction(notif.event_id, 'ALLOW', notif.notification_id)}
                          className="btn btn-primary-green"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          <CheckCircle size={13} /> Allow Content
                        </button>
                        <button
                          onClick={() => handleAction(notif.event_id, 'BLOCK', notif.notification_id)}
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--color-danger)' }}
                        >
                          <XCircle size={13} /> Block
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAction(notif.event_id, 'ALLOW', notif.notification_id)}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--color-green)' }}
                      >
                        <CheckCircle size={13} /> Verified Safe
                      </button>
                    )}

                    <button
                      onClick={() => openForensics(notif.event_id)}
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      <Eye size={13} /> View Forensic Details
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleMarkRead(notif.notification_id, !notif.is_read)}
                      className="btn btn-ghost"
                      style={{ padding: '5px 8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}
                    >
                      {notif.is_read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      onClick={() => handleDeleteNotif(notif.notification_id)}
                      className="btn btn-ghost"
                      style={{ padding: '5px 8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}
                      title="Remove notification"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Deep Forensic Modal */}
      {selectedForensicEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-modal-overlay)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000,
          backdropFilter: 'blur(6px)'
        }}>
          <div className="cyber-card" style={{
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
                  FORENSIC REPORT CORRELATION
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  Event: {selectedForensicEvent.event_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedForensicEvent(null)}
                className="btn btn-ghost"
                style={{ fontSize: '0.85rem' }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Simulated Ingested Content:</span>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                "{selectedForensicEvent.content_preview}"
              </div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={15} /> AI Classification & Explainable Reasons
                </span>
                <span className={`badge ${selectedForensicEvent.ai_result?.risk_level === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`}>
                  {selectedForensicEvent.ai_result?.risk_level || 'LOW'} ({selectedForensicEvent.ai_result?.risk_score ?? 15}/100)
                </span>
              </div>
              <ul style={{ paddingLeft: '18px', margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {(selectedForensicEvent.ai_result?.reasons || selectedForensicEvent.forensic_reasons || ['Baseline verified communication pattern']).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {selectedForensicEvent.timeline && (
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Clock size={14} color="var(--color-blue-light)" /> Processing Milestones
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedForensicEvent.timeline.map((step, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      <span><strong>{step.step}:</strong> {step.detail}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{step.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
