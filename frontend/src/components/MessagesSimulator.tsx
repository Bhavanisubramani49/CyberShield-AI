import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  ArrowLeft, 
  Phone, 
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
  Plus,
  MessageSquare,
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

interface MessagesSimulatorProps {
  activeUserId: string;
  isReceiverView?: boolean;
  onSelectEventDetails?: (eventId: string) => void;
}

export const MessagesSimulator: React.FC<MessagesSimulatorProps> = ({
  activeUserId = 'user-kavin',
  isReceiverView = true,
  onSelectEventDetails
}) => {
  if (!isReceiverView || onSelectEventDetails) console.log('receiverMode');
  // Navigation & Screen View
  const [activeScreen, setActiveScreen] = useState<'home' | 'chat' | 'compose'>('home');

  // Contacts & Conversations State
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('CONV-SMS-001');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);

  // Security Threat Explanations Modal State
  const [selectedThreatMessage, setSelectedThreatMessage] = useState<MessageItem | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadContacts();
    loadConversations();

    // 1.5s background polling loop
    const interval = setInterval(() => {
      loadConversations();
      if (selectedConvId) {
        loadMessages(selectedConvId);
      }
    }, 1500);

    // SSE Real-Time Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`http://127.0.0.1:8000/api/v1/conversations/stream?conversation_id=${encodeURIComponent(selectedConvId)}`);
      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type !== 'connected' && data.conversation_id === selectedConvId) {
            setMessages((prev: MessageItem[]) => {
              if (prev.some((m: MessageItem) => m.message_id === data.message_id)) return prev;
              return [...prev, data];
            });
            loadConversations();
          }
        } catch (err) {
          // Silent parse catch
        }
      };
    } catch (e) {
      console.warn('SSE stream unavailable, relying on polling fallback');
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
    const list = await fetchConversationsAPI(activeUserId, 'SMS');
    setConversations(list);
    if (list.length > 0 && !list.some((c: ConversationSummary) => c.conversation_id === selectedConvId)) {
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
      alert(`Message dispatch failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleSecurityAction = async (messageId: string, action: 'BLOCK' | 'ALLOW') => {
    try {
      await updateMessageActionAPI(messageId, action);
      setSelectedThreatMessage(null);
      await loadMessages(selectedConvId);
      await loadConversations();
    } catch (err: any) {
      alert(`Security action failed: ${err.message}`);
    }
  };

  const currentConv = conversations.find((c: ConversationSummary) => c.conversation_id === selectedConvId);
  const otherMember = currentConv?.members.find((m: any) => m.user_id !== activeUserId);
  const targetContact = contacts.find(c => c.contact_user_id === otherMember?.user_id);
  const displayPhoneNumber = targetContact?.phone_number || '+91 98765 43210';

  const filteredConversations = conversations.filter((c: ConversationSummary) => {
    const searchLower = searchTerm.toLowerCase();
    const contactInfo = contacts.find(cnt => cnt.contact_user_id === c.members.find((m: any) => m.user_id !== activeUserId)?.user_id);
    const phoneMatch = contactInfo?.phone_number.toLowerCase().includes(searchLower);
    return (
      c.title.toLowerCase().includes(searchLower) ||
      c.members.some((m: any) => m.name.toLowerCase().includes(searchLower)) ||
      Boolean(phoneMatch) ||
      (c.latest_message && c.latest_message.content.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div style={{
      width: '100%',
      maxWidth: '430px',
      height: '780px',
      margin: '0 auto',
      background: '#0a0f1d',
      borderRadius: '24px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(11, 107, 203, 0.3)',
      fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      position: 'relative'
    }}>

      {/* TOP ANDROID HEADER BAR */}
      <header style={{ background: '#0b6bcb', color: '#ffffff', padding: '12px 16px 10px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        {/* Status Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.72rem', opacity: 0.9 }}>
          <span>9:41 AM</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>5G</span>
            <span>100%</span>
          </div>
        </div>

        {activeScreen === 'home' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={22} color="#ffffff" />
                  <span>Messages</span>
                </h1>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.85)', marginTop: '2px', fontWeight: 600 }}>
                  🛡 Protected Receiver: Kavin • SMS Center
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#ffffff' }}>
                <Search size={20} style={{ cursor: 'pointer' }} />
                <MoreVertical size={20} style={{ cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ArrowLeft
                size={22}
                style={{ cursor: 'pointer', color: '#ffffff' }}
                onClick={() => setActiveScreen('home')}
              />
              <img
                src={otherMember?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Avatar"
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }}
              />
              <div>
                <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
                  {currentConv?.title || 'SMS Conversation'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)', marginTop: '2px', fontWeight: 600 }}>
                  Mobile • {displayPhoneNumber}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#ffffff' }}>
              <Phone size={19} style={{ cursor: 'pointer' }} />
              <MoreVertical size={19} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        )}
      </header>

      {/* MESSAGES HOME SCREEN */}
      {activeScreen === 'home' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0f1d', overflowY: 'auto', position: 'relative' }}>
          
          {/* Search Bar */}
          <div style={{ padding: '12px 14px 6px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', borderRadius: '24px', padding: '8px 14px', gap: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search messages & phone numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: '0.84rem', width: '100%', outline: 'none' }}
              />
            </div>
          </div>

          {/* Conversations Thread List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.map((conv: ConversationSummary) => {
              const isGroup = conv.conversation_type === 'GROUP';
              const isSelected = conv.conversation_id === selectedConvId;
              const contactInfo = contacts.find(cnt => cnt.contact_user_id === conv.members.find((m: any) => m.user_id !== activeUserId)?.user_id);
              const phone = contactInfo?.phone_number || '+91 98765 43210';
              const hasThreat = conv.threat_count > 0;

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
                    padding: '14px 16px',
                    gap: '14px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: isSelected ? 'rgba(11, 107, 203, 0.15)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={conv.members.find((m: any) => m.user_id !== activeUserId)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt="Avatar"
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isGroup ? <Users size={15} color="#38bdf8" /> : <User size={15} color="#60a5fa" />}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.title}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {conv.latest_message?.timestamp || '10:42 AM'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '2px', fontWeight: 600 }}>
                      {phone}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                        {conv.latest_message ? `${conv.latest_message.sender_id.replace('user-', '')}: ${conv.latest_message.content}` : 'Tap to message'}
                      </span>
                      {hasThreat && (
                        <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '1px 6px', borderRadius: '10px', marginLeft: '6px' }}>
                          🚨 Threat
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Action Button — Start Chat / Compose */}
          <button
            onClick={() => setActiveScreen('chat')}
            style={{
              position: 'absolute',
              bottom: '24px',
              right: '20px',
              width: '56px',
              height: '56px',
              borderRadius: '28px',
              background: '#0b6bcb',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(11, 107, 203, 0.4)',
              cursor: 'pointer'
            }}
          >
            <Plus size={24} />
          </button>
        </div>
      )}

      {/* MESSAGES CHAT SCREEN */}
      {activeScreen === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#090d16' }}>
          
          {/* Thread Scroll View */}
          <div style={{ flex: 1, padding: '14px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ alignSelf: 'center', background: '#1e293b', color: '#94a3b8', fontSize: '0.68rem', padding: '3px 12px', borderRadius: '12px', margin: '4px 0', fontWeight: 600 }}>
              Today • SMS Thread
            </div>

            {messages.map((m: MessageItem) => {
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
                  {!isOutgoing && (
                    <span style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 700, marginBottom: '2px', marginLeft: '4px' }}>
                      {m.sender_name} • {displayPhoneNumber}
                    </span>
                  )}

                  {/* Message Bubble */}
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: isOutgoing ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      background: isBlocked ? 'rgba(239, 68, 68, 0.15)' : isOutgoing ? '#0b6bcb' : '#f1f5f9',
                      border: isBlocked ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                      color: isOutgoing ? '#ffffff' : '#0f172a',
                      fontSize: '0.86rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    {isBlocked ? (
                      <div>
                        <div style={{ fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldAlert size={16} /> 🛡 SMS Message Blocked by CyberShield
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                          Quarantined threat: {m.classification} (Risk Score: {m.risk_score}/100)
                        </div>
                      </div>
                    ) : (
                      <div style={{ wordBreak: 'break-word', lineHeight: 1.35 }}>{m.content}</div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.62rem', color: isOutgoing ? 'rgba(255,255,255,0.75)' : '#64748b' }}>
                      <span>{m.timestamp}</span>
                      {isOutgoing && <CheckCheck size={14} color="#38bdf8" />}
                    </div>
                  </div>

                  {/* DANGEROUS SMS SECURITY WARNING CARD */}
                  {isDangerous && !isBlocked && (
                    <div style={{
                      marginTop: '6px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: 'rgba(239, 68, 68, 0.14)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={14} /> 🛡 CyberShield Warning: {m.classification}
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>
                          Risk {m.risk_score}/100
                        </span>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '8px', lineHeight: 1.3 }}>
                        Suspicious SMS link or urgent financial request detected.
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedThreatMessage(m)}
                          style={{
                            flex: 1,
                            padding: '6px',
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            borderRadius: '6px',
                            color: '#60a5fa',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Why is this dangerous?
                        </button>
                        <button
                          onClick={() => handleSecurityAction(m.message_id, 'BLOCK')}
                          style={{
                            padding: '6px 10px',
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          Block
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* ATTACHMENT MENU POPUP */}
          {showAttachmentMenu && (
            <div style={{ padding: '12px', background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                onClick={() => handleSend("family_vacation_photo_dsc_0842.jpg", "image")}
                style={{ padding: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#4ade80', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <ImageIcon size={18} /> Safe Photo
              </button>
              <button
                onClick={() => handleSend("doctored_payment_receipt_spliced.png", "image")}
                style={{ padding: '8px', background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#f87171', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <ImageIcon size={18} /> Tampered Image
              </button>
              <button
                onClick={() => handleSend("Annual_Security_Report.pdf", "file")}
                style={{ padding: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#60a5fa', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <FileText size={18} /> Safe PDF
              </button>
              <button
                onClick={() => handleSend("Urgent_Invoice_March2026.docm", "file")}
                style={{ padding: '8px', background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#f87171', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <FileText size={18} /> Macro Document
              </button>
              <button
                onClick={() => handleSend("http://192.168.1.10/verify-bank", "url")}
                style={{ padding: '8px', background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#f87171', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <Globe size={18} /> Phishing Link
              </button>
              <button
                onClick={() => handleSend("URGENT! Your bank account is suspended. Verify PIN at http://192.168.1.10/verify-bank", "text")}
                style={{ padding: '8px', background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#f87171', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <Sparkles size={18} /> Bank Scam
              </button>
            </div>
          )}

          {/* MESSAGES COMPOSER */}
          <div style={{ padding: '10px 12px', background: '#0a0f1d', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, background: '#1e293b', borderRadius: '24px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Smile size={20} color="#94a3b8" style={{ cursor: 'pointer' }} />
              <input
                type="text"
                placeholder="Text message (SMS)..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                style={{ flex: 1, background: 'none', border: 'none', color: '#f8fafc', fontSize: '0.88rem', outline: 'none' }}
              />
              <Paperclip
                size={20}
                color="#94a3b8"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowAttachmentMenu((prev: boolean) => !prev)}
              />
            </div>

            <button
              onClick={() => handleSend()}
              disabled={sending || !messageText.trim()}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#0b6bcb',
                border: 'none',
                color: '#ffffff',
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

      {/* THREAT DETAILS EXPLANATION MODAL */}
      {selectedThreatMessage && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            padding: '20px',
            width: '100%',
            maxWidth: '360px',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#f87171', fontSize: '0.96rem' }}>
                <ShieldAlert size={20} /> CyberShield Security Analysis
              </div>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setSelectedThreatMessage(null)} />
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Threat Category:</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f87171', marginTop: '2px' }}>
                {selectedThreatMessage.classification} ({selectedThreatMessage.risk_score}/100)
              </div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '6px' }}>
                Detector Model: <code style={{ color: '#38bdf8' }}>sms_scam_detection_ai</code>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>Detected Security Indicators:</div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.76rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {selectedThreatMessage.forensic_reasons.map((r, idx) => (
                  <li key={idx}>✓ {r}</li>
                ))}
              </ul>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.35 }}>
              "This SMS contains high-urgency language and requests sensitive verification through a suspicious link. CyberShield recommends blocking this sender."
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={() => handleSecurityAction(selectedThreatMessage.message_id, 'BLOCK')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                BLOCK MESSAGE
              </button>
              <button
                onClick={() => handleSecurityAction(selectedThreatMessage.message_id, 'ALLOW')}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
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
