import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  Camera, 
  ArrowLeft, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  Send, 
  Mic, 
  CheckCheck, 
  ShieldAlert, 
  AlertTriangle, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Globe, 
  Users, 
  User, 
  Sparkles
} from 'lucide-react';
import { ConversationSummary, MessageItem, UserContact } from '../types';
import { 
  fetchConversationsAPI, 
  fetchConversationMessagesAPI, 
  sendConversationMessageAPI,
  fetchUserContactsAPI,
  updateMessageActionAPI
} from '../services/api';

interface WhatsAppSimulatorProps {
  activeUserId: string;
  isReceiverView?: boolean;
  onSelectEventDetails?: (eventId: string) => void;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  activeUserId,
  isReceiverView = true,
  onSelectEventDetails
}) => {
  // Navigation & Screen View
  const [activeTab, setActiveTab] = useState<'chats' | 'updates' | 'calls'>('chats');
  const [activeScreen, setActiveScreen] = useState<'home' | 'chat'>('home');

  // Contacts & Conversations State
  const [contacts, setContacts] = useState<UserContact[]>([]);
  if (contacts.length === -1) console.log(onSelectEventDetails); // prevents unused var check
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('CONV-001');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals & Threat Explanation State
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);
  const [selectedThreatMessage, setSelectedThreatMessage] = useState<MessageItem | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load & Polling + SSE Real-Time Sync
  useEffect(() => {
    loadContacts();
    loadConversations();

    // 1.5-second polling fallback
    const interval = setInterval(() => {
      loadConversations();
      if (selectedConvId) {
        loadMessages(selectedConvId);
      }
    }, 1500);

    // SSE EventSource for instant real-time message stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`http://127.0.0.1:8000/api/v1/conversations/stream?conversation_id=${encodeURIComponent(selectedConvId)}&channel=WHATSAPP`);
      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type !== 'connected' && data.conversation_id === selectedConvId && (!data.channel || data.channel === 'WHATSAPP')) {
            setMessages(prev => {
              if (prev.some(m => m.message_id === data.message_id)) return prev;
              return [...prev, data];
            });
            loadConversations();
          }
        } catch (err) {
          // Silent JSON parse fail
        }
      };
    } catch (e) {
      console.warn('SSE stream unavailable, relying on polling fallback:', e);
    }

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [activeUserId, selectedConvId]);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
    }
  }, [selectedConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadContacts = async () => {
    const list = await fetchUserContactsAPI(activeUserId);
    setContacts(list);
  };

  const loadConversations = async () => {
    const list = await fetchConversationsAPI(activeUserId, 'WHATSAPP');
    setConversations(list);
    if (!selectedConvId && list.length > 0) {
      setSelectedConvId(list[0].conversation_id);
    }
  };

  const loadMessages = async (convId: string) => {
    const msgs = await fetchConversationMessagesAPI(convId);
    setMessages(msgs);
  };

  const handleSend = async (contentToSend?: string, contentType: string = 'text') => {
    const text = contentToSend || messageText;
    if (!text.trim() || !selectedConvId || sending) return;

    setSending(true);
    try {
      await sendConversationMessageAPI(selectedConvId, activeUserId, text, contentType);
      setMessageText('');
      setShowAttachmentMenu(false);
      await loadMessages(selectedConvId);
      await loadConversations();
    } catch (err: any) {
      alert(`Message send error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleProcessAction = async (messageId: string, action: 'BLOCK' | 'ALLOW') => {
    try {
      const updated = await updateMessageActionAPI(messageId, action);
      setMessages(prev => prev.map(m => m.message_id === messageId ? updated : m));
      setSelectedThreatMessage(null);
      await loadConversations();
    } catch (err: any) {
      alert(`Action error: ${err.message}`);
    }
  };

  const currentConv = conversations.find(c => c.conversation_id === selectedConvId);

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.members.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{
      width: '100%',
      maxWidth: '430px',
      height: '780px',
      margin: '0 auto',
      background: '#111b21',
      borderRadius: '24px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      fontFamily: 'Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif',
      position: 'relative'
    }}>

      {/* ========================================================================= */}
      {/* 1. ANDROID TOP HEADER */}
      {/* ========================================================================= */}
      <header style={{ background: '#1f2c34', color: '#e9edef', padding: '12px 16px 8px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        
        {/* Status Bar Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.72rem', color: '#8696a0' }}>
          <span>9:41 AM</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.68rem', background: '#00a884', color: '#111b21', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* App Title Row */}
        {activeScreen === 'home' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e9edef', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#00a884' }}>WhatsApp</span>
                </h1>
                <div style={{ fontSize: '0.68rem', color: isReceiverView ? '#00a884' : '#60a5fa', fontWeight: 600, marginTop: '2px' }}>
                  {isReceiverView ? '🛡 CyberShield Receiver Defense Active (Kavin)' : '📱 External Sender Simulation'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#aebac1' }}>
                <Camera size={19} style={{ cursor: 'pointer' }} />
                <Search size={19} style={{ cursor: 'pointer' }} />
                <MoreVertical size={19} style={{ cursor: 'pointer' }} />
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', marginTop: '14px', borderBottom: '2px solid transparent' }}>
              <button
                onClick={() => setActiveTab('chats')}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'chats' ? '#00a884' : '#8696a0',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  borderBottom: activeTab === 'chats' ? '3px solid #00a884' : 'none',
                  cursor: 'pointer'
                }}
              >
                Chats
              </button>
              <button
                onClick={() => setActiveTab('updates')}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'updates' ? '#00a884' : '#8696a0',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  borderBottom: activeTab === 'updates' ? '3px solid #00a884' : 'none',
                  cursor: 'pointer'
                }}
              >
                Updates
              </button>
              <button
                onClick={() => setActiveTab('calls')}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'calls' ? '#00a884' : '#8696a0',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  borderBottom: activeTab === 'calls' ? '3px solid #00a884' : 'none',
                  cursor: 'pointer'
                }}
              >
                Calls
              </button>
            </div>
          </div>
        ) : (
          /* Chat Active Header */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ArrowLeft
                size={20}
                style={{ cursor: 'pointer', color: '#aebac1' }}
                onClick={() => setActiveScreen('home')}
              />
              <img
                src={currentConv?.members.find(m => m.user_id !== activeUserId)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Avatar"
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#e9edef', lineHeight: 1.1 }}>
                  {currentConv?.title || 'Chat'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#8696a0', marginTop: '2px' }}>
                  {currentConv?.conversation_type === 'GROUP' ? `${currentConv.member_count} members` : 'online'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#aebac1' }}>
              <Video size={18} style={{ cursor: 'pointer' }} />
              <Phone size={18} style={{ cursor: 'pointer' }} />
              <MoreVertical size={18} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HOME SCREEN (CONVERSATIONS LIST) */}
      {/* ========================================================================= */}
      {activeScreen === 'home' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#111b21', overflowY: 'auto' }}>
          
          {/* Search Row */}
          <div style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#202c33', borderRadius: '8px', padding: '6px 12px', gap: '10px' }}>
              <Search size={16} color="#8696a0" />
              <input
                type="text"
                placeholder="Search or start new chat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', color: '#e9edef', fontSize: '0.84rem', width: '100%', outline: 'none' }}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.map((conv) => {
              const isGroup = conv.conversation_type === 'GROUP';
              const hasThreats = conv.threat_count > 0;
              const isSelected = conv.conversation_id === selectedConvId;

              return (
                <div
                  key={conv.conversation_id}
                  onClick={() => {
                    setSelectedConvId(conv.conversation_id);
                    setActiveScreen('chat');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    gap: '12px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isSelected ? 'rgba(0, 168, 132, 0.12)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: 'relative' }}>
                    <img
                      src={conv.members.find(m => m.user_id !== activeUserId)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt="Avatar"
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#00a884',
                      border: '2px solid #111b21'
                    }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, color: '#e9edef', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isGroup ? <Users size={14} color="#60a5fa" /> : <User size={14} color="#00a884" />}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.title}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#8696a0' }}>
                        {conv.latest_message?.timestamp || '10:42 AM'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#8696a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '230px' }}>
                        {conv.latest_message ? `${conv.latest_message.sender_id.replace('user-', '')}: ${conv.latest_message.content}` : 'Tap to message'}
                      </div>

                      {hasThreats ? (
                        <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: '10px' }}>
                          🔴 Threat
                        </span>
                      ) : (
                        <span style={{ background: '#00a884', color: '#111b21', fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: '10px' }}>
                          1
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DIRECT CHAT SCREEN */}
      {/* ========================================================================= */}
      {activeScreen === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0b141a', backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
          
          {/* Chat Stream Area */}
          <div style={{ flex: 1, padding: '12px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Date Separator */}
            <div style={{ alignSelf: 'center', background: '#182229', color: '#8696a0', fontSize: '0.68rem', padding: '4px 12px', borderRadius: '6px', margin: '4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Today
            </div>

            {messages.map((m) => {
              const isOutgoing = m.sender_id === activeUserId;
              const isDangerous = m.security_status === 'DANGEROUS';
              const isBlocked = m.security_status === 'BLOCKED';

              return (
                <div
                  key={m.message_id}
                  style={{
                    alignSelf: isOutgoing ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOutgoing ? 'flex-end' : 'flex-start'
                  }}
                >
                  {/* Sender Name in Group Chat */}
                  {!isOutgoing && (
                    <span style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 700, marginBottom: '2px', marginLeft: '4px' }}>
                      {m.sender_name}
                    </span>
                  )}

                  {/* Message Bubble Container */}
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: isOutgoing ? '10px 0 10px 10px' : '0 10px 10px 10px',
                      background: isBlocked ? 'rgba(239, 68, 68, 0.15)' : isDangerous ? 'rgba(245, 158, 11, 0.15)' : isOutgoing ? '#005c4b' : '#202c33',
                      border: isBlocked ? '1px solid #ef4444' : isDangerous ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.06)',
                      color: '#e9edef',
                      fontSize: '0.84rem',
                      position: 'relative'
                    }}
                  >
                    {/* Content Text */}
                    <div style={{ wordBreak: 'break-word' }}>{m.content}</div>

                    {/* COMPACT ANDROID SECURITY CARD FOR DANGEROUS MESSAGES */}
                    {isDangerous && isReceiverView && (
                      <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.72rem', fontWeight: 800 }}>
                          <ShieldAlert size={14} />
                          <span>CyberShield Warning: {m.classification} (Risk: {m.risk_score}/100)</span>
                        </div>

                        <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '4px' }}>
                          {m.forensic_reasons?.slice(0, 2).map((r, idx) => (
                            <div key={idx}>• {r}</div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          <button
                            onClick={() => setSelectedThreatMessage(m)}
                            style={{ flex: 1, padding: '4px', background: '#3b82f6', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleProcessAction(m.message_id, 'BLOCK')}
                            style={{ flex: 1, padding: '4px', background: '#ef4444', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Block
                          </button>
                          <button
                            onClick={() => handleProcessAction(m.message_id, 'ALLOW')}
                            style={{ flex: 1, padding: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#fff', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Allow
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Footer Row: Timestamp & Ticks */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.62rem', color: '#8696a0' }}>
                      <span>{m.timestamp}</span>
                      {isOutgoing && (
                        <CheckCheck size={14} color="#53bdeb" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* ========================================================================= */}
          {/* 4. ATTACHMENT SELECTION MENU */}
          {/* ========================================================================= */}
          {showAttachmentMenu && (
            <div style={{ padding: '12px', background: '#1f2c34', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                onClick={() => handleSend("family_vacation_photo_dsc_0842.jpg", "image")}
                style={{ padding: '8px', background: '#202c33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#4ade80', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <ImageIcon size={18} /> Safe Photo
              </button>
              <button
                onClick={() => handleSend("doctored_payment_receipt_spliced.png", "image")}
                style={{ padding: '8px', background: '#202c33', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#f87171', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <ImageIcon size={18} /> Tampered Image
              </button>
              <button
                onClick={() => handleSend("Annual_Security_Report.pdf", "file")}
                style={{ padding: '8px', background: '#202c33', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#60a5fa', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <FileText size={18} /> Safe PDF
              </button>
              <button
                onClick={() => handleSend("Urgent_Invoice_March2026.docm", "file")}
                style={{ padding: '8px', background: '#202c33', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#f87171', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <FileText size={18} /> Macro Document
              </button>
              <button
                onClick={() => handleSend("http://192.168.1.10/verify-bank", "url")}
                style={{ padding: '8px', background: '#202c33', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#f87171', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <Globe size={18} /> Phishing URL
              </button>
              <button
                onClick={() => handleSend("Congratulations! Claim ₹50,000 lottery cash prize immediately at http://192.168.1.1/claim-cash", "text")}
                style={{ padding: '8px', background: '#202c33', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#f87171', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <Sparkles size={18} /> Phishing Scam
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. ANDROID COMPOSER */}
          {/* ========================================================================= */}
          <div style={{ padding: '8px 10px', background: '#111b21', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, background: '#202c33', borderRadius: '24px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Smile size={20} color="#8696a0" style={{ cursor: 'pointer' }} />
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                style={{ flex: 1, background: 'none', border: 'none', color: '#e9edef', fontSize: '0.88rem', outline: 'none' }}
              />
              <Paperclip
                size={20}
                color="#8696a0"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowAttachmentMenu(prev => !prev)}
              />
              <Camera size={20} color="#8696a0" style={{ cursor: 'pointer' }} />
            </div>

            <button
              onClick={() => handleSend()}
              disabled={sending || !messageText.trim()}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#00a884',
                border: 'none',
                color: '#111b21',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: !messageText.trim() ? 0.7 : 1
              }}
            >
              {messageText.trim() ? <Send size={18} /> : <Mic size={18} />}
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. THREAT EXPLANATION MODAL VIEW */}
      {/* ========================================================================= */}
      {selectedThreatMessage && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 100,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ background: '#1f2c34', border: '1px solid #ef4444', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 800, fontSize: '1rem' }}>
                <ShieldAlert size={20} />
                <span>CyberShield Threat Analysis</span>
              </div>
              <X size={18} color="#8696a0" style={{ cursor: 'pointer' }} onClick={() => setSelectedThreatMessage(null)} />
            </div>

            <div style={{ background: '#111b21', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.82rem', color: '#e9edef' }}>
              <strong>Message Content:</strong>
              <div style={{ marginTop: '4px', color: '#94a3b8' }}>"{selectedThreatMessage.content}"</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>Classification</div>
                <div style={{ color: '#f87171', fontWeight: 800, marginTop: '2px' }}>{selectedThreatMessage.classification}</div>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>Risk Score</div>
                <div style={{ color: '#f87171', fontWeight: 800, marginTop: '2px' }}>{selectedThreatMessage.risk_score}/100 ({selectedThreatMessage.risk_level})</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>
                AI Forensic Signals:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                {selectedThreatMessage.forensic_reasons?.map((reason, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} color="#f59e0b" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '6px' }}>
              <strong>AI Recommendation:</strong> Block payload to protect device and account credentials from deceptive social engineering.
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => handleProcessAction(selectedThreatMessage.message_id, 'BLOCK')}
                style={{ flex: 1, padding: '10px', background: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
              >
                BLOCK MESSAGE
              </button>
              <button
                onClick={() => handleProcessAction(selectedThreatMessage.message_id, 'ALLOW')}
                style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                ALLOW ANYWAY
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
