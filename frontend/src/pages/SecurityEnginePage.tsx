import React from 'react';
import { ShieldCheck, AlertTriangle, CheckSquare, XCircle, RotateCcw, Activity } from 'lucide-react';

export const SecurityEnginePage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-cyan">PLATFORM 3</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>CyberShield AI Security Platform</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Central threat detection engine: Model Router, Risk Engine, Explainable AI, Instant Notification Dispatcher, and Block / Review / Allow Decision System.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Real-time Pipeline Visualizer */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--color-cyan)" />
            Real-Time AI Pipeline Workflow
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
              1. Incoming Security Event Interception
            </div>
            <div style={{ padding: '10px', background: 'rgba(0, 240, 255, 0.05)', borderRadius: '6px' }}>
              2. Content Type Detection & Model Router
            </div>
            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '6px' }}>
              3. AI Model Inference (Confidence & Classification)
            </div>
            <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '6px' }}>
              4. Risk Engine (CRITICAL / HIGH / MEDIUM / LOW)
            </div>
            <div style={{ padding: '10px', background: 'rgba(168, 85, 247, 0.08)', borderRadius: '6px' }}>
              5. Explainable AI (Reasons + Recommendations)
            </div>
            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
              6. Immediate User Notification with Action Dialog
            </div>
          </div>
        </div>

        {/* User Decision Actions */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--color-safe)" />
            User Decision & Quarantine Subsystem
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--color-danger)', fontSize: '0.85rem' }}>
                <XCircle size={16} /> [ BLOCK ] Action
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Content is isolated in Quarantine. Hidden from receiver view and logged in history.
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--color-warning)', fontSize: '0.85rem' }}>
                <AlertTriangle size={16} /> [ REVIEW ] Action
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Displays deep forensic breakdown, indicators, and model confidence before final choice.
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--color-safe)', fontSize: '0.85rem' }}>
                <CheckSquare size={16} /> [ ALLOW ] Action
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Delivers content. Records intentional user risk acceptance in audit log.
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(0, 240, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--color-cyan)', fontSize: '0.85rem' }}>
                <RotateCcw size={16} /> [ UNBLOCK ] Subsystem
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Allows unblocking quarantined threats after explicit secondary user confirmation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
