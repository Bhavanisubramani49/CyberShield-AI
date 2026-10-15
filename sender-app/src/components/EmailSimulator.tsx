import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowLeft, 
  Paperclip, 
  Send, 
  ShieldAlert, 
  Star, 
  Inbox, 
  Send as SentIcon, 
  Plus, 
  X
} from 'lucide-react';
import { ConversationSummary, MessageItem } from '../types';
import { 
  fetchConversationsSenderAPI, 
  fetchConversationMessagesSenderAPI, 
  sendConversationMessageSenderAPI 
} from '../services/api';
import { useLiveClock, formatConversationDate } from '../utils/timeUtils';

interface EmailSimulatorProps {
  activeUserId: string;
}

const mergeAndDeduplicateMessages = (
  existing: MessageItem[], 
  incoming: MessageItem | MessageItem[]
): MessageItem[] => {
  const items = Array.isArray(incoming) ? incoming : [incoming];
  const map = new Map<string, MessageItem>();

  existing.forEach((msg) => {
    const key = msg.message_id || msg.event_id || `temp-${msg.content}`;
    map.set(key, msg);
  });

  items.forEach((msg) => {
    const key = msg.message_id || msg.event_id || `temp-${msg.content}`;
    if (map.has(key)) {
      map.set(key, { ...map.get(key)!, ...msg });
    } else {
      map.set(key, msg);
    }
  });

  return Array.from(map.values());
};

