import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  Mail, 
  Globe, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Bell, 
  Users, 
  User,
  XCircle, 
  Filter, 
  Layers, 
  Eye, 
  Send,
  Sparkles,
  ShieldAlert,
  Search
} from 'lucide-react';
import { SecurityEvent, SecurityAction, ConversationSummary, MessageItem, DemoUser } from '../types';
import { 
  fetchEventsAPI, 
  updateEventActionAPI,
  fetchConversationsAPI,
  fetchConversationMessagesAPI,
  sendConversationMessageAPI,
  fetchDemoUsersAPI
} from '../services/api';

export const ReceiverPage: React.FC = () => {
  // Navigation & View Mode
  const [activeView, setActiveView] = useState<'conversations' | 'telemetry'>('conversations');

  // Multi-User Conversations State
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('user-kavin');
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('CONV-003');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [replyContent, setReplyContent] = useState<string>('');
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Legacy Telemetry & Security Events State
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [activeSurface, setActiveSurface] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [selectedEventDetails, setSelectedEventDetails] = useState<SecurityEvent | null>(null);

  // Load conversations & events on mount and poll every 3 seconds for live synchronization
  useEffect(() => {
    loadDemoUsers();
    loadConversations();
    loadEvents();

    const interval = setInterval(() => {
      loadConversations();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
    }
  }, [selectedConvId]);

  const loadDemoUsers = async () => {
    const users = await fetchDemoUsersAPI();
    setDemoUsers(users);
  };

  const loadConversations = async () => {
    const list = await fetchConversationsAPI(currentUser);
    setConversations(list);
    if (!selectedConvId && list.length > 0) {
      setSelectedConvId(list[0].conversation_id);
    }
  };

  const loadMessages = async (convId: string) => {
    const msgs = await fetchConversationMessagesAPI(convId);
    setMessages(msgs);
  };

  const loadEvents = async () => {
    const list = await fetchEventsAPI();
    setEvents(list);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyContent.trim() || !selectedConvId || sendingMsg) return;

    setSendingMsg(true);
    try {
      await sendConversationMessageAPI(selectedConvId, currentUser, replyContent);
      setReplyContent('');
      await loadMessages(selectedConvId);
      await loadConversations();
      await loadEvents();
    } catch (err: any) {
      alert(`Message dispatch failed: ${err.message}`);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleApplyPreset = (presetText: string) => {
    setReplyContent(presetText);
  };

  const handleAction = async (eventId: string, action: SecurityAction) => {
    await updateEventActionAPI(eventId, action);
    setEvents(prev => prev.map(evt => {
      if (evt.event_id === eventId) {
        return { ...evt, user_action: action };
      }
      return evt;
    }));
    if (selectedEventDetails?.event_id === eventId) {
      setSelectedEventDetails(prev => prev ? { ...prev, user_action: action } : null);
    }
  };

  const currentConv = conversations.find(c => c.conversation_id === selectedConvId);

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.members.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. HEADER & VIEW SWITCHER */}
      <div className="cyber-card-green" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-green">
                <span className="live-dot" />
                CYBERSHIELD MULTI-USER PROTECTION ACTIVE
              </span>
              <span className="badge badge-blue">
                15 SYNTHETIC USERS • 8 PERSISTENT CONVERSATIONS
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Protected Communication Ecosystem
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '2px' }}>
              Continuous multi-user 1-to-1 & group conversations protected by CyberShield AI. Intercepts threats transparently.
            </div>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveView('conversations')}
              className={`btn ${activeView === 'conversations' ? 'btn-primary-green' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            >
              <Users size={15} /> Protected Conversations Hub
            </button>
            <button
              onClick={() => setActiveView('telemetry')}
              className={`btn ${activeView === 'telemetry' ? 'btn-accent-blue' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            >
              <Layers size={15} /> Security Event Stream ({events.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONVERSATIONS HUB */}
      {activeView === 'conversations' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', minHeight: '620px' }}>
          
          {/* LEFT SIDEBAR: CONVERSATION LIST */}
          <div className="cyber-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Active Identity Switcher */}
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
                Active Receiver Identity:
              </label>
              <select
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
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

            {/* Conversation Search Bar */}
            <div style={{ position: 'relative' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search conversations or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.78rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Conversations List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '480px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Protected Conversations ({filteredConversations.length})
              </div>

              {filteredConversations.map((conv) => {
                const isSelected = conv.conversation_id === selectedConvId;
                const hasThreats = conv.threat_count > 0;
                const isGroup = conv.conversation_type === 'GROUP';

                return (
                  <div
                    key={conv.conversation_id}
                    onClick={() => setSelectedConvId(conv.conversation_id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-subtle)',
                      border: isSelected ? '1px solid var(--color-green)' : hasThreats ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {isGroup ? <Users size={14} color="#60a5fa" /> : <User size={14} color="#4ade80" />}
                        <span>{conv.title}</span>
                      </div>
                      {hasThreats ? (
                        <span className="badge badge-danger" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                          🔴 {conv.threat_count} Alert{conv.threat_count > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="badge badge-green" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                          🟢 SAFE
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.latest_message ? `${conv.latest_message.sender_id.replace('user-', '')}: ${conv.latest_message.content}` : 'No messages yet'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      <span>{conv.member_count} Members</span>
                      <span>{conv.latest_message?.timestamp || ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT MAIN PANEL: SELECTED CONVERSATION STREAM */}
          <div className="cyber-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Conversation Header */}
            {currentConv ? (
              <div style={{ padding: '14px 18px', background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {currentConv.title}
                    </h3>
                    <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
                      <ShieldCheck size={12} /> CyberShield Layer Active
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Members: {currentConv.members.map(m => m.name).join(', ')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '-6px' }}>
                  {currentConv.members.slice(0, 5).map(m => (
                    <img
                      key={m.user_id}
                      src={m.avatar}
                      alt={m.name}
                      title={m.name}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #0f172a' }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Select a conversation from the sidebar to view chat stream
              </div>
            )}

            {/* Continuous Message Stream */}
            <div style={{ flex: 1, padding: '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '460px', background: 'rgba(5, 10, 20, 0.6)' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', margin: 'auto' }}>
                  No messages in this conversation thread yet.
                </div>
              ) : (
                messages.map((msg) => {
                  const isThreat = msg.security_status !== 'SAFE';
                  const isCritical = msg.risk_level === 'CRITICAL' || msg.risk_level === 'HIGH';
                  const isMe = msg.sender_id === currentUser;

                  return (
                    <div
                      key={msg.message_id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {/* Sender Meta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <img src={msg.sender_avatar} alt="" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                        <strong>{msg.sender_name}</strong>
                        <span>• {msg.timestamp}</span>
                      </div>

                      {/* SAFE Message Bubble */}
                      {!isThreat ? (
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: isMe ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-subtle)',
                          border: isMe ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontSize: '0.84rem',
                          lineHeight: '1.4'
                        }}>
                          {msg.content}
                          <div style={{ fontSize: '0.62rem', color: 'var(--color-green)', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldCheck size={11} /> Verified Safe
                          </div>
                        </div>
                      ) : (
                        /* THREAT / QUARANTINED MESSAGE INLINE WARNING CARD */
                        <div style={{
                          padding: '14px 16px',
                          borderRadius: '10px',
                          background: isCritical ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          border: isCritical ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(245, 158, 11, 0.45)',
                          width: '100%'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isCritical ? '#f87171' : '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ShieldAlert size={16} /> 🔴 CYBERSHIELD SECURITY INTERCEPTION
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isCritical ? '#f87171' : '#fbbf24' }}>
                              Risk: {msg.risk_score}/100 ({msg.classification})
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '8px', background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '6px' }}>
                            "{msg.content}"
                          </div>

                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '10px' }}>
                            <strong>Why Intercepted:</strong>
                            {msg.forensic_reasons.map((r, idx) => (
                              <div key={idx} style={{ marginTop: '2px' }}>• {r}</div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                const syntheticEvt: SecurityEvent = {
                                  event_id: msg.event_id || msg.message_id,
                                  sender_id: msg.sender_name,
                                  sender_type: 'simulated_attacker',
                                  receiver_id: currentUser,
                                  receiver_surface: currentConv?.title || 'Messaging',
                                  platform: 'whatsapp',
                                  content_type: msg.content_type,
                                  content_preview: msg.content,
                                  created_at: msg.created_at,
                                  received_at: msg.created_at,
                                  processed_at: msg.created_at,
                                  timestamp: msg.timestamp,
                                  status: 'analyzed',
                                  classification: msg.classification,
                                  risk_score: msg.risk_score,
                                  risk_level: msg.risk_level as any,
                                  confidence: msg.confidence,
                                  ai_model: 'multimodal_cyber_engine',
                                  forensic_reasons: msg.forensic_reasons,
                                  recommended_action: 'QUARANTINE',
                                  final_action: 'QUARANTINE',
                                  timeline: []
                                };
                                setSelectedEventDetails(syntheticEvt);
                                setActiveView('telemetry');
                              }}
                              className="btn btn-outline"
                              style={{ fontSize: '0.7rem', padding: '4px 8px', color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.4)' }}
                            >
                              <Eye size={12} /> Inspect AI Forensics
                            </button>
                            <button
                              onClick={() => alert(`Blocked sender ${msg.sender_name} for conversation ${currentConv?.title}`)}
                              className="btn btn-outline"
                              style={{ fontSize: '0.7rem', padding: '4px 8px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                            >
                              <XCircle size={12} /> Block Sender
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Composer & Quick Presets */}
            <div style={{ padding: '14px 18px', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid var(--border-subtle)' }}>
              
              {/* Preset Threat / Safe Quick Options */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', overflowX: 'auto' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} color="#4ade80" /> Presets:
                </span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("Hi team, meeting confirmed for 10 AM.")}
                  className="btn btn-outline"
                  style={{ fontSize: '0.66rem', padding: '2px 8px' }}
                >
                  ✓ Safe Chat
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("Claim your ₹50,000 cash prize now at http://192.168.1.1/claim-cash")}
                  className="btn btn-outline"
                  style={{ fontSize: '0.66rem', padding: '2px 8px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  🚨 Phishing Scam
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("Urgent: Account locked verify PIN at http://192.168.1.10/verify-bank")}
                  className="btn btn-outline"
                  style={{ fontSize: '0.66rem', padding: '2px 8px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  🚨 Malicious URL
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("Attached script: malicious_payload.docm")}
                  className="btn btn-outline"
                  style={{ fontSize: '0.66rem', padding: '2px 8px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  🚨 Macro Payload
                </button>
              </div>

              {/* Message Composer Form */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder={`Send message as ${demoUsers.find(u => u.user_id === currentUser)?.name || 'Kavin'}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.84rem'
                  }}
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !replyContent.trim()}
                  className="btn btn-primary-green"
                  style={{ padding: '10px 18px', fontSize: '0.82rem' }}
                >
                  <Send size={14} /> {sendingMsg ? 'Analyzing...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. LEGACY TELEMETRY STREAM & FORENSIC TABLE VIEW */}
      {activeView === 'telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Surface Selector Tabs */}
          <div style={{
            display: 'flex',
            gap: '6px',
            padding: '6px',
            background: 'rgba(12, 18, 30, 0.8)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            overflowX: 'auto'
          }}>
            {[
              { id: 'all', label: 'All Surfaces', icon: Layers },
              { id: 'message', label: 'Messages / SMS', icon: MessageSquare },
              { id: 'email', label: 'Email Inbox', icon: Mail },
              { id: 'social', label: 'Social Feed', icon: Users },
              { id: 'news', label: 'News Feed', icon: FileText },
              { id: 'url', label: 'URLs & Links', icon: Globe },
              { id: 'image', label: 'Media & Images', icon: ImageIcon },
              { id: 'video', label: 'Videos', icon: Video },
              { id: 'alerts', label: 'Instant Alerts', icon: Bell },
            ].map((s) => {
              const Icon = s.icon;
              const isActive = activeSurface === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSurface(s.id)}
                  className={`btn ${isActive ? 'btn-primary-green' : 'btn-ghost'}`}
                  style={{
                    flex: '1',
                    minWidth: '135px',
                    fontSize: '0.78rem',
                    padding: '7px 10px',
                    justifyContent: 'center'
                  }}
                >
                  <Icon size={14} />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Filter Bar */}
          <div className="cyber-card" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Filter size={15} color="var(--color-green)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Classification:</span>
              {['ALL', 'SAFE', 'SCAM', 'PHISHING', 'MANIPULATED', 'DEEPFAKE', 'QUARANTINED', 'REVIEW'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterTag(f)}
                  className={`btn ${filterTag === f ? 'btn-accent-blue' : 'btn-outline'}`}
                  style={{ padding: '3px 10px', fontSize: '0.72rem' }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Showing {events.length} telemetry items
            </div>
          </div>

          {/* Telemetry Stream Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {events.slice(0, 15).map((evt) => {
              const isThreat = evt.ai_result?.classification !== 'SAFE';
              return (
                <div
                  key={evt.event_id}
                  className="cyber-card"
                  style={{
                    padding: '14px 18px',
                    border: isThreat ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
                    background: isThreat ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${isThreat ? 'badge-danger' : 'badge-green'}`}>
                        {isThreat ? evt.ai_result?.classification : 'SAFE'}
                      </span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{evt.sender_id}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({evt.event_id})</span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {evt.timestamp}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {evt.content_preview}
                  </div>

                  {isThreat && evt.ai_result?.reasons && (
                    <div style={{ fontSize: '0.72rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 10px', borderRadius: '4px', marginBottom: '8px' }}>
                      <strong>Forensic Reasons:</strong> {evt.ai_result.reasons.join(', ')}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAction(evt.event_id, 'BLOCK')}
                      className="btn btn-outline"
                      style={{ fontSize: '0.7rem', padding: '3px 8px', color: 'var(--color-danger)' }}
                    >
                      Block
                    </button>
                    <button
                      onClick={() => handleAction(evt.event_id, 'ALLOW')}
                      className="btn btn-outline"
                      style={{ fontSize: '0.7rem', padding: '3px 8px', color: 'var(--color-green)' }}
                    >
                      Allow
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
