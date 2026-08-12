import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  PlusSquare, 
  Search, 
  Home, 
  Film, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  ArrowLeft, 
  X, 
  Volume2, 
  VolumeX, 
  Share2, 
  Sparkles
} from 'lucide-react';
import { SecurityEvent } from '../../types';
import { DEMO_MEDIA_CATALOG, DemoMediaItem } from '../../data/demoMedia';

interface InstagramSimulatorProps {
  events: SecurityEvent[];
  onSendEvent: (payload: {
    platform: string;
    sender_id: string;
    sender_name: string;
    recipient_id: string;
    recipient_name: string;
    content_type: string;
    payload: Record<string, any>;
  }) => Promise<any>;
  onInspectEvent: (event: SecurityEvent) => void;
  onOpenWarning: (event: SecurityEvent) => void;
}

type TabType = 'home' | 'search' | 'create' | 'reels' | 'profile' | 'dms' | 'activity';

interface PostItem {
  id: string;
  author: string;
  handle: string;
  avatarUrl: string;
  mediaUrl: string;
  isVideo?: boolean;
  caption: string;
  hashtags: string[];
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
  comments: { user: string; text: string }[];
  timestamp: string;
  isThreat: boolean;
  classification: string;
  riskScore: number;
  riskLevel: string;
  reasons: string[];
  rawEvent?: SecurityEvent;
}

