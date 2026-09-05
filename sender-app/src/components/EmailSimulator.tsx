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
  const [sending, setSending] = useState<boolean>(false);

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
      const sentMsg = await sendConversationMessageSenderAPI(selectedConvId, activeUserId, fullContent);
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

  const loadPresetPayload = (type: 'PHISHING' | 'SAFE') => {
    if (type === 'PHISHING') {
      setComposeSubject('URGENT: CyberShield Account Access Suspended');
      setComposeBody(
        'Dear Kavin,\n\nWe detected unauthorized login attempts on your CyberShield student portal. Your access will be suspended within 24 hours unless you re-verify your identity immediately.\n\nPlease click here to update your credentials: http://cybershield-auth-verify.com/login\n\nBest regards,\nIT Security Desk'
      );
    } else {
      setComposeSubject('CyberShield AI Project Review & Architecture Updates');
      setComposeBody(
        'Hi Kavin,\n\nI reviewed the latest code for the multi-channel defense engine. The SSE streaming and platform isolation logic look great!\n\nLet\'s schedule a brief sync tomorrow at 10 AM to discuss the final evaluation dashboard.\n\nBest,\nArun'
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
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar / Folder Drawer */}
        <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-4 space-y-6 shrink-0 hidden md:flex">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base leading-tight">Sender Email</h2>
              <p className="text-xs text-blue-400 font-medium">External Dispatch Studio</p>
            </div>
          </div>

          <button
            onClick={() => setShowComposeModal(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/30 transition duration-150"
          >
            <Plus className="w-5 h-5" />
            <span>Compose Email</span>
          </button>

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

              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search mail by subject, recipient, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 pl-4">
              <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 hidden sm:inline">
                {liveClock}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                  S
                </div>
                <span className="text-xs font-medium text-slate-300 hidden md:inline">Sender Console</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {activeScreen === 'home' ? (
              <div className="divide-y divide-slate-800">
                {filteredConversations.map((conv) => {
                  const otherParticipant =
                    conv.members?.find((m) => m.user_id !== activeUserId)?.name || conv.title;

                  return (
                    <div
                      key={conv.conversation_id}
                      onClick={() => handleOpenThread(conv.conversation_id)}
                      className="p-4 hover:bg-slate-800/60 cursor-pointer transition flex items-start space-x-4"
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
                        <span className="text-sm font-medium text-slate-100 truncate block mt-0.5">
                          {conv.title}
                        </span>
                        <p className="text-xs text-slate-400 truncate mt-1">
                          {conv.latest_message?.content || 'No preview available.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Reading View */
              <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h1 className="text-xl font-bold text-slate-100 leading-snug">{currentConv?.title}</h1>
                    <span className="text-xs text-slate-400 mt-1 inline-block">Thread ID: {selectedConvId}</span>
                  </div>
                </div>

                {messages.map((msg) => (
                  <div key={msg.message_id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
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
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{msg.timestamp || 'Today'}</span>
                    </div>

                    <div className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed border-t border-slate-900 pt-4 font-mono">
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Email Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
                <Send className="w-4 h-4 text-blue-400" />
                <span>Transmit External Email</span>
              </h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/60 px-6 py-2 border-b border-slate-800/60 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Quick Test Payloads:</span>
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

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">To</label>
                <input
                  type="text"
                  value={composeRecipient}
                  onChange={(e) => setComposeRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
                  placeholder="user-kavin@cybershield.ai"
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
                  <span>{sending ? 'Transmitting...' : 'Send Email'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
