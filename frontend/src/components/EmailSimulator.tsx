import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowLeft, 
  Paperclip, 
  Send, 
  ShieldAlert, 
  AlertTriangle, 
  X, 
  Star, 
  Inbox, 
  Send as SentIcon, 
  Plus, 
  Reply, 
  Forward, 
  Ban, 
  ShieldCheck, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { UserProfile, ConversationSummary, MessageItem } from '../types';
import { getActiveUser } from '../services/auth';
import { 
  fetchConversationsAPI, 
  fetchConversationMessagesAPI, 
  sendConversationMessageAPI, 
  fetchUserContactsAPI, 
  updateMessageActionAPI 
} from '../services/api';
import { useLiveClock, formatConversationDate } from '../utils/timeUtils';

interface EmailSimulatorProps {
  activeUserId?: string;
  currentUser?: UserProfile | null;
  isReceiverView?: boolean;
  onSelectEventDetails?: (eventId: string) => void;
}

// Utility: Centralized Message Event Deduplication
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
  activeUserId,
  currentUser,
  isReceiverView = true,
  onSelectEventDetails
}) => {
  const currentAuthUser = currentUser || getActiveUser();
  const effectiveUserId = activeUserId || currentAuthUser.id;
  const accountOwnerName = currentAuthUser.fullName;

  const liveClock = useLiveClock();
  if (!isReceiverView || onSelectEventDetails) {
    // Retain prop interface compatibility
  }

  // Navigation & UI View State
  const [activeScreen, setActiveScreen] = useState<'home' | 'thread'>('home');
  const [activeFolder, setActiveFolder] = useState<string>('inbox');
  const [activeCategory, setActiveCategory] = useState<'primary' | 'promotions' | 'social' | 'updates'>('primary');

  // Data State
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('CONV-EMAIL-001');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set(['CONV-EMAIL-002']));

  // Compose Modal State
  const [showComposeModal, setShowComposeModal] = useState<boolean>(false);
  const [composeRecipient, setComposeRecipient] = useState<string>('user-riya');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  const [showCcBcc, setShowCcBcc] = useState<boolean>(false);
  const [ccField, setCcField] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  // Security & Threat Details Modal State
  const [selectedThreatMessage, setSelectedThreatMessage] = useState<MessageItem | null>(null);
  const [blockToast, setBlockToast] = useState<string | null>(null);

  // Synchronize browser history for Back button handling
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
    loadContacts();
    loadConversations();
  }, [effectiveUserId]);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
    }
  }, [selectedConvId]);

  // Real-Time SSE Stream & 1.5s Polling Fallback
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
          console.error('Failed to process SSE email message:', e);
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

  const loadContacts = async () => {
    try {
      await fetchUserContactsAPI(effectiveUserId);
    } catch (e) {
      console.error('Error loading contacts:', e);
    }
  };

  const loadConversations = async () => {
    try {
      const data = await fetchConversationsAPI(effectiveUserId, 'EMAIL');
      setConversations(data);
    } catch (e) {
      console.error('Error loading email conversations:', e);
    }
  };

  const loadMessages = async (convId: string, silent: boolean = false) => {
    try {
      const data = await fetchConversationMessagesAPI(convId);
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
      const sentMsg = await sendConversationMessageAPI(selectedConvId, effectiveUserId, fullContent);
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

  const handleUpdateSecurityAction = async (msgId: string, action: 'BLOCK' | 'ALLOW') => {
    try {
      const updatedMsg = await updateMessageActionAPI(msgId, action);
      setMessages((prev) => prev.map((m) => (m.message_id === msgId ? updatedMsg : m)));
      setBlockToast(
        action === 'BLOCK'
          ? '🛡 Sender blocked and email quarantined by CyberShield AI'
          : '✅ Email allowed and marked safe'
      );
      setTimeout(() => setBlockToast(null), 4000);
      setSelectedThreatMessage(null);
    } catch (e: any) {
      alert(e.message || 'Failed to update security action');
    }
  };

  const toggleStar = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(convId)) next.delete(convId);
      else next.add(convId);
      return next;
    });
  };

  const loadPresetPayload = (type: 'PHISHING' | 'SAFE') => {
    if (type === 'PHISHING') {
      setComposeSubject('URGENT: Verify Your CyberShield Banking Credentials');
      setComposeBody(
        'Dear Valued Student,\n\nWe detected suspicious login activity from IP address 192.168.1.1. Your CyberShield account balance & portal access will be suspended within 2 hours.\n\nPlease click here immediately to re-verify your password and identity: http://cybershield-auth-verify.com/login\n\nSecurity Desk Support'
      );
      setSelectedAttachment('Urgent_Account_Verification.pdf');
    } else {
      setComposeSubject('Project Architecture Review & Deployment Sync');
      setComposeBody(
        `Hi ${accountOwnerName},\n\nPlease review the attached architecture documentation for the CyberShield multi-channel security engine. Everything looks clean and ready for deployment.\n\nBest,\nArun`
      );
      setSelectedAttachment('CyberShield_Architecture_v2.pdf');
    }
  };

  const currentConv = conversations.find((c) => c.conversation_id === selectedConvId);

  const filteredConversations = conversations.filter((c) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const otherParticipant = c.members?.find((m) => m.user_id !== activeUserId)?.name || c.title;
      const matchesSearch =
        c.title.toLowerCase().includes(term) ||
        c.latest_message?.content?.toLowerCase().includes(term) ||
        otherParticipant.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    if (activeFolder === 'starred') {
      return starredIds.has(c.conversation_id);
    }
    if (activeFolder === 'spam') {
      return (
        c.latest_message?.classification === 'PHISHING' ||
        c.latest_message?.security_status === 'DANGEROUS' ||
        c.title.toLowerCase().includes('urgent') ||
        c.title.toLowerCase().includes('security alert')
      );
    }
    if (activeFolder === 'sent') {
      return c.latest_message?.sender_id === activeUserId;
    }

    return true;
  });

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '660px',
      maxHeight: '760px',
      background: 'var(--email-bg, #0a0e17)',
      color: 'var(--email-text-primary, #f8fafc)',
      borderRadius: 'var(--radius-lg, 14px)',
      border: '1px solid var(--email-border, rgba(255, 255, 255, 0.08))',
      boxShadow: 'var(--shadow-card, 0 10px 30px rgba(0, 0, 0, 0.5))',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'var(--font-main, Segoe UI, Roboto, sans-serif)'
    }}>

      {/* Toast Notification */}
      {blockToast && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 100,
          background: 'var(--email-card-bg, #131c2e)',
          border: '1px solid var(--border-green, #10b981)',
          color: 'var(--email-text-primary, #ffffff)',
          padding: '12px 18px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.85rem'
        }}>
          <ShieldAlert size={18} color="#f59e0b" />
          <span>{blockToast}</span>
        </div>
      )}

      {/* Top Application Header Bar */}
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
          {/* Logo & Platform Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ea4335, #fbbc05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(234, 67, 53, 0.3)'
            }}>
              <ShieldAlert size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--email-text-primary, #f8fafc)', margin: 0, lineHeight: 1.2 }}>
                CyberShield Mail
              </h2>
              <div style={{ fontSize: '0.68rem', color: 'var(--color-green, #10b981)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                AI Protection Active
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--email-placeholder, #64748b)' }} />
            <input
              type="text"
              placeholder="Search mail by subject, sender, body or label..."
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

        {/* Right Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--email-text-muted, #64748b)', fontFamily: 'var(--font-mono, monospace)', background: 'var(--email-bg, #0a0e17)', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--email-border)' }}>
            {liveClock}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--email-surface, #131c2e)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--email-border)' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {accountOwnerName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--email-text-primary, #e2e8f0)' }}>{accountOwnerName} (Receiver)</span>
          </div>
        </div>
      </header>

      {/* Main Gmail Layout Container */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar / Folder Drawer */}
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
          {/* Compose Button */}
          <button
            onClick={() => setShowComposeModal(true)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
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
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
            }}
          >
            <Plus size={16} color="#ffffff" /> Compose Email
          </button>

          {/* Folders List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--email-text-muted, #64748b)', padding: '0 8px', marginBottom: '4px' }}>
              Folders
            </div>

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
                color: activeFolder === 'inbox' && activeScreen === 'home' ? 'var(--color-green, #10b981)' : 'var(--email-text-secondary, #94a3b8)',
                background: activeFolder === 'inbox' && activeScreen === 'home' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                border: activeFolder === 'inbox' && activeScreen === 'home' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
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
              onClick={() => { setActiveFolder('starred'); setActiveScreen('home'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: activeFolder === 'starred' ? 700 : 500,
                color: activeFolder === 'starred' ? '#fbbf24' : 'var(--email-text-secondary, #94a3b8)',
                background: activeFolder === 'starred' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                border: activeFolder === 'starred' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={15} />
                <span>Starred</span>
              </div>
              <span style={{ fontSize: '0.68rem', background: 'var(--email-bg, #0a0e17)', color: 'var(--email-text-primary, #cbd5e1)', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
                {starredIds.size}
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
                color: activeFolder === 'sent' ? '#60a5fa' : 'var(--email-text-secondary, #94a3b8)',
                background: activeFolder === 'sent' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: activeFolder === 'sent' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SentIcon size={15} />
                <span>Sent Mail</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveFolder('spam'); setActiveScreen('home'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: activeFolder === 'spam' ? 700 : 500,
                color: activeFolder === 'spam' ? '#ef4444' : 'var(--email-text-secondary, #94a3b8)',
                background: activeFolder === 'spam' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                border: activeFolder === 'spam' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={15} color="#ef4444" />
                <span>Spam & Threats</span>
              </div>
              <span style={{ fontSize: '0.62rem', background: 'rgba(239, 68, 68, 0.25)', color: '#ef4444', padding: '1px 5px', borderRadius: '6px', fontWeight: 800 }}>
                AI Active
              </span>
            </button>
          </div>

          {/* Categories Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '10px', borderTop: '1px solid var(--email-border, rgba(255, 255, 255, 0.08))' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--email-text-muted, #64748b)', padding: '0 8px', marginBottom: '4px' }}>
              Categories
            </div>
            {(['primary', 'promotions', 'social', 'updates'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setActiveScreen('home'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  textTransform: 'capitalize',
                  fontWeight: activeCategory === cat ? 700 : 500,
                  color: activeCategory === cat ? 'var(--color-green, #10b981)' : 'var(--email-text-secondary, #94a3b8)',
                  background: activeCategory === cat ? 'var(--email-surface-hover, #131c2e)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Tag size={13} />
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {/* CyberShield Protection Footer Pill */}
          <div style={{
            marginTop: 'auto',
            background: 'var(--email-surface, #131c2e)',
            border: '1px solid var(--border-green, rgba(16, 185, 129, 0.3))',
            borderRadius: '10px',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-green, #10b981)' }}>
              <ShieldCheck size={15} />
              <span>Phishing Shield ACTIVE</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--email-text-muted, #94a3b8)', lineHeight: 1.3 }}>
              Real-time deep neural link verification & attachment quarantine active.
            </div>
          </div>
        </aside>

        {/* Right Email Work Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--email-surface, #0f172a)' }}>
          {activeScreen === 'home' ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Category Tabs Header */}
              <div style={{
                display: 'flex',
                background: 'var(--email-sidebar-bg, #0c121e)',
                borderBottom: '1px solid var(--email-border, rgba(255, 255, 255, 0.08))',
                padding: '0 14px'
              }}>
                {(['primary', 'promotions', 'social', 'updates'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '10px 16px',
                      fontSize: '0.78rem',
                      fontWeight: activeCategory === cat ? 700 : 500,
                      textTransform: 'capitalize',
                      color: activeCategory === cat ? 'var(--color-green, #10b981)' : 'var(--email-text-secondary, #94a3b8)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeCategory === cat ? '2px solid var(--color-green, #10b981)' : '2px solid transparent',
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Email List */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredConversations.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--email-text-muted, #64748b)' }}>
                    <Inbox size={36} style={{ opacity: 0.4, marginBottom: '10px' }} />
                    <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>No emails found in this view.</div>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const otherParticipant =
                      conv.members?.find((m) => m.user_id !== activeUserId)?.name || conv.title;
                    const isPhishing =
                      conv.latest_message?.classification === 'PHISHING' ||
                      conv.latest_message?.security_status === 'DANGEROUS' ||
                      conv.latest_message?.content?.toLowerCase().includes('http') ||
                      conv.title.toLowerCase().includes('urgent') ||
                      conv.title.toLowerCase().includes('security alert');
                    const isStarred = starredIds.has(conv.conversation_id);

                    return (
                      <div
                        key={conv.conversation_id}
                        onClick={() => handleOpenThread(conv.conversation_id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--email-row-border, rgba(255, 255, 255, 0.06))',
                          borderLeft: isPhishing ? '4px solid #ef4444' : '4px solid transparent',
                          background: isPhishing ? 'var(--email-threat-bg, rgba(239, 68, 68, 0.05))' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* Star Button */}
                        <button
                          onClick={(e) => toggleStar(conv.conversation_id, e)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '2px', color: isStarred ? '#fbbf24' : 'var(--email-text-muted, #64748b)' }}
                        >
                          <Star size={16} fill={isStarred ? '#fbbf24' : 'none'} />
                        </button>

                        {/* Avatar */}
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

                        {/* Email Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--email-text-primary, #f8fafc)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {otherParticipant}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--email-text-muted, #64748b)', fontFamily: 'var(--font-mono, monospace)' }}>
                                &lt;{otherParticipant.toLowerCase().replace(/\s+/g, '')}@cybershield.ai&gt;
                              </span>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--email-text-muted, #94a3b8)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono, monospace)', marginLeft: '8px' }}>
                              {conv.latest_message?.timestamp || formatConversationDate(conv.updated_at)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--email-text-primary, #e2e8f0)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {conv.title}
                            </span>
                            {isPhishing && (
                              <span style={{ fontSize: '0.62rem', fontWeight: 800, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '1px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                <ShieldAlert size={11} /> ⚠ PHISHING (Risk: {conv.latest_message?.risk_score || 94}/100)
                              </span>
                            )}
                            {conv.title.toLowerCase().includes('architecture') && (
                              <span style={{ fontSize: '0.65rem', background: 'var(--email-surface, #131c2e)', color: 'var(--email-text-secondary, #94a3b8)', padding: '1px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Paperclip size={11} /> Attachment
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.74rem', color: 'var(--email-text-secondary, #94a3b8)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '3px' }}>
                            {conv.latest_message?.content || 'No body preview available.'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Reading View / Email Thread */
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {/* Back to Inbox Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', marginBottom: '16px', borderBottom: '1px solid var(--email-border, rgba(255, 255, 255, 0.08))' }}>
                <button
                  onClick={handleBackNavigation}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 14px',
                    background: 'var(--email-surface, #131c2e)',
                    border: '1px solid var(--email-border, rgba(255, 255, 255, 0.12))',
                    borderRadius: '8px',
                    color: 'var(--email-text-primary, #f8fafc)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={16} color="var(--color-green, #10b981)" /> Back to Inbox
                </button>

                <div style={{ fontSize: '0.72rem', color: 'var(--email-text-muted, #64748b)', fontFamily: 'var(--font-mono, monospace)' }}>
                  Thread ID: {selectedConvId}
                </div>
              </div>

              {/* Subject Title */}
              <div style={{ marginBottom: '18px' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--email-text-primary, #f8fafc)', margin: 0, lineHeight: 1.3 }}>
                  {currentConv?.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-green, #34d399)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                    Inbox
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--email-text-muted, #94a3b8)' }}>
                    Category: {activeCategory}
                  </span>
                </div>
              </div>

              {/* Thread Messages */}
              {messages.map((msg) => {
                const isThreat = msg.security_status === 'DANGEROUS' || msg.classification === 'PHISHING';

                return (
                  <div
                    key={msg.message_id}
                    style={{
                      background: 'var(--email-card-bg, rgba(19, 28, 46, 0.85))',
                      border: '1px solid var(--email-border, rgba(255, 255, 255, 0.08))',
                      borderRadius: '12px',
                      padding: '18px',
                      marginBottom: '16px',
                      boxShadow: 'var(--shadow-card)'
                    }}
                  >
                    {/* Message Sender Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--email-surface, #131c2e)', border: '1px solid var(--email-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--email-text-primary, #f8fafc)', fontSize: '0.85rem' }}>
                          {msg.sender_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--email-text-primary, #f8fafc)' }}>{msg.sender_name}</strong>
                            <span style={{ fontSize: '0.72rem', color: 'var(--email-text-muted, #64748b)', fontFamily: 'var(--font-mono, monospace)' }}>
                              &lt;{msg.sender_id}@cybershield.ai&gt;
                            </span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--email-text-muted, #94a3b8)' }}>to me ({accountOwnerName})</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--email-text-muted, #94a3b8)', fontFamily: 'var(--font-mono, monospace)' }}>
                        {msg.timestamp || 'Today'}
                      </span>
                    </div>

                    {/* Threat Warning Banner */}
                    {isThreat && (
                      <div style={{
                        background: 'var(--email-threat-bg, rgba(239, 68, 68, 0.12))',
                        border: '1px solid var(--email-threat-border, rgba(239, 68, 68, 0.4))',
                        borderRadius: '10px',
                        padding: '14px',
                        marginBottom: '14px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--email-threat-text, #ef4444)', fontWeight: 700, fontSize: '0.82rem' }}>
                            <ShieldAlert size={18} color="#ef4444" />
                            <span>🛡 CyberShield Threat Warning: PHISHING DETECTED (Risk Score: {msg.risk_score}/100)</span>
                          </div>
                          <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                            {msg.classification}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.76rem', color: 'var(--email-threat-text, #fee2e2)', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                          Suspicious login URL detected. Urgency-based language detected. Possible credential harvesting attempt.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => setSelectedThreatMessage(msg)}
                            style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <AlertCircle size={14} color="#ffffff" /> Why is this dangerous?
                          </button>
                          {msg.security_status !== 'BLOCKED' ? (
                            <button
                              onClick={() => handleUpdateSecurityAction(msg.message_id, 'BLOCK')}
                              style={{ padding: '6px 12px', background: 'var(--email-surface, #131c2e)', color: 'var(--email-text-primary, #fff)', border: '1px solid var(--email-border)', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Block Sender
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Ban size={14} /> Sender Blocked
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Email Body Content */}
                    <div style={{ fontSize: '0.82rem', color: 'var(--email-text-primary, #e2e8f0)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono, monospace)', borderTop: '1px solid var(--email-border)', paddingTop: '12px' }}>
                      {msg.content}
                    </div>

                    {/* Attachment Section */}
                    {msg.content.includes('[Attachment:') && (
                      <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--email-surface, #131c2e)', border: '1px solid var(--email-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Paperclip size={16} color="var(--color-green, #10b981)" />
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--email-text-primary, #f8fafc)' }}>
                              {msg.content.match(/\[Attachment:\s*([^\]]+)\]/)?.[1] || 'Attachment'}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--email-text-muted, #94a3b8)' }}>Scanned by CyberShield Storage Engine</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-green, #34d399)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          ✓ Scanned & Allowed
                        </span>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--email-border)' }}>
                      <button
                        onClick={() => {
                          setComposeRecipient(msg.sender_id);
                          setComposeSubject(`Re: ${currentConv?.title || 'Project Update'}`);
                          setShowComposeModal(true);
                        }}
                        style={{ padding: '6px 14px', background: 'var(--email-surface, #131c2e)', border: '1px solid var(--email-border)', borderRadius: '6px', color: 'var(--email-text-primary, #e2e8f0)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Reply size={14} /> Reply
                      </button>
                      <button
                        onClick={() => {
                          setComposeSubject(`Fwd: ${currentConv?.title || 'Project Update'}`);
                          setComposeBody(`---------- Forwarded message ---------\nFrom: ${msg.sender_name} <${msg.sender_id}@cybershield.ai>\nContent:\n${msg.content}`);
                          setShowComposeModal(true);
                        }}
                        style={{ padding: '6px 14px', background: 'var(--email-surface, #131c2e)', border: '1px solid var(--email-border)', borderRadius: '6px', color: 'var(--email-text-primary, #e2e8f0)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Forward size={14} /> Forward
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Compose Email Modal */}
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
            {/* Modal Header */}
            <div style={{ padding: '14px 18px', background: 'var(--email-sidebar-bg, #0c121e)', borderBottom: '1px solid var(--email-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--email-text-primary, #f8fafc)' }}>
                <Send size={16} color="var(--color-green, #10b981)" />
                <span>+ New Message</span>
              </div>
              <button
                onClick={() => setShowComposeModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--email-text-muted, #94a3b8)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Test Payloads */}
            <div style={{ padding: '8px 18px', background: 'var(--email-surface, rgba(0, 0, 0, 0.3))', borderBottom: '1px solid var(--email-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--email-text-muted, #94a3b8)', fontWeight: 500 }}>Quick Test Payloads:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => loadPresetPayload('PHISHING')}
                  style={{ padding: '3px 8px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Phishing Payload
                </button>
                <button
                  onClick={() => loadPresetPayload('SAFE')}
                  style={{ padding: '3px 8px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: 'var(--color-green, #34d399)', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Safe Payload
                </button>
              </div>
            </div>

            {/* Modal Body Inputs */}
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--email-text-secondary, #94a3b8)' }}>To</label>
                  <button
                    type="button"
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-green, #34d399)', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {showCcBcc ? 'Hide Cc/Bcc' : 'Cc / Bcc'}
                  </button>
                </div>
                <input
                  type="text"
                  value={composeRecipient}
                  onChange={(e) => setComposeRecipient(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--email-input-bg, #070b14)', border: '1px solid var(--email-border)', borderRadius: '8px', color: 'var(--email-input-text, #f8fafc)', fontSize: '0.8rem', fontFamily: 'var(--font-mono, monospace)', outline: 'none' }}
                  placeholder="user-riya@cybershield.ai"
                />
              </div>

              {showCcBcc && (
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--email-text-secondary, #94a3b8)', display: 'block', marginBottom: '4px' }}>Cc</label>
                  <input
                    type="text"
                    value={ccField}
                    onChange={(e) => setCcField(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--email-input-bg, #070b14)', border: '1px solid var(--email-border)', borderRadius: '8px', color: 'var(--email-input-text, #f8fafc)', fontSize: '0.8rem', fontFamily: 'var(--font-mono, monospace)', outline: 'none' }}
                    placeholder="arun@cybershield.ai"
                  />
                </div>
              )}

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

              {/* Attachment Picker */}
              <div style={{ padding: '10px 12px', background: 'var(--email-surface, #131c2e)', border: '1px solid var(--email-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--email-text-primary, #e2e8f0)' }}>
                  <Paperclip size={15} color="var(--color-green, #10b981)" />
                  <span>{selectedAttachment ? selectedAttachment : 'No attachment attached'}</span>
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

            {/* Modal Actions */}
            <div style={{ padding: '12px 18px', background: 'var(--email-sidebar-bg, #0c121e)', borderTop: '1px solid var(--email-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setShowComposeModal(false)}
                style={{ padding: '7px 14px', background: 'transparent', border: 'none', color: 'var(--email-text-muted, #94a3b8)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Discard
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !composeBody.trim()}
                style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: sending || !composeBody.trim() ? 0.5 : 1 }}
              >
                <Send size={14} color="#ffffff" /> {sending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Threat Explanation Details Modal */}
      {selectedThreatMessage && (
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
            maxWidth: '500px',
            background: 'var(--email-modal-bg, #0f172a)',
            border: '1px solid var(--email-border-strong, rgba(255, 255, 255, 0.18))',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ padding: '14px 18px', background: 'rgba(239, 68, 68, 0.2)', borderBottom: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 800, fontSize: '0.85rem' }}>
                <ShieldAlert size={18} color="#ef4444" />
                <span>CyberShield AI Phishing Explanation</span>
              </div>
              <button
                onClick={() => setSelectedThreatMessage(null)}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--email-surface, #131c2e)', padding: '12px', borderRadius: '8px', border: '1px solid var(--email-border)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--email-text-muted, #94a3b8)' }}>Classification:</span>
                  <strong style={{ color: '#ef4444' }}>{selectedThreatMessage.classification}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--email-text-muted, #94a3b8)' }}>Risk Score:</span>
                  <strong style={{ color: '#ef4444' }}>{selectedThreatMessage.risk_score} / 100</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--email-text-muted, #94a3b8)' }}>Threat Level:</span>
                  <strong style={{ color: '#ef4444' }}>{selectedThreatMessage.risk_level}</strong>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--email-text-muted, #94a3b8)', marginBottom: '8px' }}>
                  Forensic Reasons Detected:
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, padding: 0 }}>
                  {(selectedThreatMessage.forensic_reasons || []).map((reason, idx) => (
                    <li
                      key={idx}
                      style={{ background: 'var(--email-surface, #131c2e)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--email-border)', fontSize: '0.75rem', color: 'var(--email-text-primary, #e2e8f0)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                    >
                      <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ padding: '12px 18px', background: 'var(--email-sidebar-bg, #0c121e)', borderTop: '1px solid var(--email-border)', display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => handleUpdateSecurityAction(selectedThreatMessage.message_id, 'ALLOW')}
                style={{ padding: '7px 14px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: 'var(--color-green, #34d399)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Allow & Mark Safe
              </button>
              <button
                onClick={() => handleUpdateSecurityAction(selectedThreatMessage.message_id, 'BLOCK')}
                style={{ padding: '7px 14px', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Block & Quarantine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
