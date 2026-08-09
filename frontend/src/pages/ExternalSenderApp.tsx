import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Key, 
  Activity, 
  RotateCcw, 
  Radio, 
  Server, 
  Zap 
} from 'lucide-react';
import { GatewaySendResponse, GatewayHealthResponse } from '../types';
import { sendExternalGatewayMessageAPI, fetchGatewayHealthAPI } from '../services/api';

const DEFAULT_API_KEY = 'cs-sim-key-prod-2026';

export const ExternalSenderApp: React.FC = () => {
  // Gateway Connection State
  const [apiKey, setApiKey] = useState<string>(DEFAULT_API_KEY);
  const [gatewayHealth, setGatewayHealth] = useState<GatewayHealthResponse | null>(null);
  const [gatewayChecking, setGatewayChecking] = useState<boolean>(false);
  const [gatewayError, setGatewayError] = useState<string | null>(null);

  // Transmission Form State
  const [senderName, setSenderName] = useState<string>('Colleague Sarah (+1 555 019 2834)');
  const [recipientId, setRecipientId] = useState<string>('Receiver Mobile Device (+1 555 019 9999)');
  const [contentType, setContentType] = useState<string>('message');
  const [messageText, setMessageText] = useState<string>('Hi team, here is the agenda for our morning sync at 10 AM.');
  const [emailSubject, setEmailSubject] = useState<string>('Urgent Security Notice: Account Verification');
  const [urlInput, setUrlInput] = useState<string>('http://192.168.1.10/secure-login/update.php');

  // Dispatch & Telemetry State
  const [transmitting, setTransmitting] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<GatewaySendResponse | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [transmissionHistory, setTransmissionHistory] = useState<GatewaySendResponse[]>([]);

  // Initial Gateway Ping
  const pingGateway = async () => {
    setGatewayChecking(true);
    setGatewayError(null);
    try {
      const h = await fetchGatewayHealthAPI();
      setGatewayHealth(h);
    } catch (e: any) {
      setGatewayError(e.message || 'Gateway unreachable');
      setGatewayHealth(null);
    } finally {
      setGatewayChecking(false);
    }
  };

  useEffect(() => {
    pingGateway();
  }, []);

  // Quick Preset Handlers
  const applyPreset = (type: 'safe' | 'lottery' | 'phish' | 'url' | 'fake_news') => {
    if (type === 'safe') {
      setSenderName('Colleague Sarah (+1 555 019 2834)');
      setContentType('message');
      setMessageText('Good morning! The project review slides are ready in the shared repository.');
    } else if (type === 'lottery') {
      setSenderName('Lottery Reward Bot (+91 91234 56789)');
      setContentType('message');
      setMessageText('CONGRATULATIONS! You won ₹25,00,000 cash reward in our annual prize draw. Call 1800-999-FREE immediately before expiration!');
    } else if (type === 'phish') {
      setSenderName('Security Notice <security@bank-verify-portal.com>');
      setContentType('email');
      setEmailSubject('Urgent Account Restriction Notice');
      setMessageText('Unauthorized transaction of $940.00 detected. Your banking card has been temporarily locked. Verify your credentials immediately.');
    } else if (type === 'url') {
      setSenderName('Promo SMS (+44 7700 900077)');
      setContentType('url');
      setUrlInput('http://192.168.1.10/secure-login/update.php?token=xyz998273');
      setMessageText('http://192.168.1.10/secure-login/update.php?token=xyz998273');
    } else if (type === 'fake_news') {
      setSenderName('Viral News Bot @breaking_truth_hub');
      setContentType('fake_news');
      setMessageText('BREAKING: Drinking boiled garlic and lemon water cures severe respiratory viral infections within 30 minutes, doctors confirm!');
    }
  };

  // Transmission Action
  const handleTransmit = async () => {
    setDispatchError(null);
    setTransmitting(true);

    let payload: Record<string, any> = {};
    if (contentType === 'message') {
      payload = { text: messageText };
    } else if (contentType === 'email') {
      payload = { subject: emailSubject, body: messageText, text: `${emailSubject}\n${messageText}` };
    } else if (contentType === 'url') {
      payload = { url: urlInput, text: urlInput };
    } else {
      payload = { text: messageText, content: messageText };
    }

    try {
      const res = await sendExternalGatewayMessageAPI({
        sender_id: senderName,
        recipient_id: recipientId,
        content_type: contentType,
        payload: payload,
        source_app: 'CyberShield External Sender Application'
      }, apiKey);

      setLastResponse(res);
      setTransmissionHistory(prev => [res, ...prev.slice(0, 9)]);
    } catch (e: any) {
      setDispatchError(e.message || 'Failed to dispatch through Gateway.');
    } finally {
      setTransmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Standalone Application Header */}
      <div className="cyber-card-green" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-blue">
                <span className="live-dot" />
                SEPARATE EXTERNAL CLIENT APPLICATION
              </span>
              <span className="badge badge-green">
                MODULE 16 CORE GATEWAY INTEGRATED
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              CyberShield External Sender Application
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '820px', marginTop: '4px', lineHeight: '1.5' }}>
              An independent client transmitting synthetic digital communications into <strong>CyberShield Core Security Gateway</strong> (<code>POST /api/v1/gateway/send</code>). Enforces API key verification, event normalization, and real-time security decision responses.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={pingGateway}
              disabled={gatewayChecking}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem' }}
            >
              <RotateCcw size={14} className={gatewayChecking ? 'spin' : ''} /> Ping Gateway
            </button>
          </div>
        </div>
      </div>

      {/* 2. Gateway Connectivity & API Key Authentication Bar */}
      <div className="cyber-card" style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: gatewayHealth ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: gatewayHealth ? '1px solid var(--border-green)' : '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Server size={22} color={gatewayHealth ? 'var(--color-green)' : 'var(--color-danger)'} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Core Security Gateway:
                </span>
                <span className={`badge ${gatewayHealth ? 'badge-green' : 'badge-danger'}`}>
                  {gatewayHealth ? 'ONLINE / CONNECTED' : 'OFFLINE'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Target Endpoint: <code>http://127.0.0.1:8000/api/v1/gateway/send</code>
              </div>
            </div>
          </div>

          {/* API Key Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '320px' }}>
            <Key size={16} color="var(--color-green)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                Gateway Authorization Key (<code>X-CyberShield-API-Key</code>):
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter Gateway API Key..."
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>
          </div>
        </div>

        {gatewayError && (
          <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', fontSize: '0.75rem' }}>
            {gatewayError}
          </div>
        )}
      </div>

      {/* 3. Quick Preset Scenario Attack & Safe Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="var(--color-green)" /> Quick Test Vectors (1-Click Presets)
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Load calibrated synthetic attack payloads</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => applyPreset('safe')}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', borderColor: 'var(--border-green)', color: 'var(--color-green)' }}
          >
            ✓ Safe Message
          </button>
          <button
            onClick={() => applyPreset('lottery')}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--color-danger)' }}
          >
            🚨 ₹25L Lottery Scam (SMS)
          </button>
          <button
            onClick={() => applyPreset('phish')}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--color-danger)' }}
          >
            🚨 Bank Phishing Email
          </button>
          <button
            onClick={() => applyPreset('url')}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--color-warning)' }}
          >
            ⚠️ Deceptive IP Host Link
          </button>
          <button
            onClick={() => applyPreset('fake_news')}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--color-warning)' }}
          >
            ⚠️ Viral Medical Fake News
          </button>
        </div>
      </div>

      {/* 4. Transmission Form & Live Response Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Form Composer */}
        <div className="cyber-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} color="var(--color-green)" />
            Compose Transmission Event
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Sender Persona / Origin Identifier:
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Target Recipient Device:
              </label>
              <input
                type="text"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Content Modality:
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem'
                }}
              >
                <option value="message">SMS / Instant Message</option>
                <option value="email">Email Communication</option>
                <option value="url">Web Link / URL</option>
                <option value="fake_news">Social News Feed Post</option>
                <option value="profile">User Profile</option>
                <option value="file">File Attachment</option>
              </select>
            </div>

            {contentType === 'email' && (
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Email Subject:
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
            )}

            {contentType === 'url' && (
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Target URL / IP Link:
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Payload Content:
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {dispatchError && (
              <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', fontSize: '0.75rem' }}>
                {dispatchError}
              </div>
            )}

            <button
              onClick={handleTransmit}
              disabled={transmitting}
              className="btn btn-primary-green"
              style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '6px' }}
            >
              {transmitting ? <RotateCcw size={16} className="spin" /> : <Send size={16} />}
              {transmitting ? 'Transmitting via Gateway...' : 'Transmit into CyberShield Core'}
            </button>
          </div>
        </div>

        {/* Live Response & Telemetry Terminal */}
        <div className="cyber-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--color-blue-light)" />
              Gateway Response Telemetry
            </h3>
            {lastResponse && (
              <span className={`badge ${lastResponse.decision === 'ALLOW' ? 'badge-green' : lastResponse.decision === 'QUARANTINE' || lastResponse.decision === 'BLOCK' ? 'badge-danger' : 'badge-warning'}`}>
                DECISION: {lastResponse.decision}
              </span>
            )}
          </div>

          {lastResponse ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <div style={{ padding: '12px 14px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Event ID:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-green)', fontFamily: 'var(--font-mono)' }}>{lastResponse.event_id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Receiver Delivery Status:</span>
                  <span style={{ fontWeight: 700, color: lastResponse.delivered_to_receiver ? 'var(--color-green)' : 'var(--color-danger)' }}>
                    {lastResponse.receiver_status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>AI Threat Classification:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{lastResponse.classification} ({lastResponse.risk_score}/100)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Core Model Latency:</span>
                  <span style={{ color: 'var(--color-blue-light)' }}>{lastResponse.processing_time_ms.toFixed(1)}ms via {lastResponse.model}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Explainable AI Forensic Insights:
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {lastResponse.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Raw JSON Gateway Payload:
                </div>
                <pre style={{
                  padding: '8px 10px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.68rem',
                  color: 'var(--color-blue-light)',
                  overflowX: 'auto',
                  maxHeight: '120px',
                  margin: 0
                }}>
                  {JSON.stringify(lastResponse, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
              <Radio size={32} color="var(--border-subtle)" style={{ marginBottom: '10px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Awaiting Transmission</div>
              <div style={{ fontSize: '0.74rem', marginTop: '4px', maxWidth: '280px' }}>
                Trigger a preset or click "Transmit" to observe real-time gateway defense intelligence.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Transmission History Stream */}
      {transmissionHistory.length > 0 && (
        <div className="cyber-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="var(--color-green)" />
            Recent Client Transmission History ({transmissionHistory.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {transmissionHistory.map((item) => (
              <div 
                key={item.event_id}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.76rem',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--color-green)', fontFamily: 'var(--font-mono)' }}>{item.event_id}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>{item.classification} ({item.risk_score}/100)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`badge ${item.decision === 'ALLOW' ? 'badge-green' : item.decision === 'QUARANTINE' || item.decision === 'BLOCK' ? 'badge-danger' : 'badge-warning'}`}>
                    {item.decision}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: item.delivered_to_receiver ? 'var(--color-green)' : 'var(--color-danger)' }}>
                    {item.receiver_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
