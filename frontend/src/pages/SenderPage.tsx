import React, { useState } from 'react';
import { 
  Send, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  MessageSquare, 
  Mail, 
  Globe, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  User, 
  FileCode, 
  Zap, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  Layers, 
  ArrowRight,
  Shield
} from 'lucide-react';
import { ContentType, SenderAccountType, AISecurityResult, SecurityEvent } from '../types';
import { analyzeEventAPI, sendEventAPI } from '../services/api';

export const SenderPage: React.FC = () => {
  // 1. Sender Identity State
  const [senderType, setSenderType] = useState<SenderAccountType>('simulated_attacker');
  const [senderName, setSenderName] = useState('Attacker Persona (+91 98400 12345)');

  // 2. Modality Selection State
  const [contentType, setContentType] = useState<ContentType>('message');

  // 3. Modality-specific Form Inputs
  const [messageText, setMessageText] = useState('Congratulations! You won ₹10,00,000 lottery cash prize. Click here immediately to claim: http://192.168.1.1/free-reward.xyz');
  const [emailSubject, setEmailSubject] = useState('Urgent: Your account is scheduled for immediate suspension');
  const [emailBody, setEmailBody] = useState('Your banking security profile requires immediate password re-verification. Click http://192.168.1.1/bank-login.xyz to avoid suspension.');
  const [emailLink, setEmailLink] = useState('http://192.168.1.1/bank-login.xyz');
  const [urlInput, setUrlInput] = useState('http://192.168.1.1/verify-account.xyz');
  const [newsHeadline, setNewsHeadline] = useState('SHOCKING: Central Government to ban all digital payment apps starting tomorrow!');
  const [newsText, setNewsText] = useState('An unverified leaked memo claims all digital currency and banking applications will be frozen immediately without prior notice.');
  const [imageName, setImageName] = useState('tampered_id_document_v2.png');
  const [imageDesc, setImageDesc] = useState('Scanned national identity document with copy-move pixel manipulation and spliced signature area.');
  const [videoName, setVideoName] = useState('synthetic_face_swap_test_48fps.mp4');
  const [videoDesc, setVideoDesc] = useState('Deepfake video stream with facial boundary distortion, temporal GAN artifacts, and audio desynchronization.');
  const [profileUsername, setProfileUsername] = useState('@giveaway_reward_bot_99');
  const [profileFollowers, setProfileFollowers] = useState(12);
  const [profileFollowing, setProfileFollowing] = useState(4820);
  const [profileBio, setProfileBio] = useState('Official crypto lottery reward bot. Follow & claim instant ₹50,000 bonus cash!');
  const [fileName, setFileName] = useState('urgent_payroll_update.xlsm');
  const [fileType, setFileType] = useState('Macro-Enabled Spreadsheet (.xlsm)');

  // 4. Analysis & Dispatch State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AISecurityResult | null>(null);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 5. Local Event Simulation History
  const [simulatedHistory, setSimulatedHistory] = useState<SecurityEvent[]>([
    {
      event_id: 'EVT-1082',
      sender_id: 'Attacker Persona (+91 98400 12345)',
      sender_type: 'simulated_attacker',
      receiver_id: 'Simulated Receiver',
      platform: 'CyberShield-Simulation-Hub',
      content_type: 'message',
      content_preview: 'Congratulations! You won ₹10,00,000 lottery cash prize...',
      timestamp: '10:42:15 AM',
      status: 'analyzed',
      ai_result: {
        classification: 'SCAM',
        confidence: 0.98,
        risk_level: 'CRITICAL',
        reasons: ['Unsolicited financial prize incentive', 'Urgency call-to-action', 'High probability of OTP harvesting trap'],
        recommendation: 'QUARANTINE',
        model: 'sms_scam_detection_ai',
        timestamp: new Date().toISOString(),
        processing_time_ms: 28.4
      },
      user_action: 'BLOCK'
    }
  ]);

  // Quick-load demo templates for each modality
  const loadTemplate = (mode: 'attack' | 'safe') => {
    setFormError(null);
    setAnalysisResult(null);
    setTransferSuccess(false);

    if (contentType === 'message') {
      if (mode === 'attack') {
        setSenderType('simulated_attacker');
        setSenderName('Attacker Persona (+91 98400 12345)');
        setMessageText('Congratulations! You won ₹10,00,000 lottery cash prize. Click here immediately to claim: http://192.168.1.1/free-reward.xyz');
      } else {
        setSenderType('normal_user');
        setSenderName('Alice Johnson (+91 98111 22233)');
        setMessageText('Hi Alex, are we still meeting at 3 PM today to review the project documentation?');
      }
    } else if (contentType === 'email') {
      if (mode === 'attack') {
        setSenderType('simulated_attacker');
        setSenderName('security-alert@bank-verify.net');
        setEmailSubject('Urgent: Your account is scheduled for immediate suspension');
        setEmailBody('Your banking security profile requires immediate password re-verification. Click http://192.168.1.1/bank-login.xyz to avoid suspension.');
        setEmailLink('http://192.168.1.1/bank-login.xyz');
      } else {
        setSenderType('normal_user');
        setSenderName('sarah.manager@enterprise.com');
        setEmailSubject('Team Sync: CyberShield Project Milestones');
        setEmailBody('Hi team, please find attached the quarterly project milestones. Everything is on schedule for deployment.');
        setEmailLink('https://enterprise.com/portal');
      }
    } else if (contentType === 'url') {
      if (mode === 'attack') {
        setSenderType('simulated_attacker');
        setUrlInput('http://192.168.1.1/verify-account-portal.xyz');
      } else {
        setSenderType('normal_user');
        setUrlInput('https://cybershield.ai/documentation');
      }
    } else if (contentType === 'news') {
      if (mode === 'attack') {
        setSenderType('fake_account');
        setNewsHeadline('SHOCKING: Central Government to ban all digital payment apps starting tomorrow!');
        setNewsText('An unverified leaked memo claims all digital currency and banking applications will be frozen immediately without prior notice.');
      } else {
        setSenderType('normal_user');
        setNewsHeadline('Cybersecurity Standards Updated for 2026 Enterprise Applications');
        setNewsText('National cyber agency releases official guidelines emphasizing zero-trust architecture and Explainable AI defense.');
      }
    } else if (contentType === 'image') {
      if (mode === 'attack') {
        setSenderType('simulated_hacker');
        setImageName('tampered_id_document_v2.png');
        setImageDesc('Scanned national identity document with copy-move pixel manipulation and spliced signature area.');
      } else {
        setSenderType('normal_user');
        setImageName('legitimate_office_badge.png');
        setImageDesc('Original camera photograph with authentic EXIF metadata and consistent Bayer pattern noise.');
      }
    } else if (contentType === 'video') {
      if (mode === 'attack') {
        setSenderType('simulated_hacker');
        setVideoName('synthetic_face_swap_test_48fps.mp4');
        setVideoDesc('Deepfake video stream with facial boundary distortion, temporal GAN artifacts, and audio desynchronization.');
      } else {
        setSenderType('normal_user');
        setVideoName('authentic_conference_recording.mp4');
        setVideoDesc('Natural recorded keynote speech with verified temporal frame consistency.');
      }
    } else if (contentType === 'profile') {
      if (mode === 'attack') {
        setSenderType('fake_account');
        setProfileUsername('@giveaway_reward_bot_99');
        setProfileFollowers(12);
        setProfileFollowing(4820);
        setProfileBio('Official crypto lottery reward bot. Follow & claim instant ₹50,000 bonus cash!');
      } else {
        setSenderType('normal_user');
        setProfileUsername('@alex_vance_phd');
        setProfileFollowers(1250);
        setProfileFollowing(340);
        setProfileBio('Lead Cybersecurity Architect & AI Researcher. Working on zero-trust protection systems.');
      }
    } else if (contentType === 'file') {
      if (mode === 'attack') {
        setSenderType('simulated_attacker');
        setFileName('urgent_payroll_update.xlsm');
        setFileType('Macro-Enabled Spreadsheet (.xlsm)');
      } else {
        setSenderType('normal_user');
        setFileName('annual_security_report.pdf');
        setFileType('Standard PDF Document (.pdf)');
      }
    }
  };

  const handleClearTest = () => {
    setFormError(null);
    setAnalysisResult(null);
    setTransferSuccess(false);
    setMessageText('');
    setEmailSubject('');
    setEmailBody('');
    setEmailLink('');
    setUrlInput('');
    setNewsHeadline('');
    setNewsText('');
    setImageName('');
    setImageDesc('');
    setVideoName('');
    setVideoDesc('');
    setProfileUsername('');
    setProfileBio('');
    setFileName('');
  };

  const handleAnalyze = async () => {
    setFormError(null);
    setTransferSuccess(false);

    // Basic Input Validation
    let payload: Record<string, any> = {};
    let previewText = '';

    if (contentType === 'message') {
      if (!messageText.trim()) {
        setFormError('Please enter message text to analyze.');
        return;
      }
      payload = { text: messageText };
      previewText = messageText;
    } else if (contentType === 'email') {
      if (!emailSubject.trim() || !emailBody.trim()) {
        setFormError('Please enter both email subject and body.');
        return;
      }
      payload = { subject: emailSubject, body: emailBody, link: emailLink };
      previewText = `${emailSubject} — ${emailBody.slice(0, 60)}...`;
    } else if (contentType === 'url') {
      if (!urlInput.trim()) {
        setFormError('Please enter a valid URL or IP address.');
        return;
      }
      payload = { url: urlInput };
      previewText = urlInput;
    } else if (contentType === 'news') {
      if (!newsHeadline.trim() || !newsText.trim()) {
        setFormError('Please enter both news headline and article text.');
        return;
      }
      payload = { headline: newsHeadline, text: newsText };
      previewText = newsHeadline;
    } else if (contentType === 'image') {
      if (!imageName.trim()) {
        setFormError('Please specify a test image filename or description.');
        return;
      }
      payload = { filename: imageName, description: imageDesc };
      previewText = `Image: ${imageName} (${imageDesc.slice(0, 50)}...)`;
    } else if (contentType === 'video') {
      if (!videoName.trim()) {
        setFormError('Please specify a test video filename or description.');
        return;
      }
      payload = { filename: videoName, description: videoDesc };
      previewText = `Video: ${videoName} (${videoDesc.slice(0, 50)}...)`;
    } else if (contentType === 'profile') {
      if (!profileUsername.trim()) {
        setFormError('Please enter a test username.');
        return;
      }
      payload = { username: profileUsername, followers: profileFollowers, following: profileFollowing, bio: profileBio };
      previewText = `Profile: ${profileUsername} (${profileFollowers} followers / ${profileFollowing} following)`;
    } else if (contentType === 'file') {
      if (!fileName.trim()) {
        setFormError('Please enter a test filename.');
        return;
      }
      payload = { filename: fileName, file_type: fileType };
      previewText = `File: ${fileName} (${fileType})`;
    }

    setAnalyzing(true);
    const eventId = `EVT-${Math.floor(1000 + Math.random() * 9000)}`;
    setLastEventId(eventId);

    try {
      const res = await analyzeEventAPI(contentType, senderType, senderName, payload);
      setAnalysisResult(res);

      // Append to simulated history
      const newEvent: SecurityEvent = {
        event_id: eventId,
        sender_id: senderName,
        sender_type: senderType,
        receiver_id: 'Simulated Receiver',
        platform: 'CyberShield-Simulation-Hub',
        content_type: contentType,
        content_preview: previewText,
        timestamp: new Date().toLocaleTimeString(),
        status: 'analyzed',
        ai_result: res,
        user_action: res.recommendation === 'QUARANTINE' || res.recommendation === 'BLOCK' ? 'BLOCK' : 'ALLOW'
      };
      setSimulatedHistory(prev => [newEvent, ...prev]);
    } catch (err) {
      setFormError('AI analysis request failed. Please check backend connection.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendToReceiver = async () => {
    if (!analysisResult || !lastEventId) return;

    const event: SecurityEvent = {
      event_id: lastEventId,
      sender_id: senderName,
      sender_type: senderType,
      receiver_id: 'Simulated Receiver',
      platform: 'CyberShield-Simulation-Hub',
      content_type: contentType,
      content_preview: messageText || emailSubject || urlInput || newsHeadline || imageName || videoName || profileUsername || fileName,
      timestamp: new Date().toISOString(),
      status: 'analyzed',
      ai_result: analysisResult,
      user_action: analysisResult.recommendation === 'QUARANTINE' ? 'BLOCK' : 'ALLOW'
    };

    await sendEventAPI(event);
    setTransferSuccess(true);
  };

  const senderOptions = [
    { type: 'normal_user' as SenderAccountType, label: 'Normal User', icon: UserCheck, badge: 'VERIFIED SAFE', risk: 'Low Baseline Risk' },
    { type: 'unknown_user' as SenderAccountType, label: 'Unknown User', icon: User, badge: 'UNVERIFIED', risk: 'Medium Scrutiny' },
    { type: 'fake_account' as SenderAccountType, label: 'Fake Account', icon: UserX, badge: 'BOT SUSPECT', risk: 'High Anomaly' },
    { type: 'simulated_attacker' as SenderAccountType, label: 'Simulated Attacker', icon: ShieldAlert, badge: 'ATTACK GENERATOR', risk: 'Critical Scams & Phishing' },
    { type: 'simulated_hacker' as SenderAccountType, label: 'Simulated Security Tester', icon: Shield, badge: 'PEN-TEST SUITE', risk: 'Manipulated Media & Deepfakes' },
  ];

  const modalities = [
    { type: 'message' as ContentType, label: 'Message / SMS', icon: MessageSquare },
    { type: 'email' as ContentType, label: 'Email', icon: Mail },
    { type: 'url' as ContentType, label: 'URL / Link', icon: Globe },
    { type: 'news' as ContentType, label: 'News Article', icon: FileText },
    { type: 'image' as ContentType, label: 'Image', icon: ImageIcon },
    { type: 'video' as ContentType, label: 'Video Stream', icon: Video },
    { type: 'profile' as ContentType, label: 'User Profile', icon: User },
    { type: 'file' as ContentType, label: 'File Attachment', icon: FileCode },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner & Academic Notice */}
      <div className="cyber-card-blue" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-blue">PLATFORM 1</span>
              <span className="badge badge-green">CONTROLLED TEST HUB</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Sender Platform & Attack Simulation Environment
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '820px', marginTop: '4px', lineHeight: '1.5' }}>
              Generate controlled, safe cybersecurity demonstration payloads across all 8 digital modalities to test the CyberShield AI detection models, risk engine, and real-time defense actions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => loadTemplate('attack')}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--color-danger)' }}
            >
              <Zap size={14} /> Quick Attack Sample
            </button>
            <button 
              onClick={() => loadTemplate('safe')}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--color-green)' }}
            >
              <CheckCircle size={14} /> Quick Safe Sample
            </button>
          </div>
        </div>
      </div>

      {/* Security Disclaimer Notice */}
      <div style={{ padding: '10px 14px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        <Shield size={16} color="var(--color-blue-light)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Controlled Simulation Environment:</strong> All sender events are synthetic test data processed within the CyberShield AI sandbox. No third-party sandboxes are bypassed.
        </span>
      </div>

      {/* Main 2-Column Responsive Workspace: Composer on Left, AI Forensic Result on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {/* LEFT COLUMN: Sender Identity & Test Content Composer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Sender Identity Selection */}
          <div className="cyber-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserX size={16} color="var(--color-warning)" />
              1. Select Sender Persona
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {senderOptions.map((opt) => (
                <div
                  key={opt.type}
                  onClick={() => {
                    setSenderType(opt.type);
                    if (opt.type === 'normal_user') setSenderName('Alice Johnson (Legitimate User)');
                    else if (opt.type === 'simulated_attacker') setSenderName('Attacker Persona (+91 98400 12345)');
                    else if (opt.type === 'fake_account') setSenderName('Bot Account @crypto_reward_99');
                    else setSenderName(`${opt.label} Persona`);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: senderType === opt.type ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    border: senderType === opt.type ? '1px solid var(--color-green)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <opt.icon size={16} color={senderType === opt.type ? 'var(--color-green)' : 'var(--text-muted)'} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{opt.risk}</div>
                    </div>
                  </div>
                  <span className={`badge ${senderType === opt.type ? 'badge-green' : 'badge-neutral'}`} style={{ fontSize: '0.58rem' }}>
                    {opt.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Modality Selection */}
          <div className="cyber-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--color-blue-light)" />
              2. Select Content Modality
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {modalities.map((m) => {
                const Icon = m.icon;
                const isSelected = contentType === m.type;
                return (
                  <button
                    key={m.type}
                    onClick={() => {
                      setContentType(m.type);
                      setAnalysisResult(null);
                      setTransferSuccess(false);
                    }}
                    className={`btn ${isSelected ? 'btn-primary-green' : 'btn-outline'}`}
                    style={{ padding: '8px 10px', fontSize: '0.75rem', justifyContent: 'flex-start' }}
                  >
                    <Icon size={14} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Content Composer Form */}
          <div className="cyber-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={16} color="var(--color-green)" />
                3. Compose Test Content
              </h3>
              <button 
                onClick={handleClearTest}
                className="btn btn-ghost" 
                style={{ fontSize: '0.72rem', padding: '2px 8px' }}
              >
                <RefreshCw size={12} /> Clear Test
              </button>
            </div>

            {formError && (
              <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', fontSize: '0.78rem', marginBottom: '14px' }}>
                {formError}
              </div>
            )}

            {/* Modality Dynamic Fields */}
            {contentType === 'message' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="cyber-label">Sender Phone / Name</label>
                  <input className="cyber-input" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
                </div>
                <div>
                  <label className="cyber-label">SMS / Message Content</label>
                  <textarea 
                    className="cyber-input" 
                    rows={4} 
                    value={messageText} 
                    onChange={(e) => setMessageText(e.target.value)} 
                    placeholder="Enter message text to analyze..."
                  />
                </div>
              </div>
            )}

            {contentType === 'email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="cyber-label">Sender Email Address</label>
                  <input className="cyber-input" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
                </div>
                <div>
                  <label className="cyber-label">Subject Header</label>
                  <input className="cyber-input" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                </div>
                <div>
                  <label className="cyber-label">Email Body Content</label>
                  <textarea className="cyber-input" rows={3} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
                </div>
                <div>
                  <label className="cyber-label">Embedded Link (Optional)</label>
                  <input className="cyber-input" value={emailLink} onChange={(e) => setEmailLink(e.target.value)} placeholder="http://..." />
                </div>
              </div>
            )}

            {contentType === 'url' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="cyber-label">Test URL / Host Target</label>
                  <input className="cyber-input" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="http://192.168.1.1/..." />
                </div>
              </div>
            )}

            {contentType === 'news' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="cyber-label">Article Headline</label>
                  <input className="cyber-input" value={newsHeadline} onChange={(e) => setNewsHeadline(e.target.value)} />
                </div>
                <div>
                  <label className="cyber-label">Article Body Text</label>
                  <textarea className="cyber-input" rows={4} value={newsText} onChange={(e) => setNewsText(e.target.value)} />
                </div>
              </div>
            )}

            {contentType === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="cyber-label">Test Image Filename</label>
                  <input className="cyber-input" value={imageName} onChange={(e) => setImageName(e.target.value)} />
                </div>
                <div>
                  <label className="cyber-label">Forensic Image Description</label>
                  <textarea className="cyber-input" rows={3} value={imageDesc} onChange={(e) => setImageDesc(e.target.value)} />
                </div>
              </div>
            )}

            {contentType === 'video' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="cyber-label">Test Video Filename</label>
                  <input className="cyber-input" value={videoName} onChange={(e) => setVideoName(e.target.value)} />
                </div>
                <div>
                  <label className="cyber-label">Video Stream Characteristics</label>
                  <textarea className="cyber-input" rows={3} value={videoDesc} onChange={(e) => setVideoDesc(e.target.value)} />
                </div>
              </div>
            )}

            {contentType === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="cyber-label">Username</label>
                  <input className="cyber-input" value={profileUsername} onChange={(e) => setProfileUsername(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="cyber-label">Followers</label>
                    <input type="number" className="cyber-input" value={profileFollowers} onChange={(e) => setProfileFollowers(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="cyber-label">Following</label>
                    <input type="number" className="cyber-input" value={profileFollowing} onChange={(e) => setProfileFollowing(Number(e.target.value))} />
                  </div>
                </div>
                <div>
                  <label className="cyber-label">Profile Biography</label>
                  <textarea className="cyber-input" rows={2} value={profileBio} onChange={(e) => setProfileBio(e.target.value)} />
                </div>
              </div>
            )}

            {contentType === 'file' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="cyber-label">Attachment Filename</label>
                  <input className="cyber-input" value={fileName} onChange={(e) => setFileName(e.target.value)} />
                </div>
                <div>
                  <label className="cyber-label">File Type Signature</label>
                  <input className="cyber-input" value={fileType} onChange={(e) => setFileType(e.target.value)} />
                </div>
              </div>
            )}

            {/* AI Analysis Trigger Button */}
            <div style={{ marginTop: '18px' }}>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn btn-primary-green"
                style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}
              >
                {analyzing ? 'Routing to CyberShield AI...' : 'Analyze with CyberShield AI'}
                {!analyzing && <Zap size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time CyberShield AI Forensic Result Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {analysisResult ? (
            <div className="cyber-card-green" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>CYBERSHIELD FORENSIC REPORT</span>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    Event ID: {lastEventId}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${analysisResult.risk_level === 'CRITICAL' ? 'badge-danger' : analysisResult.risk_level === 'HIGH' ? 'badge-warning' : analysisResult.risk_level === 'MEDIUM' ? 'badge-blue' : 'badge-green'}`}>
                    {analysisResult.risk_level} RISK ({Math.round(analysisResult.confidence * 100)}%)
                  </span>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-green)', marginTop: '2px' }}>
                    Latency: {analysisResult.processing_time_ms}ms
                  </div>
                </div>
              </div>

              {/* Classification & AI Detector */}
              <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Threat Classification:</span>
                  <strong style={{ fontSize: '0.92rem', color: analysisResult.classification === 'SAFE' ? 'var(--color-green)' : 'var(--color-danger)' }}>
                    {analysisResult.classification}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Selected AI Model:</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-blue-light)', fontFamily: 'var(--font-mono)' }}>
                    {analysisResult.model}
                  </span>
                </div>
              </div>

              {/* Explainable AI Reasons */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Explainable AI Detection Reasons:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {analysisResult.reasons.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--color-green)' }}>•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action & Dispatch */}
              <div style={{ padding: '14px', background: 'rgba(59, 130, 246, 0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.25)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Recommended Security Action:</span>
                  <span className={`badge ${analysisResult.recommendation === 'QUARANTINE' || analysisResult.recommendation === 'BLOCK' ? 'badge-danger' : analysisResult.recommendation === 'REVIEW' ? 'badge-warning' : 'badge-green'}`}>
                    {analysisResult.recommendation}
                  </span>
                </div>
              </div>

              {/* Send to Receiver Button */}
              {transferSuccess ? (
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--border-green)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-green)', fontWeight: 700, fontSize: '0.85rem' }}>
                    <CheckCircle size={16} /> Transferred to Receiver Platform Simulation
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Security event dispatched to Receiver Platform queue. CyberShield protection layer active.
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSendToReceiver}
                  className="btn btn-accent-blue"
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
                >
                  Send to Receiver Simulation <ArrowRight size={16} />
                </button>
              )}
            </div>
          ) : (
            <div className="cyber-card" style={{ padding: '36px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Zap size={22} color="var(--color-blue-light)" />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI Forensic Engine Ready</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', marginTop: '6px', lineHeight: '1.4' }}>
                Select a sender persona, configure or quick-load test content, then click "Analyze with CyberShield AI".
              </p>
            </div>
          )}

          {/* Simulated Sender History Log */}
          <div className="cyber-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={15} color="var(--color-blue-light)" />
                Recent Sender Simulation Events
              </h4>
              <span className="badge badge-neutral" style={{ fontSize: '0.62rem' }}>
                {simulatedHistory.length} Recorded
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {simulatedHistory.map((item, idx) => (
                <div key={idx} style={{ padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-blue-light)', fontWeight: 700 }}>{item.event_id}</span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.58rem' }}>{item.content_type}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.content_preview}
                    </div>
                  </div>
                  <span className={`badge ${item.ai_result?.risk_level === 'CRITICAL' ? 'badge-danger' : item.ai_result?.risk_level === 'HIGH' ? 'badge-warning' : 'badge-green'}`} style={{ fontSize: '0.6rem' }}>
                    {item.ai_result?.classification || 'ANALYZED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
