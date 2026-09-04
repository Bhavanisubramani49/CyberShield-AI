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
  FileText, 
  Image as ImageIcon, 
  Globe, 
  Users, 
  User, 
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { ConversationSummary, MessageItem, UserContact } from '../types';
import { 
  fetchConversationsSenderAPI, 
  fetchConversationMessagesSenderAPI, 
  sendConversationMessageSenderAPI,
  fetchUserContactsSenderAPI
} from '../services/api';
import { useLiveClock, formatMessageTime, formatConversationDate } from '../utils/timeUtils';

interface MessagesSimulatorProps {
  activeUserId: string;
}

export const MessagesSimulator: React.FC<MessagesSimulatorProps> = ({
  activeUserId
}) => {
  const liveClock = useLiveClock();
  const [activeScreen, setActiveScreen] = useState<'home' | 'chat'>('home');

  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('CONV-SMS-001');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle browser Back button (popstate) integration
  useEffect(() => {
    const handlePopState = () => {
      setActiveScreen('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenConversation = (convId: string) => {
    setSelectedConvId(convId);
    setActiveScreen('chat');
    try {
      window.history.pushState({ screen: 'chat', convId }, '');
    } catch (e) {
      // Fallback if pushState fails
    }
  };

  const handleBackNavigation = () => {
    setActiveScreen('home');
    if (window.history.state?.screen === 'chat') {
      try {
        window.history.back();
      } catch (e) {
        // Fallback
      }
    }
  };

  useEffect(() => {
    loadContacts();
    loadConversations();

    const interval = setInterval(() => {
      loadConversations();
      if (selectedConvId) {
        loadMessages(selectedConvId);
      }
    }, 1500);

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`http://127.0.0.1:8000/api/v1/conversations/stream?conversation_id=${encodeURIComponent(selectedConvId)}&channel=SMS`);
      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type !== 'connected' && data.conversation_id === selectedConvId && (!data.channel || data.channel === 'SMS')) {
            setMessages((prev: MessageItem[]) => {
              if (prev.some((m: MessageItem) => m.message_id === data.message_id || (data.event_id && m.event_id === data.event_id))) return prev;
              return [...prev, data];
            });
            loadConversations();
          }
        } catch (err) {
          // Silent parse catch
        }
      };
    } catch (e) {
      console.warn('SSE unavailable, relying on polling fallback');
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
    const list = await fetchUserContactsSenderAPI(activeUserId);
    setContacts(list);
  };

  const loadConversations = async () => {
    const list = await fetchConversationsSenderAPI(activeUserId, 'SMS');
    setConversations(list);
    if (list.length > 0 && !list.some((c: ConversationSummary) => c.conversation_id === selectedConvId)) {
      setSelectedConvId(list[0].conversation_id);
    }
  };

  const loadMessages = async (convId: string) => {
    const msgs = await fetchConversationMessagesSenderAPI(convId);
    setMessages(msgs);
  };

  const handleSend = async (contentToSend?: string, _contentType: string = 'text') => {
    const text = contentToSend || messageText;
    if (!text.trim() || !selectedConvId || sending) return;

    setSending(true);
    try {
      await sendConversationMessageSenderAPI(selectedConvId, activeUserId, text);
      setMessageText('');
      setShowAttachmentMenu(false);
      await loadMessages(selectedConvId);
      await loadConversations();
    } catch (err: any) {
      alert(`SMS send error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const currentConv = conversations.find((c: ConversationSummary) => c.conversation_id === selectedConvId);
  const otherMember = currentConv?.members.find((m: any) => m.user_id !== activeUserId);
  const targetContact = contacts.find(c => c.contact_user_id === otherMember?.user_id);
  const displayPhoneNumber = targetContact?.phone_number || '+91 98765 43200';

  const filteredConversations = conversations.filter((c: ConversationSummary) => {
    const searchLower = searchTerm.toLowerCase();
    const contactInfo = contacts.find(cnt => cnt.contact_user_id === c.members.find((m: any) => m.user_id !== activeUserId)?.user_id);
    const phoneMatch = contactInfo?.phone_number.toLowerCase().includes(searchLower);
    return (
      c.title.toLowerCase().includes(searchLower) ||
      c.members.some((m: any) => m.name.toLowerCase().includes(searchLower)) ||
      Boolean(phoneMatch)
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

      {/* TOP HEADER */}
      <header style={{ background: '#0b6bcb', color: '#ffffff', padding: '12px 16px 10px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.72rem', opacity: 0.9 }}>
          <span>{liveClock}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>5G</span>
            <span>100%</span>
          </div>
        </div>

        {activeScreen === 'home' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={20} color="#ffffff" />
                  <span>Messages (SMS)</span>
                </h1>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginTop: '2px' }}>
                  📱 External Sender Identity: ({activeUserId})
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#ffffff' }}>
                <Search size={19} style={{ cursor: 'pointer' }} />
                <MoreVertical size={19} style={{ cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleBackNavigation}
                aria-label="Back to SMS conversation list"
                style={{
                  width: '40px',
                  height: '40px',
                  minWidth: '40px',
                  minHeight: '40px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
              >
                <ArrowLeft size={22} color="#ffffff" />
              </button>
              <img
                src={otherMember?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Avatar"
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
                  {currentConv?.title || 'SMS Chat'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)', marginTop: '2px', fontWeight: 600 }}>
                  Mobile • {displayPhoneNumber}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#ffffff' }}>
              <Phone size={18} style={{ cursor: 'pointer' }} />
              <MoreVertical size={18} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        )}
      </header>

      {/* HOME SCREEN */}
      {activeScreen === 'home' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0f1d', overflowY: 'auto' }}>
          <div style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', borderRadius: '24px', padding: '6px 12px', gap: '10px' }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search SMS conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: '0.84rem', width: '100%', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.map((conv: ConversationSummary) => {
              const isGroup = conv.conversation_type === 'GROUP';
              const isSelected = conv.conversation_id === selectedConvId;

              return (
                <div
                  key={conv.conversation_id}
                  onClick={() => handleOpenConversation(conv.conversation_id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    gap: '12px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: isSelected ? 'rgba(11, 107, 203, 0.15)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={conv.members.find((m: any) => m.user_id !== activeUserId)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt="Avatar"
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isGroup ? <Users size={14} color="#38bdf8" /> : <User size={14} color="#60a5fa" />}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.title}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {formatConversationDate(conv.latest_message?.created_at || conv.latest_message?.timestamp)}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.latest_message ? `${conv.latest_message.sender_id.replace('user-', '')}: ${conv.latest_message.content}` : 'Tap to message'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CHAT SCREEN */}
      {activeScreen === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#090d16' }}>
          <div style={{ flex: 1, padding: '12px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ alignSelf: 'center', background: '#1e293b', color: '#94a3b8', fontSize: '0.68rem', padding: '4px 12px', borderRadius: '12px', margin: '4px 0' }}>
              Today • SMS Thread
            </div>

            {messages.map((m: MessageItem) => {
              const isOutgoing = m.sender_id === activeUserId;

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
                      {m.sender_name}
                    </span>
                  )}

                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: isOutgoing ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: isOutgoing ? '#0b6bcb' : '#f1f5f9',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: isOutgoing ? '#ffffff' : '#0f172a',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ wordBreak: 'break-word' }}>{m.content}</div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.62rem', color: isOutgoing ? 'rgba(255,255,255,0.75)' : '#64748b' }}>
                      <span>{formatMessageTime(m.created_at || m.timestamp)}</span>
                      {isOutgoing && <CheckCheck size={14} color="#38bdf8" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* ATTACHMENT MENU */}
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

          {/* COMPOSER */}
          <div style={{ padding: '8px 10px', background: '#0a0f1d', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, background: '#1e293b', borderRadius: '24px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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

    </div>
  );
};
