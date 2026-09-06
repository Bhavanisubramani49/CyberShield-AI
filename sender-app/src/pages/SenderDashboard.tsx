import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Server, 
  Zap, 
  LogOut,
  Layers,
  Users,
  User,
  Sparkles
} from 'lucide-react';
import { SenderUser, GatewaySendResponse, GatewayHealthResponse } from '../types';
import { WhatsAppSimulator } from '../components/WhatsAppSimulator';
import { MessagesSimulator } from '../components/MessagesSimulator';
import { EmailSimulator } from '../components/EmailSimulator';
import { InstagramSimulator } from '../components/simulators/InstagramSimulator';
import { 
  transmitEventToCore, 
  checkGatewayHealth,
  fetchDemoUsersSenderAPI,
  fetchConversationsSenderAPI,
  fetchConversationMessagesSenderAPI,
  sendConversationMessageSenderAPI
} from '../services/api';

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

export const SenderDashboard: React.FC<SenderDashboardProps> = ({ onLogout }) => {
  const [apiKey] = useState<string>('cs-sim-key-prod-2026');
  const [gatewayHealth, setGatewayHealth] = useState<GatewayHealthResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'ecosystem' | 'whatsapp' | 'messages' | 'email_app' | 'instagram_app' | 'single_platform'>('ecosystem');

  // -----------------------------------------------------------------------
  // MULTI-USER ECOSYSTEM STATE
  // -----------------------------------------------------------------------
  const [demoUsers, setDemoUsers] = useState<any[]>([]);
  const [activeSenderId, setActiveSenderId] = useState<string>('user-riya');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('CONV-003');
  const [convMessages, setConvMessages] = useState<any[]>([]);
  const [ecoText, setEcoText] = useState<string>('');
  const [sendingEcoMsg, setSendingEcoMsg] = useState<boolean>(false);

  // -----------------------------------------------------------------------
  // SINGLE PLATFORM SIMULATOR STATE
  // -----------------------------------------------------------------------
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('whatsapp');
  const activePlatform = PLATFORMS.find(p => p.id === selectedPlatformId) || PLATFORMS[0];

  const [senderId, setSenderId] = useState<string>(activePlatform.senderId);
  const [senderName, setSenderName] = useState<string>(activePlatform.senderName);
  const [recipientId, setRecipientId] = useState<string>(activePlatform.recipientId);
  const [recipientName, setRecipientName] = useState<string>(activePlatform.recipientName);
  const [messageText, setMessageText] = useState<string>(activePlatform.safePreset.payload.text || '');
  const [emailSubject, setEmailSubject] = useState<string>(activePlatform.safePreset.payload.subject || 'Meeting Notes');
  const [urlInput, setUrlInput] = useState<string>(activePlatform.safePreset.payload.url || 'https://developer.mozilla.org');
  const [fileName, setFileName] = useState<string>(activePlatform.safePreset.payload.filename || 'report.pdf');
  const [headlineText, setHeadlineText] = useState<string>(activePlatform.safePreset.payload.headline || 'Breaking Tech Announcement');

  const [transmitting, setTransmitting] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<GatewaySendResponse | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  useEffect(() => {
    pingGateway();
    loadEcoData();

    const timer = setInterval(() => {
      loadEcoConversations();
      if (selectedConvId) {
        loadEcoMessages(selectedConvId);
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [activeSenderId, selectedConvId]);

  useEffect(() => {
    if (selectedConvId) {
      loadEcoMessages(selectedConvId);
    }
  }, [selectedConvId]);

  const loadEcoData = async () => {
    const users = await fetchDemoUsersSenderAPI('user-kavin');
    setDemoUsers(users);
    if (users.length > 0 && !users.some((u: any) => u.user_id === activeSenderId)) {
      setActiveSenderId(users[0].user_id);
    }
  };

  const loadEcoConversations = async () => {
    const list = await fetchConversationsSenderAPI(activeSenderId);
    setConversations(list);
    if (list.length > 0 && !list.some((c: any) => c.conversation_id === selectedConvId)) {
      setSelectedConvId(list[0].conversation_id);
    }
  };

  const loadEcoMessages = async (convId: string) => {
    const msgs = await fetchConversationMessagesSenderAPI(convId);
    setConvMessages(msgs);
  };

  const handleSendEcoMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ecoText.trim() || !selectedConvId || sendingEcoMsg) return;

    setSendingEcoMsg(true);
    try {
      await sendConversationMessageSenderAPI(selectedConvId, activeSenderId, ecoText);
      setEcoText('');
      await loadEcoMessages(selectedConvId);
      await loadEcoConversations();
    } catch (err: any) {
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setSendingEcoMsg(false);
    }
  };

  const pingGateway = async () => {
    try {
      const h = await checkGatewayHealth();
      setGatewayHealth(h);
    } catch (e) {
      setGatewayHealth(null);
    }
  };

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
    } catch (e: any) {
      setDispatchError(e.message || 'Event transmission failed. Check gateway connectivity.');
    } finally {
      setTransmitting(false);
    }
  };

  const currentEcoConv = conversations.find(c => c.conversation_id === selectedConvId);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Sender Header */}
      <header className="cyber-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <Zap color="#60a5fa" size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                CyberShield External Sender Application
              </h1>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                Port 5174 • Multi-User Ecosystem & External Platform Generator Interface
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Gateway Status Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: gatewayHealth ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${gatewayHealth ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: gatewayHealth ? '#4ade80' : '#f87171'
          }}>
            <Server size={14} />
            <span>CyberShield Core Gateway: {gatewayHealth ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          <button onClick={onLogout} className="btn btn-outline" style={{ fontSize: '0.78rem' }}>
            <LogOut size={14} /> Exit
          </button>
        </div>
      </header>

      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('ecosystem')}
          className={`btn ${activeTab === 'ecosystem' ? 'btn-primary-green' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', padding: '10px 18px' }}
        >
          <Users size={16} /> Multi-User Ecosystem Simulator
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`btn ${activeTab === 'whatsapp' ? 'btn-primary-green' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', padding: '10px 18px', borderColor: activeTab === 'whatsapp' ? '#00a884' : undefined, background: activeTab === 'whatsapp' ? 'rgba(0,168,132,0.2)' : undefined }}
        >
          <Send size={16} color="#00a884" /> WhatsApp Mobile Interface
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`btn ${activeTab === 'messages' ? 'btn-accent-blue' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', padding: '10px 18px', borderColor: activeTab === 'messages' ? '#0b6bcb' : undefined, background: activeTab === 'messages' ? 'rgba(11,107,203,0.25)' : undefined }}
        >
          <Send size={16} color="#60a5fa" /> Messages / SMS Interface (Android)
        </button>
        <button
          onClick={() => setActiveTab('email_app')}
          className={`btn ${activeTab === 'email_app' ? 'btn-accent-blue' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', padding: '10px 18px', borderColor: activeTab === 'email_app' ? '#ea580c' : undefined, background: activeTab === 'email_app' ? 'rgba(234,88,12,0.25)' : undefined }}
        >
          <Send size={16} color="#f97316" /> Email / Gmail Studio
        </button>
        <button
          onClick={() => setActiveTab('instagram_app')}
          className={`btn ${activeTab === 'instagram_app' ? 'btn-accent-blue' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', padding: '10px 18px', borderColor: activeTab === 'instagram_app' ? '#e1306c' : undefined, background: activeTab === 'instagram_app' ? 'rgba(225,48,108,0.25)' : undefined }}
        >
          <Send size={16} color="#e1306c" /> Instagram Social Studio
        </button>
        <button
          onClick={() => setActiveTab('single_platform')}
          className={`btn ${activeTab === 'single_platform' ? 'btn-accent-blue' : 'btn-outline'}`}
          style={{ fontSize: '0.85rem', padding: '10px 18px' }}
        >
          <Layers size={16} /> Single Platform Attack Payload Generator
        </button>
      </div>

      {/* TAB: WHATSAPP MOBILE INTERFACE */}
      {activeTab === 'whatsapp' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(15,23,42,0.8)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>Select Active Sender User:</label>
            <select
              value={activeSenderId}
              onChange={(e) => setActiveSenderId(e.target.value)}
              style={{
                padding: '6px 12px',
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(0,168,132,0.4)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              {demoUsers.map(u => (
                <option key={u.user_id} value={u.user_id}>
                  👤 {u.name} ({u.role})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Messages sent here stream in real time to Kavin's WhatsApp Center on CyberShield Core (Port 5173).
            </span>
          </div>

          <WhatsAppSimulator activeUserId={activeSenderId} />
        </div>
      )}

      {/* TAB: MESSAGES / SMS MOBILE INTERFACE */}
      {activeTab === 'messages' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(15,23,42,0.8)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>Select Active Sender User:</label>
            <select
              value={activeSenderId}
              onChange={(e) => setActiveSenderId(e.target.value)}
              style={{
                padding: '6px 12px',
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(11,107,203,0.4)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              {demoUsers.map(u => (
                <option key={u.user_id} value={u.user_id}>
                  👤 {u.name} ({u.role})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              SMS messages sent here stream in real time to Kavin's Messages App on CyberShield Core (Port 5173).
            </span>
          </div>

          <MessagesSimulator activeUserId={activeSenderId} />
        </div>
      )}

      {/* TAB: EMAIL / GMAIL INTERFACE */}
      {activeTab === 'email_app' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(15,23,42,0.8)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>Select Active Sender User:</label>
            <select
              value={activeSenderId}
              onChange={(e) => setActiveSenderId(e.target.value)}
              style={{
                padding: '6px 12px',
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(234,88,12,0.4)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              {demoUsers.map(u => (
                <option key={u.user_id} value={u.user_id}>
                  👤 {u.name} ({u.role})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Emails sent here stream in real time to Kavin's Email Inbox on CyberShield Core (Port 5173).
            </span>
          </div>

          <div style={{ width: '100%', height: '650px' }}>
            <EmailSimulator activeUserId={activeSenderId} />
          </div>
        </div>
      )}

      {/* TAB: INSTAGRAM SOCIAL INTERFACE */}
      {activeTab === 'instagram_app' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(15,23,42,0.8)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>Select Active Sender User:</label>
            <select
              value={activeSenderId}
              onChange={(e) => setActiveSenderId(e.target.value)}
              style={{
                padding: '6px 12px',
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(225,48,108,0.4)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              {demoUsers.map(u => (
                <option key={u.user_id} value={u.user_id}>
                  👤 {u.name} ({u.role})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Instagram posts & DMs sent here stream in real time to Kavin's Instagram Sandbox on CyberShield Core (Port 5173).
            </span>
          </div>

          <div style={{ width: '100%', maxWidth: '960px' }}>
            <InstagramSimulator
              events={[]}
              onSendEvent={async (p) => {
                return await transmitEventToCore({
                  platform: 'instagram',
                  sender_id: activeSenderId,
                  sender_name: demoUsers.find(u => u.user_id === activeSenderId)?.name || 'Marcus Reynolds',
                  recipient_id: 'user-kavin',
                  recipient_name: 'Kavin',
                  content_type: p.content_type || 'message',
                  payload: p.payload,
                  source_app: 'CyberShield External Sender App (Port 5174)'
                }, apiKey);
              }}
              onInspectEvent={() => {}}
              onOpenWarning={() => {}}
            />
          </div>
        </div>
      )}

      {/* TAB 1: MULTI-USER ECOSYSTEM SIMULATOR */}
      {activeTab === 'ecosystem' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', minHeight: '580px' }}>
          
          {/* Sender Identity & Target Conversation Selector */}
          <div className="cyber-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* External Sender Identity Selector */}
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '2px', display: 'block', textTransform: 'uppercase' }}>
                Simulated External Sender:
              </label>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '6px' }}>
                Demo simulation — external user communication
              </div>
              <select
                value={activeSenderId}
                onChange={(e) => setActiveSenderId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                {demoUsers.map(u => (
                  <option key={u.user_id} value={u.user_id}>
                    👤 {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Conversation Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '440px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                {demoUsers.find(u => u.user_id === activeSenderId)?.name || 'Sender'}'s Conversations ({conversations.length})
              </div>

              {conversations.map(conv => {
                const isSelected = conv.conversation_id === selectedConvId;
                return (
                  <div
                    key={conv.conversation_id}
                    onClick={() => setSelectedConvId(conv.conversation_id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(0,0,0,0.3)',
                      border: isSelected ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {conv.conversation_type === 'GROUP' ? <Users size={14} color="#60a5fa" /> : <User size={14} color="#4ade80" />}
                      <span>{conv.title}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.latest_message ? `${conv.latest_message.sender_id.replace('user-', '')}: ${conv.latest_message.content}` : 'No messages'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversation Chat Stream & Sender Composer */}
          <div className="cyber-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div style={{ padding: '14px 18px', background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  {currentEcoConv ? currentEcoConv.title : 'Select Conversation'}
                </h3>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  Sending as <strong>{demoUsers.find(u => u.user_id === activeSenderId)?.name}</strong> • Synchronized live with CyberShield Core (Port 5173)
                </div>
              </div>

              <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
                ✓ Bidirectional Sync Active
              </span>
            </div>

            {/* Message Thread */}
            <div style={{ flex: 1, padding: '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', background: 'rgba(5, 10, 20, 0.6)' }}>
              {convMessages.map((m) => {
                const isMe = m.sender_id === activeSenderId;
                const isThreat = m.security_status !== 'SAFE';

                return (
                  <div
                    key={m.message_id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      alignSelf: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '2px' }}>
                      <strong>{m.sender_name}</strong> • {m.timestamp}
                    </div>

                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: isThreat ? 'rgba(239, 68, 68, 0.15)' : isMe ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255,255,255,0.06)',
                      border: isThreat ? '1px solid rgba(239, 68, 68, 0.4)' : isMe ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                      color: '#f8fafc',
                      fontSize: '0.82rem'
                    }}>
                      {m.content}
                      {isThreat && (
                        <div style={{ fontSize: '0.62rem', color: '#f87171', marginTop: '4px', fontWeight: 700 }}>
                          ⚠️ Intercepted by CyberShield ({m.classification} - Risk: {m.risk_score}/100)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Presets & Composer */}
            <div style={{ padding: '14px 18px', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              
              {/* Presets */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', overflowX: 'auto' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} color="#4ade80" /> Attack Presets:
                </span>
                <button
                  type="button"
                  onClick={() => setEcoText("Hi everyone, please find the team updates here.")}
                  className="btn btn-outline"
                  style={{ fontSize: '0.66rem', padding: '2px 8px' }}
                >
                  ✓ Safe Message
                </button>
                <button
                  type="button"
                  onClick={() => setEcoText("Congratulations! Claim ₹50,000 scholarship prize now: http://192.168.1.1/claim-cash")}
                  className="btn btn-outline"
                  style={{ fontSize: '0.66rem', padding: '2px 8px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  🚨 Phishing Scam
                </button>
                <button
                  type="button"
                  onClick={() => setEcoText("Urgent: Account locked verify PIN at http://192.168.1.10/verify-bank")}
                  className="btn btn-outline"
                  style={{ fontSize: '0.66rem', padding: '2px 8px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  🚨 Malicious URL
                </button>
              </div>

              <form onSubmit={handleSendEcoMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder={`Send message as ${demoUsers.find(u => u.user_id === activeSenderId)?.name}...`}
                  value={ecoText}
                  onChange={(e) => setEcoText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.84rem'
                  }}
                />
                <button
                  type="submit"
                  disabled={sendingEcoMsg || !ecoText.trim()}
                  className="btn btn-primary-green"
                  style={{ padding: '10px 18px', fontSize: '0.82rem' }}
                >
                  <Send size={14} /> {sendingEcoMsg ? 'Dispatching...' : 'Dispatch Message'}
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: SINGLE PLATFORM ATTACK PAYLOAD GENERATOR */}
      {activeTab === 'single_platform' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
          
          {/* Main Controls & Form */}
          <div className="cyber-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Platform Selector Grid */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px', display: 'block' }}>
                Select Simulated Target Platform (9 Channels):
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {PLATFORMS.map(p => {
                  const isSelected = p.id === selectedPlatformId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePlatformChange(p.id)}
                      className={`btn ${isSelected ? 'btn-primary-green' : 'btn-outline'}`}
                      style={{ fontSize: '0.78rem', padding: '8px 10px', justifyContent: 'flex-start' }}
                    >
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => loadPreset(false)}
                className="btn btn-outline"
                style={{ flex: 1, fontSize: '0.72rem', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.4)' }}
              >
                {activePlatform.safePreset.label}
              </button>
              <button
                type="button"
                onClick={() => loadPreset(true)}
                className="btn btn-outline"
                style={{ flex: 1, fontSize: '0.72rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              >
                {activePlatform.attackPreset.label}
              </button>
            </div>

            {/* Dynamic Input Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>Message / Payload Content:</label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.84rem',
                    boxSizing: 'border-box',
                    marginTop: '4px'
                  }}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={transmitting}
                className="btn btn-primary-green"
                style={{ padding: '12px', fontSize: '0.88rem', justifyContent: 'center' }}
              >
                <Send size={16} /> {transmitting ? 'Transmitting to Core Gateway...' : `Transmit to CyberShield Core (${activePlatform.name})`}
              </button>
            </div>

          </div>

          {/* Response Telemetry Box */}
          <div className="cyber-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Gateway Dispatch Telemetry
            </h3>

            {dispatchError && (
              <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#f87171', fontSize: '0.78rem' }}>
                {dispatchError}
              </div>
            )}

            {lastResponse ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Decision:</span>
                  <span className={`badge ${lastResponse.decision === 'ALLOW' ? 'badge-green' : 'badge-danger'}`}>
                    {lastResponse.decision}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Classification:</span>
                  <strong style={{ color: '#fff' }}>{lastResponse.classification}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Risk Score:</span>
                  <strong style={{ color: lastResponse.risk_score > 60 ? '#f87171' : '#4ade80' }}>
                    {lastResponse.risk_score}/100 ({lastResponse.risk_level})
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Model:</span>
                  <code style={{ color: '#60a5fa' }}>{lastResponse.model}</code>
                </div>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                No transmission dispatched in this session yet.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