export const InstagramSimulator: React.FC<InstagramSimulatorProps> = ({
  events,
  onSendEvent,
  onInspectEvent,
  onOpenWarning
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  // Interaction states
  const [activeStory, setActiveStory] = useState<any | null>(null);
  const [activeReelIndex] = useState<number>(0);
  const [reelMuted, setReelMuted] = useState<boolean>(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Direct Messages state
  const [dmText, setDmText] = useState<string>('');
  const [dmSending, setDmSending] = useState<boolean>(false);
  const [activeDmUser, setActiveDmUser] = useState<string>('Marcus Reynolds (SND-IG-001)');
  
  // Create Post state
  const [createStep, setCreateStep] = useState<number>(1);
  const [selectedMediaItem, setSelectedMediaItem] = useState<DemoMediaItem>(
    DEMO_MEDIA_CATALOG.find(m => m.category === 'instagram') || DEMO_MEDIA_CATALOG[0]
  );
  const [customCaption, setCustomCaption] = useState<string>('Sharing updates from the CyberShield developer conference! 🚀🛡️');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [shareResult, setShareResult] = useState<{ status: 'SAFE' | 'THREAT'; message: string } | null>(null);
  
  // Profile state
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  
  // Comments input state per post
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [localPosts, setLocalPosts] = useState<PostItem[]>([]);

  // Stories Data
  const stories = [
    { id: 'st-1', name: 'Your Story', handle: '@receiver_user', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', isUser: true, media: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800', isThreat: false },
    { id: 'st-2', name: 'Marcus', handle: '@marcus_researcher', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', media: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', isThreat: false },
    { id: 'st-3', name: 'Travel', handle: '@liam_explores', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', media: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', isThreat: false },
    { id: 'st-4', name: 'Tech', handle: '@sarah_chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', media: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', isThreat: false },
    { id: 'st-5', name: 'Giveaways', handle: '@crypto_giveaway_bot', avatar: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80', media: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800', isThreat: true, reasons: ['Suspicious cryptocurrency multiplier scheme detected'] }
  ];

  // Merge backend events with demo catalog into live feed
  const feedPosts = useMemo<PostItem[]>(() => {
    const igEvents = events.filter(e => e.platform === 'instagram' || e.content_type === 'profile');
    
    const eventPosts: PostItem[] = igEvents.map((evt) => {
      const isThreat = evt.ai_result?.classification !== 'SAFE';
      const defaultMedia = isThreat ? DEMO_MEDIA_CATALOG[4].mediaUrl : DEMO_MEDIA_CATALOG[1].mediaUrl;
      return {
        id: evt.event_id,
        author: evt.sender_id.split('(')[0].trim() || 'Marcus Reynolds',
        handle: `@${(evt.sender_id.split('(')[0].trim() || 'marcus_researcher').toLowerCase().replace(/\s+/g, '_')}`,
        avatarUrl: isThreat ? 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        mediaUrl: evt.content_reference || defaultMedia,
        isVideo: evt.content_type === 'video',
        caption: evt.content_preview || 'Instagram simulated interaction payload.',
        hashtags: isThreat ? ['#giveaway', '#crypto', '#win'] : ['#cybershield', '#research', '#security'],
        likes: isThreat ? 12 : 340,
        isLiked: false,
        isSaved: false,
        comments: [
          { user: 'alex_vance', text: isThreat ? 'Flagged by CyberShield scanner!' : 'Looks great, verified!' }
        ],
        timestamp: evt.created_at ? evt.created_at.split('T')[1]?.slice(0, 5) || 'Just now' : 'Just now',
        isThreat,
        classification: evt.ai_result?.classification || 'SAFE',
        riskScore: evt.ai_result?.risk_score || 8,
        riskLevel: evt.ai_result?.risk_level || 'LOW',
        reasons: evt.ai_result?.reasons || ['Clean conversational linguistic profile'],
        rawEvent: evt
      };
    });

    // Default curated posts
    const catalogPosts: PostItem[] = DEMO_MEDIA_CATALOG.filter(m => m.category === 'instagram').map(m => ({
      id: m.id,
      author: m.author,
      handle: m.handle,
      avatarUrl: m.avatarUrl,
      mediaUrl: m.mediaUrl,
      isVideo: m.type === 'video',
      caption: m.caption || m.title,
      hashtags: m.hashtags || ['#social', '#design'],
      likes: m.likes || 120,
      isLiked: false,
      isSaved: false,
      comments: [
        { user: 'sarah_chen', text: 'Stunning capture!' },
        { user: 'marcus_researcher', text: 'Verified and safe.' }
      ],
      timestamp: '2h ago',
      isThreat: m.isThreat,
      classification: m.classification,
      riskScore: m.riskScore,
      riskLevel: m.riskLevel,
      reasons: m.reasons
    }));

    return [...localPosts, ...eventPosts, ...catalogPosts];
  }, [events, localPosts]);

  // Handle like toggle
  const toggleLike = (postId: string) => {
    setLocalPosts(prev => {
      const idx = prev.findIndex(p => p.id === postId);
      if (idx >= 0) {
        const item = { ...prev[idx], isLiked: !prev[idx].isLiked, likes: prev[idx].isLiked ? prev[idx].likes - 1 : prev[idx].likes + 1 };
        return [...prev.slice(0, idx), item, ...prev.slice(idx + 1)];
      }
      return prev;
    });
  };

  // Handle add comment
  const handleAddComment = (postId: string) => {
    const text = newComments[postId]?.trim();
    if (!text) return;
    setLocalPosts(prev => {
      const idx = prev.findIndex(p => p.id === postId);
      if (idx >= 0) {
        const item = { ...prev[idx], comments: [...prev[idx].comments, { user: 'you', text }] };
        return [...prev.slice(0, idx), item, ...prev.slice(idx + 1)];
      }
      return prev;
    });
    setNewComments(prev => ({ ...prev, [postId]: '' }));
  };

  // Handle Create Post & CyberShield Scan
  const handleSharePost = async () => {
    setIsScanning(true);
    setShareResult(null);

    const isThreatItem = selectedMediaItem.isThreat;
    const authorName = 'Receiver User (@receiver_user)';

    try {
      const res = await onSendEvent({
        platform: 'instagram',
        sender_id: 'RCV-IG-001',
        sender_name: authorName,
        recipient_id: 'SND-IG-001',
        recipient_name: 'Marcus Reynolds',
        content_type: selectedMediaItem.type === 'video' ? 'video' : 'message',
        payload: {
          text: customCaption,
          filename: selectedMediaItem.title,
          image_url: selectedMediaItem.mediaUrl,
          bio: customCaption,
          followers: isThreatItem ? 10 : 450,
          following: isThreatItem ? 4000 : 200
        }
      });

      if (res && res.decision === 'ALLOW') {
        const newPost: PostItem = {
          id: res.event_id || `ig-user-${Date.now()}`,
          author: 'You (Receiver)',
          handle: '@receiver_user',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          mediaUrl: selectedMediaItem.mediaUrl,
          isVideo: selectedMediaItem.type === 'video',
          caption: customCaption,
          hashtags: ['#cybershield', '#safe_post'],
          likes: 1,
          isLiked: true,
          isSaved: false,
          comments: [],
          timestamp: 'Just now',
          isThreat: false,
          classification: 'SAFE',
          riskScore: res.risk_score || 8,
          riskLevel: 'LOW',
          reasons: ['Zero deceptive anomalies detected by CyberShield Multimodal Scanner']
        };
        setLocalPosts(prev => [newPost, ...prev]);
        setShareResult({ status: 'SAFE', message: '✓ Content verified safe by CyberShield and published to feed!' });
        setTimeout(() => {
          setActiveTab('home');
          setCreateStep(1);
          setShareResult(null);
        }, 1200);
      } else {
        setShareResult({
          status: 'THREAT',
          message: `🚨 THREAT INTERCEPTED: ${res?.classification || 'MANIPULATED'} (${res?.risk_score || 92}/100). Content isolated in quarantine vault.`
        });
      }
    } catch (e: any) {
      setShareResult({ status: 'THREAT', message: `Scan failed: ${e.message}` });
    } finally {
      setIsScanning(false);
    }
  };

  // Handle Direct Message Send & Reply
  const handleSendDm = async () => {
    if (!dmText.trim()) return;
    setDmSending(true);

    try {
      await onSendEvent({
        platform: 'instagram',
        sender_id: 'RCV-IG-001',
        sender_name: 'Receiver Social User',
        recipient_id: 'SND-IG-001',
        recipient_name: 'Marcus Reynolds',
        content_type: 'message',
        payload: {
          text: dmText
        }
      });
      setDmText('');
    } catch (e) {
      console.error('Failed to send DM:', e);
    } finally {
      setDmSending(false);
    }
  };

  // Direct Messages list
  const igMessages = events.filter(e => e.platform === 'instagram' || e.content_type === 'profile');

  // Reels list
  const reelItems = DEMO_MEDIA_CATALOG.filter(m => m.type === 'video');

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      background: '#000000',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      overflow: 'hidden',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '720px',
      boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)',
      position: 'relative'
    }}>
      
      {/* 1. INSTAGRAM TOP APP BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 18px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {activeTab === 'dms' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <ArrowLeft size={20} />
            </button>
            <strong style={{ fontSize: '0.95rem' }}>{activeDmUser}</strong>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: "'Brush Script MT', cursive, -apple-system, sans-serif",
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Instagram
            </span>
            <span className="badge badge-green" style={{ fontSize: '0.55rem', padding: '1px 5px' }}>
              PROTECTED
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => setActiveTab(activeTab === 'activity' ? 'home' : 'activity')} 
            style={{ background: 'none', border: 'none', color: activeTab === 'activity' ? '#ef4444' : '#fff', cursor: 'pointer', position: 'relative' }}
          >
            <Heart size={22} fill={activeTab === 'activity' ? '#ef4444' : 'none'} />
            {events.some(e => e.platform === 'instagram' && e.ai_result?.classification !== 'SAFE') && (
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab(activeTab === 'dms' ? 'home' : 'dms')} 
            style={{ background: 'none', border: 'none', color: activeTab === 'dms' ? '#3b82f6' : '#fff', cursor: 'pointer', position: 'relative' }}
          >
            <Send size={22} />
            {igMessages.length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#ef4444', color: '#fff', fontSize: '0.6rem', padding: '1px 4px', borderRadius: '10px', fontWeight: 800 }}>
                {igMessages.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. BODY CONTENT (BASED ON ACTIVE TAB) */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '60px' }}>
        
        {/* ========================================================
            TAB 1: HOME FEED (STORIES + POSTS)
            ======================================================== */}
        {activeTab === 'home' && (
          <div>
            {/* Stories Tray */}
            <div style={{
              display: 'flex',
              gap: '14px',
              padding: '12px 14px',
              overflowX: 'auto',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {stories.map(st => (
                <div 
                  key={st.id} 
                  onClick={() => setActiveStory(st)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', minWidth: '64px' }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    padding: '2px',
                    background: st.isThreat ? '#ef4444' : 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={st.avatar} 
                      alt={st.name} 
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #000' }} 
                    />
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#ccc', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {st.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Posts Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '12px 0' }}>
              {feedPosts.map((post) => (
                <div key={post.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
                  
                  {/* Post Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 14px 10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={post.avatarUrl} alt={post.author} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{post.author}</div>
                        <div style={{ fontSize: '0.68rem', color: '#888' }}>{post.handle} • {post.timestamp}</div>
                      </div>
                    </div>

                    <span className={`badge ${post.isThreat ? 'badge-danger' : 'badge-green'}`} style={{ fontSize: '0.58rem' }}>
                      {post.isThreat ? `${post.classification}` : '✓ PROTECTED'}
                    </span>
                  </div>

                  {/* Post Visual Media */}
                  <div style={{ position: 'relative', background: '#111', minHeight: '260px', maxHeight: '420px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {post.isVideo ? (
                      <video 
                        src={post.mediaUrl} 
                        controls 
                        style={{ width: '100%', maxHeight: '420px', objectFit: 'cover' }} 
                      />
                    ) : (
                      <img 
                        src={post.mediaUrl} 
                        alt={post.caption} 
                        style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'cover', filter: post.isThreat ? 'blur(4px)' : 'none' }} 
                      />
                    )}

                    {/* Threat Protection Overlay */}
                    {post.isThreat && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(239, 68, 68, 0.35)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        textAlign: 'center'
                      }}>
                        <ShieldAlert size={40} color="#ef4444" style={{ marginBottom: '8px' }} />
                        <strong style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '4px' }}>
                          🛡️ CYBERSHIELD SECURITY INTERCEPTION
                        </strong>
                        <div style={{ fontSize: '0.72rem', color: '#fee2e2', marginBottom: '12px' }}>
                          Manipulated Social Media Post • Risk Score: <strong>{post.riskScore}/100</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {post.rawEvent && (
                            <button 
                              onClick={() => onOpenWarning(post.rawEvent!)} 
                              className="btn btn-outline" 
                              style={{ fontSize: '0.7rem', padding: '4px 10px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.6)' }}
                            >
                              <ShieldAlert size={12} /> Warning Card
                            </button>
                          )}
                          {post.rawEvent && (
                            <button 
                              onClick={() => onInspectEvent(post.rawEvent!)} 
                              className="btn btn-outline" 
                              style={{ fontSize: '0.7rem', padding: '4px 10px', color: '#fff' }}
                            >
                              <Eye size={12} /> Inspect ELA
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Actions (Like, Comment, Share, Save) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px 4px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <button 
                        onClick={() => toggleLike(post.id)} 
                        style={{ background: 'none', border: 'none', color: post.isLiked ? '#ef4444' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Heart size={20} fill={post.isLiked ? '#ef4444' : 'none'} />
                      </button>

                      <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                        <MessageCircle size={20} />
                      </button>

                      <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                        <Share2 size={19} />
                      </button>
                    </div>

                    <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                      <Bookmark size={20} />
                    </button>
                  </div>

                  {/* Post Metrics & Caption */}
                  <div style={{ padding: '0 14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                      {post.likes} likes
                    </div>

                    <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                      <strong>{post.handle}</strong> {post.caption}
                    </div>

                    {post.hashtags && post.hashtags.length > 0 && (
                      <div style={{ fontSize: '0.74rem', color: '#3b82f6', marginTop: '2px' }}>
                        {post.hashtags.join(' ')}
                      </div>
                    )}

                    {/* Comments section */}
                    {post.comments.length > 0 && (
                      <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {post.comments.slice(0, 2).map((c, i) => (
                          <div key={i} style={{ fontSize: '0.74rem', color: '#ccc' }}>
                            <strong style={{ color: '#fff' }}>{c.user}</strong> {c.text}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="Add a comment..."
                        value={newComments[post.id] || ''}
                        onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        style={{
                          flex: 1,
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#fff',
                          fontSize: '0.74rem',
                          padding: '4px 0',
                          outline: 'none'
                        }}
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)} 
                        style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: SEARCH & EXPLORE GRID
            ======================================================== */}
        {activeTab === 'search' && (
          <div style={{ padding: '14px' }}>
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search size={16} color="#888" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input 
                type="text" 
                placeholder="Search users, hashtags, topics (#travel, @marcus)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '8px 12px 8px 34px',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Explore Media Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {DEMO_MEDIA_CATALOG.filter(m => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return m.title.toLowerCase().includes(q) || m.author.toLowerCase().includes(q) || (m.caption || '').toLowerCase().includes(q);
              }).map((item) => (
                <div 
                  key={item.id}
                  style={{
                    position: 'relative',
                    aspectRatio: '1/1',
                    background: '#111',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                >
                  <img src={item.thumbnailUrl || item.mediaUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {item.type === 'video' && (
                    <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '2px 4px' }}>
                      <Film size={12} color="#fff" />
                    </div>
                  )}
                  {item.isThreat && (
                    <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#ef4444', borderRadius: '4px', padding: '1px 4px', fontSize: '0.55rem', fontWeight: 800 }}>
                      THREAT
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: CREATE POST (+) WITH CYBERSHIELD SCAN
            ======================================================== */}
        {activeTab === 'create' && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
              <strong style={{ fontSize: '0.95rem' }}>Create New Instagram Post</strong>
              <span className="badge badge-blue" style={{ fontSize: '0.6rem' }}>STEP {createStep}/2</span>
            </div>

            {/* Step 1: Media Selection */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#aaa', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                1. Select Media from Demo Catalog:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', maxHeight: '180px', overflowY: 'auto', padding: '4px', background: '#111', borderRadius: '8px' }}>
                {DEMO_MEDIA_CATALOG.filter(m => m.category === 'instagram' || m.category === 'photos').map((m) => {
                  const isSel = selectedMediaItem.id === m.id;
                  return (
                    <div 
                      key={m.id} 
                      onClick={() => setSelectedMediaItem(m)}
                      style={{
                        position: 'relative',
                        aspectRatio: '1/1',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: isSel ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <img src={m.thumbnailUrl || m.mediaUrl} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {m.isThreat && (
                        <div style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: '#fff', fontSize: '0.5rem', padding: '1px 3px', borderRadius: '2px', fontWeight: 800 }}>
                          ALERT
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Live Media Preview */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#aaa', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                2. Live Media Preview ({selectedMediaItem.title}):
              </label>
              <div style={{ maxHeight: '200px', background: '#111', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedMediaItem.type === 'video' ? (
                  <video src={selectedMediaItem.mediaUrl} controls style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                ) : (
                  <img src={selectedMediaItem.mediaUrl} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                )}
              </div>
            </div>

            {/* Step 3: Caption Input */}
            <div>
              <label style={{ fontSize: '0.78rem', color: '#aaa', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                3. Post Caption & Hashtags:
              </label>
              <textarea 
                rows={3}
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                placeholder="Write a caption..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '10px',
                  fontSize: '0.8rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {shareResult && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                background: shareResult.status === 'SAFE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: shareResult.status === 'SAFE' ? '1px solid #10b981' : '1px solid #ef4444',
                color: shareResult.status === 'SAFE' ? '#34d399' : '#f87171'
              }}>
                {shareResult.message}
              </div>
            )}

            {/* Step 4: Share button with AI Scan */}
            <button 
              onClick={handleSharePost}
              disabled={isScanning}
              style={{
                background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={16} />
              {isScanning ? 'Running CyberShield Multimodal Security Scan...' : 'Scan & Share Post to Instagram'}
            </button>
          </div>
        )}

        {/* ========================================================
            TAB 4: REELS (VERTICAL FEED)
            ======================================================== */}
        {activeTab === 'reels' && (
          <div style={{ position: 'relative', height: '620px', background: '#000', overflow: 'hidden' }}>
            {reelItems.length > 0 && (
              <div style={{ height: '100%', position: 'relative' }}>
                <video 
                  src={reelItems[activeReelIndex].mediaUrl}
                  autoPlay
                  loop
                  muted={reelMuted}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Sound toggle & play overlay */}
                <button 
                  onClick={() => setReelMuted(!reelMuted)}
                  style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {reelMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                {/* Right Reel Actions */}
                <div style={{ position: 'absolute', bottom: '40px', right: '14px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <Heart size={24} fill="#fff" />
                    <span style={{ fontSize: '0.65rem' }}>14.2K</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <MessageCircle size={24} />
                    <span style={{ fontSize: '0.65rem' }}>842</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <Share2 size={22} />
                    <span style={{ fontSize: '0.65rem' }}>Share</span>
                  </div>
                </div>

                {/* Bottom Reel Author Info */}
                <div style={{ position: 'absolute', bottom: '20px', left: '16px', right: '70px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <img src={reelItems[activeReelIndex].avatarUrl} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                    <strong style={{ fontSize: '0.82rem' }}>{reelItems[activeReelIndex].handle}</strong>
                    <span className="badge badge-green" style={{ fontSize: '0.55rem' }}>✓ VERIFIED</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#eee', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                    {reelItems[activeReelIndex].caption || reelItems[activeReelIndex].title}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 5: USER PROFILE
            ======================================================== */}
        {activeTab === 'profile' && (
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                alt="Profile" 
                style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }} 
              />
              <div style={{ display: 'flex', gap: '18px', textAlign: 'center' }}>
                <div><strong style={{ fontSize: '0.95rem' }}>14</strong><div style={{ fontSize: '0.68rem', color: '#888' }}>Posts</div></div>
                <div><strong style={{ fontSize: '0.95rem' }}>1,420</strong><div style={{ fontSize: '0.68rem', color: '#888' }}>Followers</div></div>
                <div><strong style={{ fontSize: '0.95rem' }}>380</strong><div style={{ fontSize: '0.68rem', color: '#888' }}>Following</div></div>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <strong style={{ fontSize: '0.88rem' }}>Marcus Reynolds</strong>
              <div style={{ fontSize: '0.72rem', color: '#888' }}>@marcus_researcher</div>
              <div style={{ fontSize: '0.76rem', color: '#ccc', marginTop: '4px' }}>
                Cybersecurity Researcher • Zero-Trust Architect • CyberShield AI Sim Lab
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                style={{
                  flex: 1,
                  background: isFollowing ? 'rgba(255,255,255,0.1)' : '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 0',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>

              <button 
                onClick={() => { setActiveTab('dms'); setActiveDmUser('Marcus Reynolds (SND-IG-001)'); }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  padding: '7px 0',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Message
              </button>
            </div>

            {/* Profile Media Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {DEMO_MEDIA_CATALOG.filter(m => m.category === 'instagram' || m.category === 'photos').map((m) => (
                <div key={m.id} style={{ aspectRatio: '1/1', background: '#111', overflow: 'hidden' }}>
                  <img src={m.thumbnailUrl || m.mediaUrl} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: DIRECT MESSAGES (DMs) & TWO-WAY REPLY
            ======================================================== */}
        {activeTab === 'dms' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '620px', background: '#000' }}>
            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.72rem', color: '#aaa' }}>
              Direct Chat with <strong>Marcus Reynolds</strong> (<code style={{ color: '#34d399' }}>SND-IG-001</code>). Live CyberShield gateway screening.
            </div>

            {/* Messages Stream */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {igMessages.map((msg) => {
                const isThreat = msg.ai_result?.classification !== 'SAFE';
                const isOutbound = msg.sender_id.includes('RCV') || msg.sender_id.includes('Receiver');

                return (
                  <div 
                    key={msg.event_id}
                    style={{
                      alignSelf: isOutbound ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: '10px 12px',
                      borderRadius: '14px',
                      background: isThreat ? 'rgba(239, 68, 68, 0.15)' : isOutbound ? '#3b82f6' : 'rgba(255, 255, 255, 0.12)',
                      border: isThreat ? '1px solid #ef4444' : 'none',
                      color: '#fff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: isOutbound ? '#bfdbfe' : '#aaa', marginBottom: '4px' }}>
                      <span>{isOutbound ? 'You' : msg.sender_id}</span>
                      <span className={`badge ${isThreat ? 'badge-danger' : 'badge-green'}`} style={{ fontSize: '0.52rem' }}>
                        {isThreat ? msg.ai_result?.classification : '✓ DELIVERED'}
                      </span>
                    </div>

                    {isThreat ? (
                      <div>
                        <div style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldAlert size={14} /> ⚠️ QUARANTINED INSTAGRAM DM
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#fca5a5', marginTop: '2px' }}>
                          Intercepted: {msg.ai_result?.reasons?.[0] || 'Deceptive profile / cryptocurrency giveaway keywords.'}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                        {msg.content_preview || msg.raw_content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Direct Message Reply Input (Targets SND-IG-001) */}
            <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '8px', background: '#000' }}>
              <input 
                type="text" 
                placeholder="Reply to Marcus Reynolds (SND-IG-001)..."
                value={dmText}
                onChange={(e) => setDmText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendDm()}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '20px',
                  color: '#fff',
                  padding: '8px 14px',
                  fontSize: '0.78rem',
                  outline: 'none'
                }}
              />
              <button 
                onClick={handleSendDm}
                disabled={dmSending || !dmText.trim()}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Send size={13} /> {dmSending ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: NOTIFICATIONS & ACTIVITY (HEART)
            ======================================================== */}
        {activeTab === 'activity' && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <strong style={{ fontSize: '0.95rem' }}>Instagram Activity & Security Notifications</strong>

            {/* Security notifications from real events */}
            {events.filter(e => e.platform === 'instagram').map((evt) => {
              const isThreat = evt.ai_result?.classification !== 'SAFE';
              return (
                <div 
                  key={evt.event_id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: isThreat ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                    border: isThreat ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isThreat ? <ShieldAlert size={20} color="#ef4444" /> : <ShieldCheck size={20} color="#10b981" />}
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                        {isThreat ? '🛡️ CyberShield Intercepted Instagram Threat' : '✓ Safe Content Delivered'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#888' }}>
                        From: {evt.sender_id} • Score: {evt.ai_result?.risk_score}/100
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${isThreat ? 'badge-danger' : 'badge-green'}`} style={{ fontSize: '0.55rem' }}>
                    {evt.final_action}
                  </span>
                </div>
              );
            })}

            {/* Standard social notifications */}
            <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Heart size={18} color="#ef4444" fill="#ef4444" />
              <div style={{ fontSize: '0.76rem' }}><strong>elena_designs</strong> liked your photo.</div>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={18} color="#3b82f6" />
              <div style={{ fontSize: '0.76rem' }}><strong>liam_explores</strong> started following you.</div>
            </div>
          </div>
        )}
      </div>

      {/* 3. INSTAGRAM BOTTOM NAVIGATION BAR */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '52px',
        background: 'rgba(0, 0, 0, 0.95)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 50
      }}>
        <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: activeTab === 'home' ? '#fff' : '#888', cursor: 'pointer' }}>
          <Home size={22} />
        </button>

        <button onClick={() => setActiveTab('search')} style={{ background: 'none', border: 'none', color: activeTab === 'search' ? '#fff' : '#888', cursor: 'pointer' }}>
          <Search size={22} />
        </button>

        <button 
          onClick={() => setActiveTab('create')} 
          style={{
            background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)',
            border: 'none',
            color: '#fff',
            borderRadius: '10px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(220, 39, 67, 0.4)'
          }}
        >
          <PlusSquare size={20} />
        </button>

        <button onClick={() => setActiveTab('reels')} style={{ background: 'none', border: 'none', color: activeTab === 'reels' ? '#fff' : '#888', cursor: 'pointer' }}>
          <Film size={22} />
        </button>

        <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? '#fff' : '#888', cursor: 'pointer' }}>
          <User size={22} />
        </button>
      </div>

      {/* 4. FULL-SCREEN STORY VIEWER MODAL */}
      {activeStory && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Top progress bar */}
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.3)', margin: '8px 12px 0 12px', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: '#fff', animation: 'progress 5s linear' }} />
          </div>

          {/* Story Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={activeStory.avatar} alt="Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              <strong style={{ fontSize: '0.8rem' }}>{activeStory.name}</strong>
              <span className={`badge ${activeStory.isThreat ? 'badge-danger' : 'badge-green'}`} style={{ fontSize: '0.5rem' }}>
                {activeStory.isThreat ? 'THREAT' : '✓ VERIFIED'}
              </span>
            </div>
            <button onClick={() => setActiveStory(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Story Media & Overlay */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={activeStory.media} alt="Story" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: activeStory.isThreat ? 'blur(6px)' : 'none' }} />
            
            {activeStory.isThreat && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(239, 68, 68, 0.4)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '10px' }} />
                <strong style={{ fontSize: '1rem', color: '#fff' }}>🛡️ STORY QUARANTINED</strong>
                <div style={{ fontSize: '0.74rem', color: '#fee2e2', marginTop: '6px' }}>
                  {activeStory.reasons?.[0] || 'Deceptive promotional lure blocked by CyberShield.'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
