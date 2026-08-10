import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Key, 
  Activity, 
  RotateCcw, 
  Server, 
  Zap, 
  LogOut,
  ShieldAlert,
  Layers,
  CheckCircle
} from 'lucide-react';
import { SenderUser, GatewaySendResponse, GatewayHealthResponse } from '../types';
import { transmitEventToCore, checkGatewayHealth } from '../services/api';

interface SenderDashboardProps {
  user: SenderUser;
  onLogout: () => void;
}

interface PlatformConfig {
  id: string;
  name: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  defaultContentType: string;
  safePreset: { label: string; payload: Record<string, any> };
  attackPreset: { label: string; payload: Record<string, any> };
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    senderId: 'SND-WA-001',
    senderName: 'Marcus Reynolds',
    recipientId: 'RCV-WA-001',
    recipientName: 'Receiver Mobile User',
    defaultContentType: 'message',
    safePreset: {
      label: '✓ Safe WhatsApp Chat ("Hi, are you available for meeting?")',
      payload: { text: 'Hi, are you available for the meeting at 10 AM?' }
    },
    attackPreset: {
      label: '🚨 WhatsApp Lottery Scam ("You won ₹50,000 lottery cash prize!")',
      payload: { text: 'Congratulations! You won ₹50,000 lottery cash prize! Click here immediately to claim before expiration: http://192.168.1.1/claim-cash' }
    }
  },
  {
    id: 'instagram',
    name: 'Instagram',
    senderId: 'SND-IG-001',
    senderName: 'Marcus Reynolds',
    recipientId: 'RCV-IG-001',
    recipientName: 'Receiver Social User',
    defaultContentType: 'message',
    safePreset: {
      label: '✓ Safe Instagram Direct Message ("Loved your design portfolio!")',
      payload: { text: 'Loved your new design portfolio post! Let us collaborate on the next project.' }
    },
    attackPreset: {
      label: '🚨 Instagram Crypto Giveaway Bot ("Earn 500% daily returns")',
      payload: { 
        text: 'FREE CRYPTO AIRDROP: Double your investment instantly! Send 0.1 BTC to receive 0.5 BTC back immediately at http://192.168.1.200/crypto-giveaway.php',
        followers: 12,
        following: 4500,
        username: 'crypto_giveaway_bot_99',
        bio: 'FREE CRYPTO REWARDS • 500% GUARANTEED RETURN • CLICK LINK'
      }
    }
  },
  {
    id: 'messages',
    name: 'Messages / SMS',
    senderId: 'SND-SMS-001',
    senderName: 'Marcus Reynolds',
    recipientId: 'RCV-SMS-001',
    recipientName: 'Receiver Mobile User',
    defaultContentType: 'message',
    safePreset: {
      label: '✓ Safe SMS Alert ("Flight DL-482 boarding at Gate B12")',
      payload: { text: 'Flight DL-482 boarding at Gate B12 at 14:30. Thank you for flying Delta.' }
    },
    attackPreset: {
      label: '🚨 SMS Bank Urgency Scam ("Account suspended! Verify PIN")',
      payload: { text: 'URGENT: Your bank debit card is locked due to unauthorized $850 charge. Call 1800-555-0199 or verify PIN now at http://192.168.1.10/verify-bank' }
    }
  },
  {
    id: 'email',
    name: 'Email / Gmail',
    senderId: 'SND-EMAIL-001',
    senderName: 'Marcus Reynolds',
    recipientId: 'RCV-EMAIL-001',
    recipientName: 'Receiver Mail User',
    defaultContentType: 'email',
    safePreset: {
      label: '✓ Safe Email ("Q3 Financial Performance Report & Meeting Minutes")',
      payload: { 
        subject: 'Q3 Financial Performance Report & Meeting Minutes',
        body: 'Please find attached the summary minutes and quarterly revenue metrics discussed in our executive sync.'
      }
    },
    attackPreset: {
      label: '🚨 Spear-Phishing Email ("Urgent: Immediate Account Password Reset")',
      payload: { 
        subject: 'Urgent: Immediate Account Suspension - Security Action Required',
        body: 'Your enterprise cloud account will be deactivated within 1 hour due to unauthorized access. Click below to verify password and confirm identity immediately.',
        link: 'http://192.168.1.50/update-login.php?user=alex'
      }
    }
  },
  {
    id: 'web',
    name: 'Web & URLs',
    senderId: 'SND-WEB-001',
    senderName: 'Marcus Reynolds',
    recipientId: 'RCV-WEB-001',
    recipientName: 'Receiver Browser User',
    defaultContentType: 'url',
    safePreset: {
      label: '✓ Safe Website Link ("https://developer.mozilla.org/en-US")',
      payload: { url: 'https://developer.mozilla.org/en-US' }
    },
    attackPreset: {
      label: '⚠️ Malicious IP Phishing Host ("http://192.168.1.10/update-login.php")',
      payload: { url: 'http://192.168.1.10/update-login.php?token=xyz998273' }
    }
  },
  {
    id: 'photos',
    name: 'Photos & Gallery',
    senderId: 'SND-PHOTO-001',
    senderName: 'Marcus Reynolds',
    recipientId: 'RCV-PHOTO-001',
    recipientName: 'Receiver Gallery User',
    defaultContentType: 'image',
    safePreset: {
      label: '✓ Safe Camera Photo ("family_vacation_photo_dsc_0842.jpg")',
      payload: { filename: 'family_vacation_photo_dsc_0842.jpg', description: 'Authentic camera capture with consistent Bayer sensor noise.' }
    },
    attackPreset: {
      label: '🚨 Tampered Spliced Receipt ("doctored_payment_receipt_spliced.png")',
      payload: { filename: 'doctored_payment_receipt_spliced.png', description: 'Manipulated payment transaction receipt with GAN pixel synthesis and copy-move artifacts.' }
    }
  },
  {
    id: 'videos',
    name: 'Videos & Streams',
    senderId: 'SND-VIDEO-001',
    senderName: 'Marcus Reynolds',
    recipientId: 'RCV-VIDEO-001',
    recipientName: 'Receiver Video User',
    defaultContentType: 'video',
    safePreset: {
      label: '✓ Safe Recorded Video ("team_standup_recording_2026.mp4")',
      payload: { filename: 'team_standup_recording_2026.mp4', description: 'Natural lighting, continuous frame timestamps, and synchronized audio lip tracking.' }
    },
    attackPreset: {
      label: '🚨 Deepfake Video ("executive_face_swap_deepfake.mp4")',
      payload: { filename: 'executive_face_swap_deepfake.mp4', description: 'AI face_swap deepfake with facial boundary warping anomalies and synthetic blinking frequency.' }
    }
  },
  {
    id: 'news',
    name: 'News & Articles',
    senderId: 'SND-NEWS-001',
    senderName: 'Marcus Reynolds',
    recipientId: 'RCV-NEWS-001',
    recipientName: 'Receiver News User',
    defaultContentType: 'news',
    safePreset: {
      label: '✓ Verified Article ("NASA Rover Discovers Ancient Sedimentary Formations")',
      payload: { 
        headline: 'NASA Rover Discovers Ancient Sedimentary Formations on Mars Surface',
        text: 'Scientists at the Jet Propulsion Laboratory confirmed that rover telemetry indicates preserved mineral strata consistent with ancient riverbed deposition.'
      }
    },
    attackPreset: {
      label: '⚠️ Sensationalist Fake News ("BREAKING: Secret cure cures severe virus in 2 hours")',
      payload: { 
        headline: 'SHOCKING: Secret Miracle Cure Doctors Won’t Tell You About Cures All Viruses in 2 Hours!',
        text: 'Leaked government memo confirms secret boiled garlic remedy destroys all viral infections instantly. Big pharma trying to ban all reporting!'
      }
    }
  },
  {
    id: 'files',
    name: 'Files & Storage',
    senderId: 'SND-FILE-001',
    senderName: 'Marcus Reynolds',
    recipientId: 'RCV-FILE-001',
    recipientName: 'Receiver Storage User',
    defaultContentType: 'file',
    safePreset: {
      label: '✓ Safe Document ("Annual_CyberSecurity_Report_2026.pdf")',
      payload: { filename: 'Annual_CyberSecurity_Report_2026.pdf', file_type: 'application/pdf' }
    },
    attackPreset: {
      label: '🚨 Malicious Macro Document ("Urgent_Invoice_March2026.docm")',
      payload: { filename: 'Urgent_Invoice_March2026.docm', file_type: 'application/vnd.ms-word.document.macroEnabled.12' }
    }
  }
];

