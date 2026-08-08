import React from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  CheckSquare, 
  Layers, 
  BarChart3
} from 'lucide-react';
import { SystemHealth } from '../types';

interface DashboardPageProps {
  health: SystemHealth | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ health }) => {
  const platformStats = [
    { platform: 'Messages & SMS', received: 250, threats: 17, blocked: 12, allowed: 3, review: 2 },
    { platform: 'Email Client', received: 120, threats: 8, blocked: 7, allowed: 1, review: 0 },
    { platform: 'Web & URLs', received: 480, threats: 24, blocked: 22, allowed: 1, review: 1 },
    { platform: 'Media & Images', received: 80, threats: 6, blocked: 4, allowed: 2, review: 0 },
    { platform: 'Videos', received: 45, threats: 3, blocked: 3, allowed: 0, review: 0 },
    { platform: 'News Feed', received: 190, threats: 9, blocked: 5, allowed: 2, review: 2 },
    { platform: 'Social Profiles', received: 140, threats: 5, blocked: 4, allowed: 1, review: 0 },
    { platform: 'File Sharing', received: 115, threats: 2, blocked: 2, allowed: 0, review: 0 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cyber-card-blue" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-blue">METRICS & ANALYTICS</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
            Unified Security Dashboard
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
          Real-time security analytics and telemetry across all 8 monitored communication channels in the CyberShield ecosystem.
        </p>
      </div>

      {/* Aggregate Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="cyber-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Monitored</span>
            <Layers size={16} color="var(--color-blue-light)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>1,420</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-green)' }}>+14.2% activity rate</div>
        </div>

        <div className="cyber-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Threats Blocked</span>
            <XCircle size={16} color="var(--color-danger)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-danger)' }}>59</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quarantined instantly</div>
        </div>

        <div className="cyber-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Under Review</span>
            <AlertTriangle size={16} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-warning)' }}>5</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pending user decision</div>
        </div>

        <div className="cyber-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>User Allowed</span>
            <CheckSquare size={16} color="var(--color-green)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-green)' }}>10</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Explicit user consent</div>
        </div>
      </div>

      {/* Platform Activity Table */}
      <div className="cyber-card" style={{ padding: '22px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} color="var(--color-blue-light)" />
            Channel Breakdown & Threat Distribution
          </h3>
          <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
            {health?.active_ai_models.length || 8} Active Channels
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px' }}>Channel / Modality</th>
              <th style={{ padding: '10px 12px' }}>Total Received</th>
              <th style={{ padding: '10px 12px' }}>Threats Detected</th>
              <th style={{ padding: '10px 12px' }}>Blocked</th>
              <th style={{ padding: '10px 12px' }}>Allowed</th>
              <th style={{ padding: '10px 12px' }}>Under Review</th>
            </tr>
          </thead>
          <tbody>
            {platformStats.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: '#ffffff' }}>{row.platform}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.received}</td>
                <td style={{ padding: '12px', color: row.threats > 0 ? 'var(--color-warning)' : 'var(--color-green)', fontWeight: 600 }}>
                  {row.threats}
                </td>
                <td style={{ padding: '12px', color: 'var(--color-danger)' }}>{row.blocked}</td>
                <td style={{ padding: '12px', color: 'var(--color-green)' }}>{row.allowed}</td>
                <td style={{ padding: '12px', color: 'var(--color-warning)' }}>{row.review}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
