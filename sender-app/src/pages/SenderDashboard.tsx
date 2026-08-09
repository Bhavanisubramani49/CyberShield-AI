import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Key, 
  Activity, 
  RotateCcw, 
  Radio, 
  Server, 
  Zap, 
  LogOut 
} from 'lucide-react';
import { SenderUser, GatewaySendResponse, GatewayHealthResponse } from '../types';
import { transmitEventToCore, checkGatewayHealth } from '../services/api';

interface SenderDashboardProps {
  user: SenderUser;
  onLogout: () => void;
}

export const SenderDashboard: React.FC<SenderDashboardProps> = ({ user, onLogout }) => {
  const [apiKey, setApiKey] = useState<string>('cs-sim-key-prod-2026');
  const [gatewayHealth, setGatewayHealth] = useState<GatewayHealthResponse | null>(null);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(false);

  // Form State
  const [recipientId, setRecipientId] = useState<string>('Receiver Mobile User (+1 555 019 9999)');
  const [contentType, setContentType] = useState<string>('message');
  const [messageText, setMessageText] = useState<string>('Hi, are you available for the meeting?');
  const [emailSubject, setEmailSubject] = useState<string>('Urgent: Account Verification Required');
  const [urlInput, setUrlInput] = useState<string>('http://192.168.1.10/update-login.php');
  const [imageName, setImageName] = useState<string>('doctored_payment_receipt_spliced.png');
  const [videoName, setVideoName] = useState<string>('executive_face_swap_deepfake.mp4');
  const [fileName, setFileName] = useState<string>('Urgent_Invoice_March2026.docm');

  // Dispatch state
  const [transmitting, setTransmitting] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<GatewaySendResponse | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [history, setHistory] = useState<GatewaySendResponse[]>([]);

  const pingGateway = async () => {
    setCheckingHealth(true);
    try {
      const h = await checkGatewayHealth();
      setGatewayHealth(h);
    } catch (e) {
      setGatewayHealth(null);
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    pingGateway();
  }, []);

  const loadPreset = (preset: string) => {
    if (preset === 'safe_msg') {
      setContentType('message');
      setMessageText('Hi, are you available for the meeting?');
    } else if (preset === 'lottery_scam') {
      setContentType('message');
      setMessageText('Congratulations! You won ₹50,000 lottery cash prize! Click here immediately to claim before expiration: http://192.168.1.1/claim-cash');
    } else if (preset === 'bank_phish') {
      setContentType('email');
      setEmailSubject('Urgent: Unauthorized debit detected on your bank account');
      setMessageText('Your account has been restricted due to suspicious debit of $850. Verify your PIN and credentials within 24 hours at our secure portal.');
    } else if (preset === 'malicious_url') {
      setContentType('url');
      setUrlInput('http://192.168.1.10/update-login.php?token=xyz998273');
      setMessageText('http://192.168.1.10/update-login.php?token=xyz998273');
    } else if (preset === 'fake_news') {
      setContentType('news');
      setMessageText('BREAKING: Drinking boiled garlic water cures severe virus infections in under 2 hours, secret doctors confirm!');
    } else if (preset === 'macro_doc') {
      setContentType('file');
      setFileName('Urgent_Invoice_March2026.docm');
      setMessageText('Urgent_Invoice_March2026.docm (AutoExec VBA macro & high binary section entropy)');
    }
  };

  const handleSend = async () => {
    setDispatchError(null);
    setTransmitting(true);

    let payload: Record<string, any> = {};
    if (contentType === 'message') {
      payload = { text: messageText };
    } else if (contentType === 'email') {
      payload = { subject: emailSubject, body: messageText, text: `${emailSubject}\n${messageText}` };
    } else if (contentType === 'url') {
      payload = { url: urlInput, text: urlInput };
    } else if (contentType === 'image') {
      payload = { filename: imageName, text: imageName, image_name: imageName };
    } else if (contentType === 'video') {
      payload = { filename: videoName, text: videoName, video_name: videoName };
    } else if (contentType === 'file') {
      payload = { filename: fileName, text: fileName, file_name: fileName };
    } else {
      payload = { text: messageText, content: messageText };
    }

    try {
      const res = await transmitEventToCore({
        sender_id: `${user.fullName} (${user.id})`,
        recipient_id: recipientId,
        content_type: contentType,
        payload: payload,
        source_app: `CyberShield External Sender App (Port 5174 / User: ${user.fullName})`
      }, apiKey);

      setLastResponse(res);
      setHistory(prev => [res, ...prev.slice(0, 9)]);
    } catch (e: any) {
      setDispatchError(e.message || 'Failed to transmit to Core Gateway.');
    } finally {
      setTransmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. App Top Banner */}
      <div className="cyber-card-green" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-blue">APPLICATION 1: SENDER PLATFORM</span>
              <span className="badge badge-green">PORT 5174</span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              CyberShield External Sender Console
            </h1>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Logged in as: <strong style={{ color: 'var(--color-green)' }}>{user.fullName}</strong> ({user.role})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={pingGateway} disabled={checkingHealth} className="btn btn-outline" style={{ fontSize: '0.75rem' }}>
              <RotateCcw size={13} className={checkingHealth ? 'spin' : ''} /> Ping Core
            </button>
            <button onClick={onLogout} className="btn btn-outline" style={{ fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--color-danger)' }}>
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* 2. Core Gateway Connection & Credential Bar */}
      <div className="cyber-card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: gatewayHealth ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: gatewayHealth ? '1px solid var(--border-green)' : '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Server size={18} color={gatewayHealth ? 'var(--color-green)' : 'var(--color-danger)'} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              CyberShield Core Gateway: <span className={`badge ${gatewayHealth ? 'badge-green' : 'badge-danger'}`}>{gatewayHealth ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Destination: <code>http://127.0.0.1:8000/api/v1/gateway/send</code>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '280px' }}>
          <Key size={14} color="var(--color-green)" />
          <div style={{ flex: 1 }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="X-CyberShield-API-Key"
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. 1-Click Synthetic Attack & Safe Scenarios */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={15} color="var(--color-green)" />
          Synthetic Academic Scenarios (1-Click Presets):
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => loadPreset('safe_msg')} className="btn btn-outline" style={{ fontSize: '0.75rem', borderColor: 'var(--border-green)', color: 'var(--color-green)' }}>
            ✓ Safe Message ("Are you available for meeting?")
          </button>
          <button onClick={() => loadPreset('lottery_scam')} className="btn btn-outline" style={{ fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--color-danger)' }}>
            🚨 ₹50,000 Lottery Scam (SMS)
          </button>
          <button onClick={() => loadPreset('bank_phish')} className="btn btn-outline" style={{ fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--color-danger)' }}>
            🚨 Bank Account Phishing Email
          </button>
          <button onClick={() => loadPreset('malicious_url')} className="btn btn-outline" style={{ fontSize: '0.75rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--color-warning)' }}>
            ⚠️ Deceptive IP Host Link
          </button>
          <button onClick={() => loadPreset('fake_news')} className="btn btn-outline" style={{ fontSize: '0.75rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--color-warning)' }}>
            ⚠️ Viral Medical Fake News
          </button>
          <button onClick={() => loadPreset('macro_doc')} className="btn btn-outline" style={{ fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--color-danger)' }}>
            🚨 Macro-Enabled Word Invoice
          </button>
        </div>
      </div>

      {/* 4. Composer & Live Telemetry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        {/* Composer */}
        <div className="cyber-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} color="var(--color-green)" />
            Compose Simulated Event
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Recipient Device / Endpoint:
              </label>
              <input
                type="text"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Content Modality:
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#090d16',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem'
                }}
              >
                <option value="message">SMS / Chat Message</option>
                <option value="email">Email Communication</option>
                <option value="url">URL Web Link</option>
                <option value="news">Social News Article</option>
                <option value="image">Photo Scan / Image</option>
                <option value="video">Video Stream Clip</option>
                <option value="file">File Attachment</option>
              </select>
            </div>

            {contentType === 'email' && (
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Email Subject:
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem'
                  }}
                />
              </div>
            )}

            {contentType === 'url' && (
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Target Web URL:
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>
            )}

            {contentType === 'image' && (
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Image Payload Filename / Path:
                </label>
                <input
                  type="text"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem'
                  }}
                />
              </div>
            )}

            {contentType === 'video' && (
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Video Stream Clip Filename / Path:
                </label>
                <input
                  type="text"
                  value={videoName}
                  onChange={(e) => setVideoName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem'
                  }}
                />
              </div>
            )}

            {contentType === 'file' && (
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Attachment File Name:
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem'
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Content Body / Text:
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            {dispatchError && (
              <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', fontSize: '0.75rem' }}>
                {dispatchError}
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={transmitting}
              className="btn btn-primary-green"
              style={{ width: '100%', padding: '10px', justifyContent: 'center', fontSize: '0.85rem' }}
            >
              {transmitting ? <RotateCcw size={14} className="spin" /> : <Send size={14} />}
              {transmitting ? 'Transmitting to Core Gateway...' : 'Send Event to CyberShield Core'}
            </button>
          </div>
        </div>

        {/* Live Gateway Telemetry */}
        <div className="cyber-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="var(--color-blue-light)" />
              Core Gateway Security Feedback
            </h3>
            {lastResponse && (
              <span className={`badge ${lastResponse.decision === 'ALLOW' ? 'badge-green' : lastResponse.decision === 'QUARANTINE' || lastResponse.decision === 'BLOCK' ? 'badge-danger' : 'badge-warning'}`}>
                {lastResponse.decision}
              </span>
            )}
          </div>

          {lastResponse ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div style={{ padding: '10px 12px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.76rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Event ID:</span>
                  <strong style={{ color: 'var(--color-green)', fontFamily: 'var(--font-mono)' }}>{lastResponse.event_id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Receiver Delivery Status:</span>
                  <strong style={{ color: lastResponse.delivered_to_receiver ? 'var(--color-green)' : 'var(--color-danger)' }}>
                    {lastResponse.receiver_status}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Classification & Score:</span>
                  <strong>{lastResponse.classification} ({lastResponse.risk_score}/100)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Inference Latency:</span>
                  <span style={{ color: 'var(--color-blue-light)' }}>{lastResponse.processing_time_ms.toFixed(1)}ms</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Forensic Reasons:
                </div>
                <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {lastResponse.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                <pre style={{
                  padding: '6px 8px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.65rem',
                  color: 'var(--color-blue-light)',
                  overflowX: 'auto',
                  maxHeight: '100px'
                }}>
                  {JSON.stringify(lastResponse, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              <Radio size={28} color="var(--border-subtle)" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Awaiting Event Transmission</div>
              <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>Send a message to see CyberShield AI Core analysis in real time.</div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Recent Dispatches Stream */}
      {history.length > 0 && (
        <div className="cyber-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Sender Session Transmission Log ({history.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {history.map((h) => (
              <div key={h.event_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', fontSize: '0.74rem' }}>
                <div>
                  <strong style={{ color: 'var(--color-green)', fontFamily: 'var(--font-mono)' }}>{h.event_id}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>{h.classification} ({h.risk_score}/100)</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`badge ${h.decision === 'ALLOW' ? 'badge-green' : 'badge-danger'}`}>{h.decision}</span>
                  <span style={{ color: h.delivered_to_receiver ? 'var(--color-green)' : 'var(--color-danger)', fontSize: '0.68rem' }}>{h.receiver_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