export const EmailSimulator: React.FC<EmailSimulatorProps> = ({
  activeUserId = 'user-riya'
}) => {
  const liveClock = useLiveClock();

  // Navigation & UI State
  const [activeScreen, setActiveScreen] = useState<'home' | 'thread'>('home');
  const [activeFolder, setActiveFolder] = useState<string>('inbox');

  // Data State
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('CONV-EMAIL-001');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Compose Modal State
  const [showComposeModal, setShowComposeModal] = useState<boolean>(false);
  const [composeRecipient, setComposeRecipient] = useState<string>('user-kavin');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setActiveScreen('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenThread = (convId: string) => {
    setSelectedConvId(convId);
    setActiveScreen('thread');
    try {
      window.history.pushState({ screen: 'thread', convId }, '');
    } catch (e) {
      // Fallback
    }
  };

  const handleBackNavigation = () => {
    setActiveScreen('home');
    if (window.history.state?.screen === 'thread') {
      try {
        window.history.back();
      } catch (e) {
        // Fallback
      }
    }
  };

  useEffect(() => {
    loadConversations();
  }, [activeUserId]);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
    }
  }, [selectedConvId]);

  // Real-Time SSE Stream & Polling Fallback
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('http://127.0.0.1:8000/api/v1/conversations/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.channel === 'EMAIL' || !data.channel) {
            loadConversations();
            if (data.conversation_id === selectedConvId) {
              setMessages((prev) => mergeAndDeduplicateMessages(prev, data));
            }
          }
        } catch (e) {
          console.error('Failed to process SSE message:', e);
        }
      };
    } catch (e) {
      console.warn('SSE EventSource unavailable.');
    }

    const pollInterval = setInterval(() => {
      loadConversations();
      if (selectedConvId) {
        loadMessages(selectedConvId, true);
      }
    }, 1500);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, [selectedConvId]);

  const loadConversations = async () => {
    try {
      const data = await fetchConversationsSenderAPI(activeUserId, 'EMAIL');
      setConversations(data);
    } catch (e) {
      console.error('Error loading email conversations:', e);
    }
  };

  const loadMessages = async (convId: string, silent: boolean = false) => {
    try {
      const data = await fetchConversationMessagesSenderAPI(convId);
      setMessages((prev) => {
        if (silent && JSON.stringify(prev) === JSON.stringify(data)) return prev;
        return mergeAndDeduplicateMessages([], data);
      });
    } catch (e) {
      console.error('Error loading messages:', e);
    }
  };

  const handleSendMessage = async () => {
    if (!composeBody.trim() || !selectedConvId || sending) return;
    setSending(true);

    let fullContent = composeSubject.trim()
      ? `Subject: ${composeSubject.trim()}\n\n${composeBody.trim()}`
      : composeBody.trim();

    if (selectedAttachment) {
      fullContent += `\n\n[Attachment: ${selectedAttachment}]`;
    }

    try {
      const sentMsg = await sendConversationMessageSenderAPI(selectedConvId, activeUserId, fullContent);
      setMessages((prev) => mergeAndDeduplicateMessages(prev, sentMsg));
      setComposeBody('');
      setComposeSubject('');
      setSelectedAttachment(null);
      setShowComposeModal(false);
      await loadConversations();
    } catch (e: any) {
      alert(e.message || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  const loadPresetPayload = (type: 'PHISHING' | 'SAFE') => {
    if (type === 'PHISHING') {
      setComposeSubject('URGENT: CyberShield Account Access Suspended');
      setComposeBody(
        'Dear Kavin,\n\nWe detected unauthorized login attempts on your CyberShield student portal. Your access will be suspended within 24 hours unless you re-verify your identity immediately.\n\nPlease click here to update your credentials: http://cybershield-auth-verify.com/login\n\nBest regards,\nIT Security Desk'
      );
      setSelectedAttachment('Urgent_Account_Verification.pdf');
    } else {
      setComposeSubject('CyberShield AI Project Review & Architecture Updates');
      setComposeBody(
        'Hi Kavin,\n\nI reviewed the latest code for the multi-channel defense engine. The SSE streaming and platform isolation logic look great!\n\nLet\'s schedule a brief sync tomorrow at 10 AM to discuss the final evaluation dashboard.\n\nBest,\nArun'
      );
      setSelectedAttachment('CyberShield_Architecture_v2.pdf');
    }
  };

  const currentConv = conversations.find((c) => c.conversation_id === selectedConvId);

  const filteredConversations = conversations.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const otherParticipant = c.members?.find((m) => m.user_id !== activeUserId)?.name || c.title;
    return (
      c.title.toLowerCase().includes(term) ||
      c.latest_message?.content?.toLowerCase().includes(term) ||
      otherParticipant.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '660px',
      maxHeight: '760px',
      background: 'var(--email-bg, #0a0e17)',
      color: 'var(--email-text-primary, #f8fafc)',
      borderRadius: '14px',
      border: '1px solid var(--email-border, rgba(255, 255, 255, 0.08))',
      boxShadow: 'var(--shadow-card, 0 10px 30px rgba(0, 0, 0, 0.5))',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'var(--font-sans, Segoe UI, Roboto, sans-serif)'
    }}>
      {/* Header Bar */}
      <header style={{
        height: '60px',
        background: 'var(--email-header-bg, #0c121e)',
        borderBottom: '1px solid var(--email-border, rgba(255, 255, 255, 0.08))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--email-text-primary, #f8fafc)', margin: 0, lineHeight: 1.2 }}>
                Sender Email Studio
              </h2>
              <div style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 600 }}>
                External Dispatcher
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--email-placeholder, #64748b)' }} />
            <input
              type="text"
              placeholder="Search mail by subject, recipient, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'var(--email-input-bg, #070b14)',
                border: '1px solid var(--email-border, rgba(255, 255, 255, 0.1))',
                borderRadius: '8px',
                color: 'var(--email-input-text, #f8fafc)',
                fontSize: '0.78rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--email-text-muted, #64748b)', fontFamily: 'var(--font-mono, monospace)', background: 'var(--email-bg, #0a0e17)', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--email-border)' }}>
            {liveClock}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--email-surface, #131c2e)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--email-border)' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #6366f1)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              S
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--email-text-primary, #e2e8f0)' }}>Sender App Console</span>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <aside style={{
          width: '220px',
          background: 'var(--email-sidebar-bg, #0c121e)',
          borderRight: '1px solid var(--email-border, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          flexDirection: 'column',
          padding: '14px 10px',
          gap: '14px',
          flexShrink: 0
        }}>
          <button
            onClick={() => setShowComposeModal(true)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Plus size={16} color="#ffffff" /> Compose Email
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--email-text-muted, #64748b)', padding: '0 8px', marginBottom: '4px' }}>Folders</div>
            <button
              onClick={() => { setActiveFolder('inbox'); setActiveScreen('home'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: activeFolder === 'inbox' && activeScreen === 'home' ? 700 : 500,
                color: activeFolder === 'inbox' && activeScreen === 'home' ? '#60a5fa' : 'var(--email-text-secondary, #94a3b8)',
                background: activeFolder === 'inbox' && activeScreen === 'home' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: activeFolder === 'inbox' && activeScreen === 'home' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Inbox size={15} />
                <span>Inbox</span>
              </div>
              <span style={{ fontSize: '0.68rem', background: 'var(--email-bg, #0a0e17)', color: 'var(--email-text-primary, #cbd5e1)', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
                {conversations.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveFolder('sent'); setActiveScreen('home'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: activeFolder === 'sent' ? 700 : 500,
                color: activeFolder === 'sent' ? '#818cf8' : 'var(--email-text-secondary, #94a3b8)',
                background: activeFolder === 'sent' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: activeFolder === 'sent' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SentIcon size={15} />
                <span>Sent Mail</span>
              </div>
            </button>
          </div>
        </aside>

        {/* Right Work Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--email-surface, #0f172a)' }}>
          {activeScreen === 'home' ? (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredConversations.map((conv) => {
                const otherParticipant =
                  conv.members?.find((m) => m.user_id !== activeUserId)?.name || conv.title;

                return (
                  <div
                    key={conv.conversation_id}
                    onClick={() => handleOpenThread(conv.conversation_id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--email-row-border, rgba(255, 255, 255, 0.06))',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <Star size={16} color="var(--email-text-muted, #64748b)" style={{ marginTop: '2px' }} />
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--email-surface, #131c2e)',
                      border: '1px solid var(--email-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      color: 'var(--email-text-primary, #e2e8f0)',
                      flexShrink: 0
                    }}>
                      {otherParticipant.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--email-text-primary, #f8fafc)' }}>
                          {otherParticipant}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--email-text-muted, #94a3b8)', fontFamily: 'var(--font-mono, monospace)' }}>
                          {conv.latest_message?.timestamp || formatConversationDate(conv.updated_at)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--email-text-primary, #e2e8f0)', marginTop: '2px' }}>
                        {conv.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--email-text-secondary, #94a3b8)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '3px' }}>
                        {conv.latest_message?.content || 'No preview available.'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Thread View */
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', marginBottom: '16px', borderBottom: '1px solid var(--email-border)' }}>
                <button
                  onClick={handleBackNavigation}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 14px',
                    background: 'var(--email-surface, #131c2e)',
                    border: '1px solid var(--email-border)',
                    borderRadius: '8px',
                    color: 'var(--email-text-primary, #f8fafc)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={16} color="#60a5fa" /> Back to Email List
                </button>
                <span style={{ fontSize: '0.72rem', color: 'var(--email-text-muted, #64748b)', fontFamily: 'var(--font-mono, monospace)' }}>
                  Thread ID: {selectedConvId}
                </span>
              </div>

              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--email-text-primary, #f8fafc)', marginBottom: '16px' }}>
                {currentConv?.title}
              </h1>

              {messages.map((msg) => (
                <div
                  key={msg.message_id}
                  style={{
                    background: 'var(--email-card-bg, rgba(19, 28, 46, 0.85))',
                    border: '1px solid var(--email-border)',
                    borderRadius: '12px',
                    padding: '18px',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--email-surface, #131c2e)', border: '1px solid var(--email-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--email-text-primary, #f8fafc)', fontSize: '0.85rem' }}>
                        {msg.sender_name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--email-text-primary, #f8fafc)' }}>{msg.sender_name}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--email-text-muted, #64748b)', fontFamily: 'var(--font-mono, monospace)' }}>
                          &lt;{msg.sender_id}@cybershield.ai&gt;
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--email-text-muted, #94a3b8)', fontFamily: 'var(--font-mono, monospace)' }}>
                      {msg.timestamp || 'Today'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--email-text-primary, #e2e8f0)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono, monospace)', borderTop: '1px solid var(--email-border)', paddingTop: '12px' }}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '90%',
            maxWidth: '560px',
            background: 'var(--email-modal-bg, #0f172a)',
            border: '1px solid var(--email-border-strong, rgba(255, 255, 255, 0.18))',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '14px 18px', background: 'var(--email-sidebar-bg, #0c121e)', borderBottom: '1px solid var(--email-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--email-text-primary, #f8fafc)' }}>
                <Send size={16} color="#60a5fa" />
                <span>Transmit External Email</span>
              </div>
              <button onClick={() => setShowComposeModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--email-text-muted, #94a3b8)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '8px 18px', background: 'var(--email-surface, rgba(0, 0, 0, 0.3))', borderBottom: '1px solid var(--email-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--email-text-muted, #94a3b8)' }}>Quick Test Payloads:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => loadPresetPayload('PHISHING')}
                  style={{ padding: '3px 8px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Phishing Payload
                </button>
                <button
                  onClick={() => loadPresetPayload('SAFE')}
                  style={{ padding: '3px 8px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Safe Payload
                </button>
              </div>
            </div>

            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--email-text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>To</label>
                <input
                  type="text"
                  value={composeRecipient}
                  onChange={(e) => setComposeRecipient(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--email-input-bg, #070b14)', border: '1px solid var(--email-border)', borderRadius: '8px', color: 'var(--email-input-text, #f8fafc)', fontSize: '0.8rem', fontFamily: 'var(--font-mono, monospace)', outline: 'none' }}
                  placeholder="user-kavin@cybershield.ai"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--email-text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>Subject</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--email-input-bg, #070b14)', border: '1px solid var(--email-border)', borderRadius: '8px', color: 'var(--email-input-text, #f8fafc)', fontSize: '0.8rem', outline: 'none' }}
                  placeholder="Email subject line..."
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--email-text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>Message Body</label>
                <textarea
                  rows={5}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--email-input-bg, #070b14)', border: '1px solid var(--email-border)', borderRadius: '8px', color: 'var(--email-input-text, #f8fafc)', fontSize: '0.8rem', fontFamily: 'var(--font-mono, monospace)', outline: 'none', resize: 'vertical' }}
                  placeholder="Write email content..."
                />
              </div>

              <div style={{ padding: '10px 12px', background: 'var(--email-surface, #131c2e)', border: '1px solid var(--email-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--email-text-primary, #e2e8f0)' }}>
                  <Paperclip size={15} color="#60a5fa" />
                  <span>{selectedAttachment ? selectedAttachment : 'No attachment selected'}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedAttachment('Project_Report_v2.pdf')}
                    style={{ padding: '3px 8px', background: 'var(--email-sidebar-bg, #0c121e)', border: '1px solid var(--email-border)', color: 'var(--email-text-secondary, #cbd5e1)', borderRadius: '4px', fontSize: '0.68rem', cursor: 'pointer' }}
                  >
                    + .pdf
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAttachment('Invoice_Urgent_March.docm')}
                    style={{ padding: '3px 8px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + .docm
                  </button>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 18px', background: 'var(--email-sidebar-bg, #0c121e)', borderTop: '1px solid var(--email-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setShowComposeModal(false)} style={{ padding: '7px 14px', background: 'transparent', border: 'none', color: 'var(--email-text-muted, #94a3b8)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !composeBody.trim()}
                style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: sending || !composeBody.trim() ? 0.5 : 1 }}
              >
                <Send size={14} color="#ffffff" /> {sending ? 'Transmitting...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
