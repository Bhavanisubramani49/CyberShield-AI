import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { ThreatClassification, RiskLevel, SecurityAction } from '../types';

export const HistoryPage: React.FC = () => {
  const [selectedFilter, setFilter] = useState<string>('ALL');

  const historyEntries = [
    {
      id: 'EVT-9041',
      time: '10:42:15 AM',
      channel: 'Messages / SMS',
      sender: 'Simulated Attacker (+91 98400 12345)',
      threat: 'SCAM' as ThreatClassification,
      risk: 'CRITICAL' as RiskLevel,
      action: 'BLOCK' as SecurityAction,
      preview: 'Congratulations! You won ₹10,00,000. Click this link immediately.',
      reasons: ['Lottery prize claim', 'Urgent call-to-action', 'Unverified link']
    },
    {
      id: 'EVT-9038',
      time: '10:38:02 AM',
      channel: 'Email Client',
      sender: 'fake-security@bank-verify.net',
      threat: 'PHISHING' as ThreatClassification,
      risk: 'HIGH' as RiskLevel,
      action: 'BLOCK' as SecurityAction,
      preview: 'Your bank account will be suspended. Verify your credentials now.',
      reasons: ['Credential harvesting', 'Urgency language', 'Deceptive domain']
    },
    {
      id: 'EVT-9025',
      time: '10:25:40 AM',
      channel: 'Messages / SMS',
      sender: 'Normal User (Alice)',
      threat: 'SAFE' as ThreatClassification,
      risk: 'LOW' as RiskLevel,
      action: 'ALLOW' as SecurityAction,
      preview: 'Hi! Are you ready for our project presentation tomorrow?',
      reasons: ['Standard conversational linguistic profile', 'No suspicious URLs']
    },
    {
      id: 'EVT-9011',
      time: '10:11:18 AM',
      channel: 'Media / Images',
      sender: 'Social Bot Account',
      threat: 'MANIPULATED' as ThreatClassification,
      risk: 'MEDIUM' as RiskLevel,
      action: 'REVIEW' as SecurityAction,
      preview: 'manipulated_id_document.png (Pixel artifact anomaly detected)',
      reasons: ['Copy-move pixel inconsistency', 'EXIF anomaly']
    }
  ];

  const filtered = selectedFilter === 'ALL' 
    ? historyEntries 
    : historyEntries.filter(e => e.threat === selectedFilter || e.action === selectedFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cyber-card-green" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-green">AUDIT & QUARANTINE</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
            Security History & Quarantine Vault
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
          Immutable security log of all intercepted communication events, forensic AI reasons, and user-initiated decisions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="cyber-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--color-green)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
          {['ALL', 'SCAM', 'PHISHING', 'MANIPULATED', 'SAFE'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn ${selectedFilter === f ? 'btn-primary-green' : 'btn-outline'}`}
              style={{ padding: '4px 12px', fontSize: '0.75rem' }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing {filtered.length} entries
        </div>
      </div>

      {/* Audit Log Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map((entry) => (
          <div key={entry.id} className="cyber-card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-blue-light)', fontWeight: 700 }}>
                    {entry.id}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    {entry.channel}
                  </span>
                  <span className={`badge ${entry.risk === 'CRITICAL' ? 'badge-danger' : entry.risk === 'HIGH' ? 'badge-warning' : entry.risk === 'MEDIUM' ? 'badge-blue' : 'badge-green'}`} style={{ fontSize: '0.62rem' }}>
                    {entry.risk} RISK
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  From: {entry.sender} • Intercepted at {entry.time}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge ${entry.action === 'BLOCK' ? 'badge-danger' : entry.action === 'REVIEW' ? 'badge-warning' : 'badge-green'}`}>
                  {entry.action === 'BLOCK' ? 'QUARANTINED' : entry.action}
                </span>
              </div>
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '10px', fontSize: '0.82rem', color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>
              "{entry.preview}"
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Forensic Indicators:</span>
              {entry.reasons.map((r, i) => (
                <span key={i} className="badge badge-neutral" style={{ fontSize: '0.62rem' }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