export const SenderDashboard: React.FC<SenderDashboardProps> = ({ user, onLogout }) => {
  const [apiKey, setApiKey] = useState<string>('cs-sim-key-prod-2026');
  const [gatewayHealth, setGatewayHealth] = useState<GatewayHealthResponse | null>(null);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(false);

  // Active Selected Platform (WhatsApp, Instagram, Messages, Email, Web, Photos, Videos, News, Files)
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('whatsapp');
  const activePlatform = PLATFORMS.find(p => p.id === selectedPlatformId) || PLATFORMS[0];

  // Dynamic Form State
  const [senderId, setSenderId] = useState<string>(activePlatform.senderId);
  const [senderName, setSenderName] = useState<string>(activePlatform.senderName);
  const [recipientId, setRecipientId] = useState<string>(activePlatform.recipientId);
  const [recipientName, setRecipientName] = useState<string>(activePlatform.recipientName);
  const [messageText, setMessageText] = useState<string>(activePlatform.safePreset.payload.text || '');
  const [emailSubject, setEmailSubject] = useState<string>(activePlatform.safePreset.payload.subject || 'Meeting Notes');
  const [urlInput, setUrlInput] = useState<string>(activePlatform.safePreset.payload.url || 'https://developer.mozilla.org');
  const [fileName, setFileName] = useState<string>(activePlatform.safePreset.payload.filename || 'report.pdf');
  const [headlineText, setHeadlineText] = useState<string>(activePlatform.safePreset.payload.headline || 'Breaking Tech Announcement');

  // Transmission State & Session History
  const [transmitting, setTransmitting] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<GatewaySendResponse | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [history, setHistory] = useState<GatewaySendResponse[]>([]);

  // Update dynamic defaults when platform changes
  const handlePlatformChange = (pId: string) => {
    setSelectedPlatformId(pId);
    const p = PLATFORMS.find(item => item.id === pId) || PLATFORMS[0];
    setSenderId(p.senderId);
    setSenderName(p.senderName);
    setRecipientId(p.recipientId);
    setRecipientName(p.recipientName);
    if (p.safePreset.payload.text) setMessageText(p.safePreset.payload.text);
    if (p.safePreset.payload.subject) setEmailSubject(p.safePreset.payload.subject);
    if (p.safePreset.payload.url) setUrlInput(p.safePreset.payload.url);
    if (p.safePreset.payload.filename) setFileName(p.safePreset.payload.filename);
    if (p.safePreset.payload.headline) setHeadlineText(p.safePreset.payload.headline);
  };

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

  const loadPreset = (isAttack: boolean) => {
    const preset = isAttack ? activePlatform.attackPreset : activePlatform.safePreset;
    const pl = preset.payload;
    if (pl.text) setMessageText(pl.text);
    if (pl.subject) setEmailSubject(pl.subject);
    if (pl.url) setUrlInput(pl.url);
    if (pl.filename) setFileName(pl.filename);
    if (pl.headline) setHeadlineText(pl.headline);
  };

  const handleSend = async () => {
    setDispatchError(null);
    setTransmitting(true);

    let payload: Record<string, any> = {};
    if (selectedPlatformId === 'whatsapp' || selectedPlatformId === 'messages') {
      payload = { text: messageText };
    } else if (selectedPlatformId === 'instagram') {
      payload = { text: messageText, bio: messageText, followers: 100, following: 100 };
    } else if (selectedPlatformId === 'email') {
      payload = { subject: emailSubject, body: messageText, text: `${emailSubject}\n${messageText}` };
    } else if (selectedPlatformId === 'web') {
      payload = { url: urlInput, text: urlInput };
    } else if (selectedPlatformId === 'photos') {
      payload = { filename: fileName, description: messageText, text: fileName };
    } else if (selectedPlatformId === 'videos') {
      payload = { filename: fileName, description: messageText, text: fileName };
    } else if (selectedPlatformId === 'news') {
      payload = { headline: headlineText, text: messageText };
    } else if (selectedPlatformId === 'files') {
      payload = { filename: fileName, file_type: fileName.endsWith('.docm') ? 'macroEnabled' : 'document' };
    } else {
      payload = { text: messageText };
    }

    try {
      const res = await transmitEventToCore({
        platform: selectedPlatformId,
        sender_id: senderId,
        sender_name: senderName,
        recipient_id: recipientId,
        recipient_name: recipientName,
        content_type: activePlatform.defaultContentType,
        payload: payload,
        source_app: `CyberShield Sender Platform (Port 5174 / ${activePlatform.name})`
      }, apiKey);

      setLastResponse(res);
      setHistory(prev => [res, ...prev.slice(0, 19)]);
    } catch (e: any) {
      setDispatchError(e.message || 'Event transmission failed. Check gateway connectivity.');
    } finally {
      setTransmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Top Header Banner */}
      <div className="cyber-card-green" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-blue">APPLICATION 1: SENDER PLATFORM</span>
              <span className="badge badge-green">PORT 5174</span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              CyberShield Multi-Platform Sender Console
            </h1>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Simulated multi-channel event generator • Logged in as: <strong>{user?.fullName || 'Marcus Reynolds'}</strong> ({user?.personaType || 'researcher'})
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
              className="cyber-input"
              style={{ padding: '6px 10px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </div>
      </div>

      {/* 3. SENDER ENVIRONMENT / PLATFORM SELECTOR (9 PLATFORMS) */}
      <div className="cyber-card" style={{ padding: '20px' }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--color-blue-light)" />
          Sender Environment (Select 1 of 9 Platforms):
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '8px', marginBottom: '16px' }}>
          {PLATFORMS.map((p) => {
            const isSel = selectedPlatformId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePlatformChange(p.id)}
                className={`btn ${isSel ? 'btn-primary-green' : 'btn-outline'}`}
                style={{ fontSize: '0.74rem', padding: '8px 6px', justifyContent: 'center', textAlign: 'center' }}
              >
                {p.name}
              </button>
            );
          })}
        </div>

        {/* Dynamic Sender & Recipient Account Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sender Identity:</span>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {senderName} <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-green)', fontSize: '0.76rem' }}>({senderId})</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target Receiver:</span>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {recipientName} <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-blue-light)', fontSize: '0.76rem' }}>({recipientId})</span>
            </div>
          </div>
        </div>

        {/* 1-Click Platform Scenario Presets */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color="var(--color-green)" />
            {activePlatform.name} Scenario Presets:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => loadPreset(false)}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', borderColor: 'var(--border-green)', color: 'var(--color-green)' }}
            >
              {activePlatform.safePreset.label}
            </button>
            <button
              onClick={() => loadPreset(true)}
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--color-danger)' }}
            >
              {activePlatform.attackPreset.label}
            </button>
          </div>
        </div>

        {/* Dynamic Content Form Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {selectedPlatformId === 'email' && (
            <div>
              <label className="cyber-label">Subject Header:</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="cyber-input"
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          )}

          {selectedPlatformId === 'news' && (
            <div>
              <label className="cyber-label">Article Headline:</label>
              <input
                type="text"
                value={headlineText}
                onChange={(e) => setHeadlineText(e.target.value)}
                className="cyber-input"
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          )}

          {selectedPlatformId === 'web' ? (
            <div>
              <label className="cyber-label">Target URL:</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="cyber-input"
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          ) : selectedPlatformId === 'photos' || selectedPlatformId === 'videos' || selectedPlatformId === 'files' ? (
            <div>
              <label className="cyber-label">File / Payload Name:</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="cyber-input"
                style={{ fontSize: '0.82rem', marginBottom: '8px' }}
              />
              <label className="cyber-label">Simulated Description / Meta:</label>
              <textarea
                rows={2}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="cyber-input"
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          ) : (
            <div>
              <label className="cyber-label">{selectedPlatformId === 'email' ? 'Email Body Text:' : 'Message Content Text:'}</label>
              <textarea
                rows={3}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="cyber-input"
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          )}

          {dispatchError && (
            <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
              ⚠️ {dispatchError}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={transmitting}
            className="btn btn-primary-green"
            style={{ marginTop: '6px', padding: '10px', fontSize: '0.85rem', justifyContent: 'center' }}
          >
            <Send size={15} /> {transmitting ? 'Transmitting Event to Core...' : `Send ${activePlatform.name} Event to CyberShield Core`}
          </button>
        </div>
      </div>

      {/* 4. Real-Time Transmission Result Inspection */}
      {lastResponse && (
        <div className="cyber-card" style={{ padding: '20px', border: lastResponse.decision === 'ALLOW' ? '1px solid var(--border-green)' : '1px solid rgba(239, 68, 68, 0.4)', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {lastResponse.decision === 'ALLOW' ? <CheckCircle size={20} color="var(--color-green)" /> : <ShieldAlert size={20} color="var(--color-danger)" />}
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Gateway Dispatch Result ({lastResponse.platform.toUpperCase()})
              </strong>
            </div>
            <span className={`badge ${lastResponse.decision === 'ALLOW' ? 'badge-green' : 'badge-danger'}`}>
              {lastResponse.decision}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.78rem', marginBottom: '12px' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Event ID:</span> <strong style={{ color: 'var(--color-blue-light)', fontFamily: 'var(--font-mono)' }}>{lastResponse.event_id}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Classification:</span> <strong style={{ color: lastResponse.classification === 'SAFE' ? 'var(--color-green)' : 'var(--color-danger)' }}>{lastResponse.classification}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Risk Score:</span> <strong>{lastResponse.risk_score}/100 ({lastResponse.risk_level})</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Receiver Status:</span> <strong>{lastResponse.receiver_status}</strong></div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <strong>AI Detection Reasons:</strong> {lastResponse.reasons.join(' • ')}
          </div>
        </div>
      )}

      {/* 5. Sender Session Transmission History */}
      <div className="cyber-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="var(--color-blue-light)" />
          Session Event Transmission Log ({history.length})
        </h3>

        {history.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
            No events transmitted in this session yet. Select a platform and scenario above to transmit an event.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.76rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.58rem', textTransform: 'uppercase' }}>{h.platform}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-blue-light)', fontWeight: 600 }}>{h.event_id}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{h.classification}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: h.decision === 'ALLOW' ? 'var(--color-green)' : 'var(--color-danger)', fontWeight: 700 }}>
                    {h.decision} ({h.risk_score}/100)
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{h.timestamp.split('T')[1]?.slice(0, 8)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
