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
import { ConversationSummary, MessageItem } from '../types';
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

  // Populate existing
  existing.forEach((msg) => {
    const key = msg.message_id || msg.event_id || `temp-${msg.content}`;
    map.set(key, msg);
  });

  // Merge incoming
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
  activeUserId = 'user-kavin',
  isReceiverView = true,
  onSelectEventDetails
}) => {
  const liveClock = useLiveClock();
  if (!isReceiverView || onSelectEventDetails) {
    // Retains prop signatures safely
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
  }, [activeUserId]);

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
      await fetchUserContactsAPI(activeUserId);
    } catch (e) {
      console.error('Error loading contacts:', e);
    }
  };

  const loadConversations = async () => {
    try {
      const data = await fetchConversationsAPI(activeUserId, 'EMAIL');
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
      const sentMsg = await sendConversationMessageAPI(selectedConvId, activeUserId, fullContent);
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
        'Hi Kavin,\n\nPlease review the attached architecture documentation for the CyberShield multi-channel security engine. Everything looks clean and ready for deployment.\n\nBest,\nArun'
      );
      setSelectedAttachment('CyberShield_Architecture_v2.pdf');
    }
  };

  const currentConv = conversations.find((c) => c.conversation_id === selectedConvId);

  const filteredConversations = conversations.filter((c) => {
    // Search query filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const otherParticipant = c.members?.find((m) => m.user_id !== activeUserId)?.name || c.title;
      const matchesSearch =
        c.title.toLowerCase().includes(term) ||
        c.latest_message?.content?.toLowerCase().includes(term) ||
        otherParticipant.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // Folder filter
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
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 font-sans border border-slate-800 rounded-xl shadow-2xl overflow-hidden relative">
      {/* Toast Notification */}
      {blockToast && (
        <div className="absolute top-4 right-4 z-50 bg-slate-800 border border-slate-700 text-slate-100 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 animate-fade-in">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-medium">{blockToast}</span>
        </div>
      )}

      {/* Top Application Header Bar */}
      <div className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center space-x-4 flex-1 max-w-2xl">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h2 className="font-extrabold text-slate-100 text-sm leading-tight tracking-tight">CyberShield Mail</h2>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI Protection Active
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search mail by subject, sender, body or label..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Right Header Status & User Pill */}
        <div className="flex items-center space-x-3 pl-4">
          <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 hidden md:inline font-mono">
            {liveClock}
          </span>
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-[11px]">
              K
            </div>
            <span className="text-xs font-semibold text-slate-300 hidden sm:inline">Kavin (Protected Receiver)</span>
          </div>
        </div>
      </div>

      {/* Main Gmail Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar / Folder Drawer */}
        <div className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col p-3 space-y-5 shrink-0 hidden md:flex">
          {/* Compose Button */}
          <button
            onClick={() => setShowComposeModal(true)}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 transition duration-150 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Email</span>
          </button>

          {/* Navigation Folders */}
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 mb-1">Folders</div>
            <button
              onClick={() => { setActiveFolder('inbox'); setActiveScreen('home'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeFolder === 'inbox' && activeScreen === 'home'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Inbox className="w-4 h-4" />
                <span>Inbox</span>
              </div>
              <span className="bg-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full text-slate-300">
                {conversations.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveFolder('starred'); setActiveScreen('home'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeFolder === 'starred'
                  ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Star className="w-4 h-4" />
                <span>Starred</span>
              </div>
              <span className="bg-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full text-slate-300">
                {starredIds.size}
              </span>
            </button>

            <button
              onClick={() => { setActiveFolder('sent'); setActiveScreen('home'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeFolder === 'sent'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <SentIcon className="w-4 h-4" />
                <span>Sent Mail</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveFolder('spam'); setActiveScreen('home'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeFolder === 'spam'
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Spam & Threats</span>
              </div>
              <span className="bg-rose-950 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-800">
                AI Active
              </span>
            </button>
          </div>

          {/* Categories Section */}
          <div className="space-y-1 pt-2 border-t border-slate-900">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 mb-1">Categories</div>
            {(['primary', 'promotions', 'social', 'updates'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setActiveScreen('home'); }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                  activeCategory === cat
                    ? 'text-emerald-400 font-bold bg-slate-900'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{cat}</span>
                </div>
              </button>
            ))}
          </div>

          {/* CyberShield Status Footer Pill */}
          <div className="mt-auto bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Phishing Shield ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Real-time deep neural link verification & phishing attachment quarantine active.
            </p>
          </div>
        </div>

        {/* Right Email Work Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
          {/* Email Main Content View (List vs Reading Thread View) */}
          <div className="flex-1 overflow-y-auto">
            {activeScreen === 'home' ? (
              <div className="flex flex-col h-full">
                {/* Category Header Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950 px-4">
                  {(['primary', 'promotions', 'social', 'updates'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2.5 text-xs font-semibold capitalize border-b-2 transition ${
                        activeCategory === cat
                          ? 'border-emerald-500 text-emerald-400 font-bold'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Email List */}
                <div className="divide-y divide-slate-800 flex-1">
                  {filteredConversations.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                      <Inbox className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium">No emails found in this view.</p>
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
                          className={`p-3.5 hover:bg-slate-800/60 cursor-pointer transition flex items-start space-x-3.5 border-l-4 ${
                            isPhishing ? 'border-l-rose-500 bg-rose-950/10' : 'border-l-transparent'
                          }`}
                        >
                          {/* Star Toggle */}
                          <button
                            onClick={(e) => toggleStar(conv.conversation_id, e)}
                            className="mt-1 shrink-0 text-slate-600 hover:text-amber-400 transition"
                          >
                            <Star className={`w-4 h-4 ${isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                          </button>

                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-slate-300 text-xs">
                            {otherParticipant.charAt(0)}
                          </div>

                          {/* Email Overview */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-200 text-xs truncate">
                                  {otherParticipant}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  &lt;{otherParticipant.toLowerCase().replace(/\s+/g, '')}@cybershield.ai&gt;
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 whitespace-nowrap ml-2 font-mono">
                                {conv.latest_message?.timestamp || formatConversationDate(conv.updated_at)}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-xs font-semibold text-slate-100 truncate">{conv.title}</span>
                              {isPhishing && (
                                <span className="bg-rose-950 text-rose-400 border border-rose-800/60 text-[9px] font-extrabold px-2 py-0.5 rounded flex items-center space-x-1 shrink-0">
                                  <ShieldAlert className="w-3 h-3" />
                                  <span>⚠ PHISHING (Risk: {conv.latest_message?.risk_score || 94}/100)</span>
                                </span>
                              )}
                              {conv.title.toLowerCase().includes('architecture') && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded">
                                  <Paperclip className="w-3 h-3" />
                                  <span>Attachment</span>
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 truncate mt-1">
                              {conv.latest_message?.content || 'No body preview available.'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* Reading View / Email Thread */
              <div className="p-5 max-w-4xl mx-auto space-y-5">
                {/* Back to Inbox Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <button
                    onClick={handleBackNavigation}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-2 border border-slate-700"
                  >
                    <ArrowLeft className="w-4 h-4 text-emerald-400" />
                    <span>Back to Inbox</span>
                  </button>

                  <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                    <span>Thread ID: {selectedConvId}</span>
                  </div>
                </div>

                {/* Subject Title Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-lg font-extrabold text-slate-100 leading-snug">{currentConv?.title}</h1>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Inbox
                      </span>
                      <span className="text-xs text-slate-400">Category: {activeCategory}</span>
                    </div>
                  </div>
                </div>

                {/* Messages in Thread */}
                {messages.map((msg) => {
                  const isThreat = msg.security_status === 'DANGEROUS' || msg.classification === 'PHISHING';

                  return (
                    <div
                      key={msg.message_id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl"
                    >
                      {/* Sender Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs">
                            {msg.sender_name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-100 text-xs">{msg.sender_name}</span>
                              <span className="text-[11px] text-slate-400 font-mono">&lt;{msg.sender_id}@cybershield.ai&gt;</span>
                            </div>
                            <p className="text-[10px] text-slate-500">to me (Kavin)</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{msg.timestamp || 'Today'}</span>
                      </div>

                      {/* CyberShield AI Phishing Warning Banner */}
                      {isThreat && (
                        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                              <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                              <span>🛡 CyberShield Warning: PHISHING DETECTED (Risk Score: {msg.risk_score}/100)</span>
                            </div>
                            <span className="bg-rose-900/60 text-rose-300 text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                              {msg.classification}
                            </span>
                          </div>
                          <p className="text-xs text-rose-200/90 leading-relaxed">
                            Suspicious login URL detected. Urgency-based language detected. Possible credential harvesting attempt.
                          </p>
                          <div className="flex items-center space-x-3 pt-1">
                            <button
                              onClick={() => setSelectedThreatMessage(msg)}
                              className="bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>Why is this dangerous?</span>
                            </button>
                            {msg.security_status !== 'BLOCKED' ? (
                              <button
                                onClick={() => handleUpdateSecurityAction(msg.message_id, 'BLOCK')}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
                              >
                                Block Sender
                              </button>
                            ) : (
                              <span className="text-xs text-amber-400 font-semibold flex items-center space-x-1">
                                <Ban className="w-4 h-4" />
                                <span>Sender Blocked</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Email Body Content */}
                      <div className="text-slate-200 text-xs whitespace-pre-wrap leading-relaxed border-t border-slate-900 pt-3 font-mono">
                        {msg.content}
                      </div>

                      {/* Attachment Section if present */}
                      {msg.content.includes('[Attachment:') && (
                        <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <Paperclip className="w-4 h-4 text-emerald-400" />
                            <div>
                              <div className="text-xs font-bold text-slate-200">
                                {msg.content.match(/\[Attachment:\s*([^\]]+)\]/)?.[1] || 'Attachment'}
                              </div>
                              <div className="text-[10px] text-slate-400">Scanned by CyberShield Storage Engine</div>
                            </div>
                          </div>
                          <span className="badge badge-green text-[10px]">✓ Scanned & Allowed</span>
                        </div>
                      )}

                      {/* Reply / Forward Action Bar */}
                      <div className="flex items-center space-x-2 pt-3 border-t border-slate-900">
                        <button
                          onClick={() => {
                            setComposeRecipient(msg.sender_id);
                            setComposeSubject(`Re: ${currentConv?.title || 'Project Update'}`);
                            setShowComposeModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition flex items-center space-x-1.5"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                        <button
                          onClick={() => {
                            setComposeSubject(`Fwd: ${currentConv?.title || 'Project Update'}`);
                            setComposeBody(`---------- Forwarded message ---------\nFrom: ${msg.sender_name} <${msg.sender_id}@cybershield.ai>\nContent:\n${msg.content}`);
                            setShowComposeModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition flex items-center space-x-1.5"
                        >
                          <Forward className="w-3.5 h-3.5" />
                          <span>Forward</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Email Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>+ New Message</span>
              </h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets Bar */}
            <div className="bg-slate-950/60 px-5 py-2 border-b border-slate-800/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Quick Test Payloads:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadPresetPayload('PHISHING')}
                  className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[10px] font-extrabold transition"
                >
                  Phishing Payload
                </button>
                <button
                  onClick={() => loadPresetPayload('SAFE')}
                  className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] font-extrabold transition"
                >
                  Safe Email Payload
                </button>
              </div>
            </div>

            {/* Modal Inputs */}
            <div className="p-5 space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-400">To</label>
                  <button
                    type="button"
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    className="text-[10px] text-emerald-400 hover:underline font-semibold"
                  >
                    {showCcBcc ? 'Hide Cc/Bcc' : 'Cc / Bcc'}
                  </button>
                </div>
                <input
                  type="text"
                  value={composeRecipient}
                  onChange={(e) => setComposeRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition font-mono"
                  placeholder="user-riya@cybershield.ai"
                />
              </div>

              {showCcBcc && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Cc</label>
                  <input
                    type="text"
                    value={ccField}
                    onChange={(e) => setCcField(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition font-mono"
                    placeholder="arun@cybershield.ai"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                  placeholder="Email subject line..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Message Body</label>
                <textarea
                  rows={5}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
                  placeholder="Write email content..."
                />
              </div>

              {/* Attachment Picker */}
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-300">
                    {selectedAttachment ? selectedAttachment : 'No attachment attached'}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedAttachment('Project_Report_v2.pdf')}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 rounded border border-slate-700"
                  >
                    + Add .pdf
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAttachment('Invoice_Urgent_March.docm')}
                    className="px-2 py-1 bg-rose-950 hover:bg-rose-900 text-[10px] text-rose-300 rounded border border-rose-800 font-bold"
                  >
                    + Add .docm
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setShowComposeModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
              >
                Discard
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !composeBody.trim()}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-950/40"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Sending...' : 'Send Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Threat Explanation Details Modal */}
      {selectedThreatMessage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-rose-950/80 px-5 py-3.5 border-b border-rose-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>CyberShield AI Phishing Explanation</span>
              </div>
              <button
                onClick={() => setSelectedThreatMessage(null)}
                className="text-rose-300 hover:text-white p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Classification:</span>
                  <span className="font-extrabold text-rose-400">{selectedThreatMessage.classification}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Risk Score:</span>
                  <span className="font-extrabold text-rose-400">{selectedThreatMessage.risk_score} / 100</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Threat Level:</span>
                  <span className="font-extrabold text-rose-400">{selectedThreatMessage.risk_level}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Forensic Reasons Detected:
                </h4>
                <ul className="space-y-2">
                  {(selectedThreatMessage.forensic_reasons || []).map((reason, idx) => (
                    <li
                      key={idx}
                      className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start space-x-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleUpdateSecurityAction(selectedThreatMessage.message_id, 'ALLOW')}
                className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold px-4 py-2 rounded-xl border border-emerald-800 transition"
              >
                Allow & Mark Safe
              </button>
              <button
                onClick={() => handleUpdateSecurityAction(selectedThreatMessage.message_id, 'BLOCK')}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-rose-950/40"
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
