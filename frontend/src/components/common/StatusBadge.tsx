import React from 'react';
import { RiskLevel, ThreatClassification, SecurityAction } from '../../types';

interface StatusBadgeProps {
  type: 'risk' | 'classification' | 'action' | 'status';
  value: RiskLevel | ThreatClassification | SecurityAction | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  let badgeClass = 'badge-neutral';

  if (type === 'risk') {
    switch (value) {
      case 'CRITICAL':
      case 'HIGH':
        badgeClass = 'badge-danger';
        break;
      case 'MEDIUM':
        badgeClass = 'badge-warning';
        break;
      case 'LOW':
        badgeClass = 'badge-safe';
        break;
    }
  } else if (type === 'classification') {
    switch (value) {
      case 'SAFE':
        badgeClass = 'badge-safe';
        break;
      case 'SCAM':
      case 'PHISHING':
      case 'MALICIOUS':
      case 'DEEPFAKE':
        badgeClass = 'badge-danger';
        break;
      case 'SUSPICIOUS':
      case 'FAKE_NEWS':
      case 'MANIPULATED':
        badgeClass = 'badge-warning';
        break;
      default:
        badgeClass = 'badge-cyan';
    }
  } else if (type === 'action') {
    switch (value) {
      case 'BLOCK':
        badgeClass = 'badge-danger';
        break;
      case 'REVIEW':
        badgeClass = 'badge-warning';
        break;
      case 'ALLOW':
        badgeClass = 'badge-safe';
        break;
      default:
        badgeClass = 'badge-neutral';
    }
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="live-pulse" style={{ width: 6, height: 6 }} />
      {value}
    </span>
  );
};
