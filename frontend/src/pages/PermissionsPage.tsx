import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Layers, 
  RefreshCw, 
  Info, 
  Sliders, 
  Check, 
  X 
} from 'lucide-react';
import { PlatformIntegration, IntegrationSummary, PermissionDetail } from '../types';
import { 
  fetchIntegrationsAPI, 
  fetchIntegrationSummaryAPI, 
  fetchPlatformPermissionsAPI, 
  connectPlatformAPI, 
  disconnectPlatformAPI, 
  updatePlatformPermissionsAPI 
} from '../services/api';

export const PermissionsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([]);
  const [summary, setSummary] = useState<IntegrationSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformIntegration | null>(null);
  const [permissionList, setPermissionList] = useState<PermissionDetail[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'authorized' | 'external'>('all');
  const [oauthNoticePlatform, setOauthNoticePlatform] = useState<PlatformIntegration | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, sum] = await Promise.all([
        fetchIntegrationsAPI(),
        fetchIntegrationSummaryAPI()
      ]);
      setIntegrations(list);
      setSummary(sum);
    } catch (e) {
      console.warn('Failed to load integrations:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: PlatformIntegration) => {
    if (!platform.is_simulation) {
      setOauthNoticePlatform(platform);
      return;
    }

    try {
      await connectPlatformAPI(platform.platform_id, true);
      setActionFeedback(`Authorized and connected ${platform.name} successfully.`);
      await loadData();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (e: any) {
      setActionFeedback(`Error: ${e.message}`);
    }
  };

  const handleDisconnect = async (platform: PlatformIntegration) => {
    try {
      await disconnectPlatformAPI(platform.platform_id);
      setActionFeedback(`Disconnected ${platform.name} and revoked permissions.`);
      await loadData();
      if (selectedPlatform?.platform_id === platform.platform_id) {
        setSelectedPlatform(null);
      }
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (e: any) {
      setActionFeedback(`Error: ${e.message}`);
    }
  };

  const openPermissionModal = async (platform: PlatformIntegration) => {
    setSelectedPlatform(platform);
    const perms = await fetchPlatformPermissionsAPI(platform.platform_id);
    setPermissionList(perms);
  };

  const togglePermission = async (scope: string) => {
    if (!selectedPlatform) return;
    const currentGranted = new Set(selectedPlatform.granted_permissions);
    if (currentGranted.has(scope)) {
      currentGranted.delete(scope);
    } else {
      currentGranted.add(scope);
    }
    const updatedList = Array.from(currentGranted);

    try {
      const updated = await updatePlatformPermissionsAPI(selectedPlatform.platform_id, updatedList);
      setSelectedPlatform(updated);
      setPermissionList(prev => prev.map(p => p.scope === scope ? { ...p, is_granted: !p.is_granted } : p));
      setIntegrations(prev => prev.map(i => i.platform_id === updated.platform_id ? updated : i));
      setActionFeedback(`Permissions updated for ${selectedPlatform.name}`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (e: any) {
      setActionFeedback(`Error: ${e.message}`);
    }
  };

  const filteredIntegrations = activeTab === 'all'
    ? integrations
    : activeTab === 'authorized'
      ? integrations.filter(i => i.status === 'AUTHORIZED_SIMULATION' || i.status === 'AUTHORIZED')
      : integrations.filter(i => !i.is_simulation);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Card & Ecosystem Boundary Disclaimer */}
      <div className="cyber-card-green" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-green">
                <span className="live-dot" />
                MODULE 14: PLATFORM INTEGRATION ARCHITECTURE
              </span>
              <span className="badge badge-blue">
                ZERO-TRUST PERMISSIONS
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Platform Integrations & Permission Center
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '850px', marginTop: '6px', lineHeight: '1.5' }}>
              CyberShield AI utilizes a decoupled <strong>Adapter & Permission Layer</strong>. The system connects to the local academic simulation testbed while enforcing strict security boundaries for third-party communication targets.
            </p>
          </div>

          <button 
            onClick={loadData}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} /> Refresh Adapters
          </button>
        </div>

        {/* Action feedback toast if present */}
        {actionFeedback && (
          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--border-green)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={15} /> {actionFeedback}
          </div>
        )}
      </div>

      {/* 2. Integration Metrics Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Adapters</span>
            <Layers size={16} color="var(--color-green)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {summary?.total_adapters || integrations.length}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Registered Target Platforms</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Authorized Simulation</span>
            <ShieldCheck size={16} color="var(--color-green)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-green)' }}>
            {summary?.authorized_platforms || 1}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Active Sandbox Pipeline</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>External Targets</span>
            <Lock size={16} color="var(--color-blue-light)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-blue-light)' }}>
            {summary?.disconnected_platforms || 6}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Requires Official OAuth Consent</div>
        </div>

        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Zero Password Policy</span>
            <Key size={16} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-warning)' }}>
            100%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Zero Credential Scraping</div>
        </div>
      </div>

      {/* 3. Filter Tabs */}
      <div className="cyber-card" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('all')}
            className={`btn ${activeTab === 'all' ? 'btn-accent-blue' : 'btn-outline'}`}
            style={{ padding: '6px 14px', fontSize: '0.75rem' }}
          >
            All Platforms ({integrations.length})
          </button>
          <button
            onClick={() => setActiveTab('authorized')}
            className={`btn ${activeTab === 'authorized' ? 'btn-primary-green' : 'btn-outline'}`}
            style={{ padding: '6px 14px', fontSize: '0.75rem' }}
          >
            Authorized Simulation (1)
          </button>
          <button
            onClick={() => setActiveTab('external')}
            className={`btn ${activeTab === 'external' ? 'btn-outline' : 'btn-outline'}`}
            style={{ padding: '6px 14px', fontSize: '0.75rem' }}
          >
            External API Targets (6)
          </button>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing {filteredIntegrations.length} platform adapters
        </div>
      </div>

      {/* 4. Platform Adapter Cards Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Loading platform adapters and zero-trust permission scopes...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
          {filteredIntegrations.map((platform) => {
            const isSim = platform.is_simulation;
            const isAuth = platform.status === 'AUTHORIZED_SIMULATION' || platform.status === 'AUTHORIZED';
            const grantedCount = platform.granted_permissions.length;
            const reqCount = platform.required_permissions.length;

          return (
            <div 
              key={platform.platform_id}
              className={`cyber-card ${isSim && isAuth ? 'cyber-card-green' : ''}`}
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: isSim && isAuth ? '4px solid var(--color-green)' : '4px solid var(--border-subtle)',
                position: 'relative'
              }}
            >
              <div>
                {/* Header & Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <span className="badge badge-blue" style={{ fontSize: '0.62rem' }}>
                      {platform.category}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {platform.name}
                    </h3>
                  </div>

                  <span className={`badge ${isAuth ? 'badge-green' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                    {isAuth ? 'AUTHORIZED' : 'NOT CONNECTED'}
                  </span>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '14px' }}>
                  {platform.description || 'Enterprise integration adapter for normalized multimodal security scanning.'}
                </p>

                {/* Security Requirements Note */}
                <div style={{ padding: '10px 12px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '14px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--color-blue-light)' }}>Auth Boundary:</strong> {platform.auth_requirement_note}
                </div>

                {/* Permissions Breakdown */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Permissions Granted:</span>
                    <span style={{ color: isAuth ? 'var(--color-green)' : 'var(--text-muted)', fontWeight: 700 }}>
                      {grantedCount} / {reqCount} Scopes
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {platform.required_permissions.map((scope) => {
                      const granted = platform.granted_permissions.includes(scope);
                      return (
                        <span 
                          key={scope}
                          className={`badge ${granted ? 'badge-green' : 'badge-outline'}`}
                          style={{ fontSize: '0.58rem', padding: '1px 6px' }}
                        >
                          {granted ? '✓ ' : '✕ '} {scope.replace('READ_', '').replace('MANAGE_', '').toLowerCase()}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Capabilities list */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Supported Capabilities:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {platform.capabilities.map((cap, idx) => (
                      <span key={idx} style={{ fontSize: '0.65rem', background: 'rgba(255, 255, 255, 0.03)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                {isAuth ? (
                  <>
                    <button
                      onClick={() => handleDisconnect(platform)}
                      className="btn btn-outline"
                      style={{ flex: 1, padding: '7px 12px', fontSize: '0.75rem', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                      <XCircle size={13} /> Disconnect
                    </button>
                    <button
                      onClick={() => openPermissionModal(platform)}
                      className="btn btn-primary-green"
                      style={{ flex: 1, padding: '7px 12px', fontSize: '0.75rem' }}
                    >
                      <Sliders size={13} /> Permissions
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleConnect(platform)}
                      className="btn btn-accent-blue"
                      style={{ flex: 1, padding: '7px 12px', fontSize: '0.75rem' }}
                    >
                      <CheckCircle size={13} /> {isSim ? 'Authorize Sandbox' : 'Connect API'}
                    </button>
                    <button
                      onClick={() => openPermissionModal(platform)}
                      className="btn btn-outline"
                      style={{ padding: '7px 12px', fontSize: '0.75rem' }}
                      title="View required permission scopes"
                    >
                      <Info size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* 5. Permission Configuration Modal */}
      {selectedPlatform && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="cyber-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
                  PERMISSION DELEGATION & CONTROL
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedPlatform.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedPlatform(null)}
                className="btn btn-ghost"
                style={{ fontSize: '0.85rem' }}
              >
                ✕ Close
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
              Explicitly grant or revoke permissions for this adapter. In accordance with zero-trust principles, events attempting ingestion without granted scopes will be rejected and logged to the audit trail.
            </p>

            {/* Permission Scopes Toggle List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {permissionList.map((perm) => {
                const isGranted = selectedPlatform.granted_permissions.includes(perm.scope);
                return (
                  <div 
                    key={perm.scope}
                    onClick={() => selectedPlatform.is_simulation && togglePermission(perm.scope)}
                    style={{
                      padding: '12px 14px',
                      background: isGranted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: isGranted ? '1px solid var(--border-green)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: selectedPlatform.is_simulation ? 'pointer' : 'default',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {perm.title}
                        </span>
                        <span className="badge badge-outline" style={{ fontSize: '0.6rem' }}>
                          {perm.scope}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {perm.description}
                      </div>
                    </div>

                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: isGranted ? 'var(--color-green)' : 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isGranted ? <Check size={14} /> : <X size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {!selectedPlatform.is_simulation && (
              <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--color-blue-light)', marginBottom: '16px' }}>
                <Info size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                External adapter permissions are managed via the provider's official OAuth consent screen upon API linking.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setSelectedPlatform(null)}
                className="btn btn-primary-green"
                style={{ padding: '8px 20px', fontSize: '0.8rem' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Third-Party OAuth Notice Modal */}
      {oauthNoticePlatform && (
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
          <div className="cyber-card" style={{ maxWidth: '560px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <AlertTriangle size={24} color="var(--color-warning)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Official Platform API Required
              </h3>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
              Connecting to <strong>{oauthNoticePlatform.name}</strong> requires an official developer subscription, registered OAuth2 Client Credentials, and authentic user consent.
            </p>

            <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              <strong>Zero-Trust Academic Standard:</strong><br />
              • CyberShield AI never performs unauthorized scraping or credential collection.<br />
              • All current simulation testing is routed through the <strong>CyberShield Simulation Platform</strong>.<br />
              • External APIs can be configured by provisioning enterprise webhook signing keys.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setOauthNoticePlatform(null)}
                className="btn btn-primary-green"
                style={{ padding: '8px 18px', fontSize: '0.8rem' }}
              >
                Understood & Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Security Architecture & Boundary Card */}
      <div className="cyber-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={16} color="var(--color-green)" />
          Security Boundary & Non-Scraping Guarantee
        </h4>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
          CyberShield AI strictly adheres to zero-trust principles and responsible cybersecurity ethics. The architecture explicitly rejects password harvesting, cookie interception, and unofficial client emulation. Real enterprise connections require authenticated webhook contracts or OAuth2 scopes, while the academic prototype evaluates simulated multimodal payloads in isolated memory.
        </p>
      </div>
    </div>
  );
};
