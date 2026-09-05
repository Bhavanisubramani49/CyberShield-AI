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
  Trash2, 
  Plus, 
  Reply, 
  Forward, 
  Ban, 
  ShieldCheck, 
  AlertCircle 
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

export const EmailSimulator: React.FC<EmailSimulatorProps> = ({
  activeUserId = 'user-kavin',
  isReceiverView = true,
  onSelectEventDetails
}) => {
  const liveClock = useLiveClock();
  if (!isReceiverView || onSelectEventDetails) console.log('emailMode');

  // Navigation & UI State
  const [activeScreen, setActiveScreen] = useState<'home' | 'thread'>('home');
  const [activeFolder, setActiveFolder] = useState<string>('inbox');
  const [activeCategory, setActiveCategory] = useState<'primary' | 'promotions' | 'social' | 'updates'>('primary');

  // Data State
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('CONV-EMAIL-001');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Compose Modal State
  const [showComposeModal, setShowComposeModal] = useState<boolean>(false);
  const [composeRecipient, setComposeRecipient] = useState<string>('user-riya');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  // Security & Threat Details Modal State
  const [selectedThreatMessage, setSelectedThreatMessage] = useState<MessageItem | null>(null);
  const [blockToast, setBlockToast] = useState<string | null>(null);

  // Handle browser popstate Back button integration
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

  // Real-time SSE Stream & 1.5s Polling Fallback
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
              setMessages((prev) => {
                if (prev.some((m) => m.message_id === data.message_id)) return prev;
                return [...prev, data];
              });
            }
          }
        } catch (e) {
          console.error('Failed to process SSE message:', e);
        }
      };
    } catch (e) {
      console.warn('SSE EventSource not supported or unavailable.');
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
        return data;
      });
    } catch (e) {
      console.error('Error loading messages:', e);
    }
  };

  const handleSendMessage = async () => {
    if (!composeBody.trim() || !selectedConvId || sending) return;
    setSending(true);

    const fullContent = composeSubject.trim()
      ? `Subject: ${composeSubject.trim()}\n\n${composeBody.trim()}`
      : composeBody.trim();

    try {
      const sentMsg = await sendConversationMessageAPI(selectedConvId, activeUserId, fullContent);
      setMessages((prev) => [...prev, sentMsg]);
      setComposeBody('');
      setComposeSubject('');
      setShowComposeModal(false);
      loadConversations();
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
          ? '🛡 Sender blocked and message quarantined by CyberShield AI'
          : '✅ Email allowed and marked safe'
      );
      setTimeout(() => setBlockToast(null), 4000);
      setSelectedThreatMessage(null);
    } catch (e: any) {
      alert(e.message || 'Failed to update security action');
    }
  };

  const loadPresetPayload = (type: 'PHISHING' | 'SAFE') => {
    if (type === 'PHISHING') {
      setComposeSubject('URGENT: Verify Your CyberShield Banking Credentials');
      setComposeBody(
        'Dear Valued Student,\n\nWe detected suspicious login activity from IP address 192.168.1.1. Your CyberShield account balance & portal access will be suspended within 2 hours.\n\nPlease click here immediately to re-verify your password and identity: http://cybershield-auth-verify.com/login\n\nSecurity Desk Support'
      );
    } else {
      setComposeSubject('Project Architecture Review Sync');
      setComposeBody(
        'Hi Kavin,\n\nPlease review the attached architecture documentation for the CyberShield multi-channel security engine. Everything looks clean and ready for deployment.\n\nBest,\nArun'
      );
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
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 font-sans border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
      {/* Toast Notification */}
      {blockToast && (
        <div className="absolute top-4 right-4 z-50 bg-slate-800 border border-slate-700 text-slate-100 px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 animate-fade-in">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-medium">{blockToast}</span>
        </div>
      )}

      {/* Main Gmail Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar / Folder Drawer */}
        <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-4 space-y-6 shrink-0 hidden md:flex">
          {/* Brand Header */}
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base leading-tight">CyberMail AI</h2>
              <p className="text-xs text-rose-400 font-medium">Email Phishing Sandbox</p>
            </div>
          </div>

          {/* Compose Button */}
          <button
            onClick={() => setShowComposeModal(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/30 transition duration-150"
          >
            <Plus className="w-5 h-5" />
            <span>Compose Email</span>
          </button>

          {/* Navigation Folders */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveFolder('inbox')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeFolder === 'inbox'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Inbox className="w-4 h-4" />
                <span>Inbox</span>
              </div>
              <span className="bg-slate-800 text-xs font-semibold px-2 py-0.5 rounded-full text-slate-300">
                {conversations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveFolder('starred')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeFolder === 'starred'
                  ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Star className="w-4 h-4" />
                <span>Starred</span>
              </div>
            </button>

            <button
              onClick={() => setActiveFolder('sent')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeFolder === 'sent'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <SentIcon className="w-4 h-4" />
                <span>Sent Mail</span>
              </div>
            </button>

            <button
              onClick={() => setActiveFolder('spam')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeFolder === 'spam'
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-4 h-4" />
                <span>Spam & Threat Warning</span>
              </div>
              <span className="bg-rose-950 text-rose-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-rose-800">
                AI Active
              </span>
            </button>

            <button
              onClick={() => setActiveFolder('trash')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeFolder === 'trash'
                  ? 'bg-slate-800 text-slate-200'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Trash2 className="w-4 h-4" />
                <span>Trash</span>
              </div>
            </button>
          </div>

          {/* CyberShield Status Pill */}
          <div className="mt-auto bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Phishing Engine Active</span>
            </div>
            <p className="text-xs text-slate-400">
              Scans incoming mail links, domains, and credential harvesting patterns.
            </p>
          </div>
        </div>

        {/* Right Email Work Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
          {/* Header Bar */}
          <div className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center space-x-3 flex-1 max-w-xl">
              {activeScreen === 'thread' && (
                <button
                  onClick={handleBackNavigation}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center space-x-1 mr-1"
                  title="Back to Email List"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-200" />
                  <span className="text-xs font-medium hidden sm:inline">Back</span>
                </button>
              )}

              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search mail by subject, sender, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Top Right User Profile / Clock */}
            <div className="flex items-center space-x-4 pl-4">
              <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 hidden sm:inline">
                {liveClock}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs border border-blue-400/30">
                  K
                </div>
                <span className="text-xs font-medium text-slate-300 hidden md:inline">Kavin (Primary)</span>
              </div>
            </div>
          </div>

          {/* Email Main Content View (List vs Reading View) */}
          <div className="flex-1 overflow-y-auto">
            {activeScreen === 'home' ? (
              <div className="flex flex-col h-full">
                {/* Category Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950 px-4">
                  {(['primary', 'promotions', 'social', 'updates'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-3 text-xs font-medium capitalize border-b-2 transition ${
                        activeCategory === cat
                          ? 'border-blue-500 text-blue-400 font-semibold'
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
                      <p className="text-sm font-medium">No emails found in inbox.</p>
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

                      return (
                        <div
                          key={conv.conversation_id}
                          onClick={() => handleOpenThread(conv.conversation_id)}
                          className={`p-4 hover:bg-slate-800/60 cursor-pointer transition flex items-start space-x-4 border-l-4 ${
                            isPhishing ? 'border-l-rose-500 bg-rose-950/10' : 'border-l-transparent'
                          }`}
                        >
                          <Star className="w-4 h-4 text-slate-600 hover:text-amber-400 mt-1 shrink-0 transition" />
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-slate-300 text-xs">
                            {otherParticipant.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-200 text-sm truncate">
                                {otherParticipant}
                              </span>
                              <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                {conv.latest_message?.timestamp || formatConversationDate(conv.updated_at)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-sm font-medium text-slate-100 truncate">{conv.title}</span>
                              {isPhishing && (
                                <span className="bg-rose-950 text-rose-400 border border-rose-800/60 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 shrink-0">
                                  <ShieldAlert className="w-3 h-3" />
                                  <span>PHISHING</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-1">
                              {conv.latest_message?.content || 'No email body preview available.'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* Reading / Email Thread View */
              <div className="p-6 max-w-4xl mx-auto space-y-6">
                {/* Subject Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h1 className="text-xl font-bold text-slate-100 leading-snug">{currentConv?.title}</h1>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="bg-blue-950 text-blue-400 border border-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        Inbox
                      </span>
                      <span className="text-xs text-slate-400">Thread ID: {selectedConvId}</span>
                    </div>
                  </div>
                </div>

                {/* Messages in Thread */}
                {messages.map((msg) => {
                  const isThreat = msg.security_status === 'DANGEROUS' || msg.classification === 'PHISHING';

                  return (
                    <div
                      key={msg.message_id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl"
                    >
                      {/* Sender Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                            {msg.sender_name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-100 text-sm">{msg.sender_name}</span>
                              <span className="text-xs text-slate-400">&lt;{msg.sender_id}@cybershield.ai&gt;</span>
                            </div>
                            <p className="text-xs text-slate-500">to me (Kavin)</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{msg.timestamp || 'Today'}</span>
                      </div>

                      {/* CyberShield AI Phishing Warning Banner */}
                      {isThreat && (
                        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm">
                              <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                              <span>CyberShield AI Phishing Warning (Risk Score: {msg.risk_score}/100)</span>
                            </div>
                            <span className="bg-rose-900/60 text-rose-300 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wide">
                              {msg.classification}
                            </span>
                          </div>
                          <p className="text-xs text-rose-200/90 leading-relaxed">
                            Warning: This email contains suspicious link signatures, credential harvesting prompts, or domain mismatches. Do not enter passwords or sensitive personal details.
                          </p>
                          <div className="flex items-center space-x-3 pt-1">
                            <button
                              onClick={() => setSelectedThreatMessage(msg)}
                              className="bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>Why is this dangerous?</span>
                            </button>
                            {msg.security_status !== 'BLOCKED' ? (
                              <button
                                onClick={() => handleUpdateSecurityAction(msg.message_id, 'BLOCK')}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition"
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

                      {/* Email Body */}
                      <div className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed border-t border-slate-900 pt-4 font-mono">
                        {msg.content}
                      </div>

                      {/* Reply / Forward Action Bar */}
                      <div className="flex items-center space-x-3 pt-4 border-t border-slate-900">
                        <button
                          onClick={() => setShowComposeModal(true)}
                          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition flex items-center space-x-2"
                        >
                          <Reply className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                        <button
                          onClick={() => setShowComposeModal(true)}
                          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition flex items-center space-x-2"
                        >
                          <Forward className="w-4 h-4" />
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
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
                <Send className="w-4 h-4 text-blue-400" />
                <span>New Message</span>
              </h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test Presets Header */}
            <div className="bg-slate-950/60 px-6 py-2 border-b border-slate-800/60 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Quick Test Presets:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadPresetPayload('PHISHING')}
                  className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold transition"
                >
                  Phishing Payload
                </button>
                <button
                  onClick={() => loadPresetPayload('SAFE')}
                  className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold transition"
                >
                  Safe Email Payload
                </button>
              </div>
            </div>

            {/* Modal Inputs */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">To</label>
                <input
                  type="text"
                  value={composeRecipient}
                  onChange={(e) => setComposeRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
                  placeholder="recipient@cybershield.ai"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Email subject title..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Message Body</label>
                <textarea
                  rows={6}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition font-mono"
                  placeholder="Write your email content..."
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-900 transition"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !composeBody.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl text-sm flex items-center space-x-2 transition shadow-lg shadow-blue-900/40"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'Sending...' : 'Send Email'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Threat Explanation Details Modal */}
      {selectedThreatMessage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-rose-950/80 px-6 py-4 border-b border-rose-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-rose-300 font-bold">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>CyberShield AI Phishing Explanation</span>
              </div>
              <button
                onClick={() => setSelectedThreatMessage(null)}
                className="text-rose-300 hover:text-white p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Classification:</span>
                  <span className="font-bold text-rose-400">{selectedThreatMessage.classification}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Risk Score:</span>
                  <span className="font-bold text-rose-400">{selectedThreatMessage.risk_score} / 100</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Threat Level:</span>
                  <span className="font-bold text-rose-400">{selectedThreatMessage.risk_level}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Forensic Reasons Detected:
                </h4>
                <ul className="space-y-2">
                  {(selectedThreatMessage.forensic_reasons || []).map((reason, idx) => (
                    <li
                      key={idx}
                      className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start space-x-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleUpdateSecurityAction(selectedThreatMessage.message_id, 'ALLOW')}
                className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold px-4 py-2 rounded-xl border border-emerald-800 transition"
              >
                Allow & Mark Safe
              </button>
              <button
                onClick={() => handleUpdateSecurityAction(selectedThreatMessage.message_id, 'BLOCK')}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-rose-900/40"
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
