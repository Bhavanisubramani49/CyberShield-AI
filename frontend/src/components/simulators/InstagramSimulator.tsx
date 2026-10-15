import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft,
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  PlusSquare, 
  Search, 
  Home, 
  Compass,
  User, 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  Share2, 
  Sparkles,
  Grid,
  List,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Shield,
  Video,
  Info,
  Ban,
  Check
} from 'lucide-react';
import { SecurityEvent, UserProfile } from '../../types';
import { getActiveUser } from '../../services/auth';
import { 
  INSTAGRAM_50_POSTS, 
  INSTAGRAM_20_PROFILES, 
  InstagramPost, 
  InstagramProfile 
} from '../../data/instagramDataset';

interface InstagramSimulatorProps {
  events: SecurityEvent[];
  currentUser?: UserProfile | null;
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

type MainSection = 'feed' | 'profile_scanner';
type FeedTab = 'home' | 'explore' | 'reels' | 'create' | 'dms' | 'activity';
type ViewMode = 'grid' | 'feed';

export const InstagramSimulator: React.FC<InstagramSimulatorProps> = ({
  events,
  currentUser,
  onSendEvent,
  onInspectEvent,
  onOpenWarning
}) => {
  const currentAuthUser = currentUser || getActiveUser();
  const accountOwnerName = currentAuthUser.fullName;
  const accountHandle = `@${accountOwnerName.toLowerCase().replace(/\s+/g, '_')}`;

  // Navigation State
  const [mainSection, setMainSection] = useState<MainSection>('feed');
  const [activeTab, setActiveTab] = useState<FeedTab>('home');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Handle browser Back button (popstate) integration
  useEffect(() => {
    const handlePopState = () => {
      setMainSection('feed');
      setActiveTab('home');
      setSelectedPost(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Posts State (Starts with dataset posts, dynamic events added on top)
  const [posts, setPosts] = useState<InstagramPost[]>(INSTAGRAM_50_POSTS);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [activeStory, setActiveStory] = useState<any | null>(null);

  // Video Analysis State & Single-Trigger Deduplication Ref
  const analyzedVideoIdsRef = useRef<Set<string>>(new Set());
  const [videoAnalysisMap, setVideoAnalysisMap] = useState<Record<string, {
    model_status: string;
    classification: string;
    risk_score: number;
    risk_level: string;
    forensic_reasons: string[];
  }>>({});
  const [videoActionsMap, setVideoActionsMap] = useState<Record<string, 'ALLOW' | 'BLOCK'>>({});

  const analyzeReelVideo = async (post: InstagramPost) => {
    if (!post || post.media_type !== 'video' || analyzedVideoIdsRef.current.has(post.id)) {
      return;
    }

    analyzedVideoIdsRef.current.add(post.id);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/video/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `${post.id}.mp4`,
          source_platform: 'instagram',
          sender_id: post.username,
          sender_name: post.authorName,
          sender_type: post.expected_classification !== 'ORIGINAL' ? 'simulated_attacker' : 'normal_user',
          duration_sec: post.video_metadata?.duration_sec || 15.0,
          fps: post.video_metadata?.fps || 30.0
        })
      });

      if (!res.ok) throw new Error(`Video API status ${res.status}`);
      const data = await res.json();

      setVideoAnalysisMap(prev => ({
        ...prev,
        [post.id]: {
          model_status: data.model_status || 'MODEL_NOT_TRAINED',
          classification: data.classification || 'MODEL_NOT_TRAINED',
          risk_score: data.risk_score || 0,
          risk_level: data.risk_level || 'MODEL_NOT_TRAINED',
          forensic_reasons: data.forensic_reasons || []
        }
      }));

      const isThreat = data.classification === 'MANIPULATED' || data.classification === 'DEEPFAKE';
      if (isThreat) {
        const syntheticEvent: SecurityEvent = {
          event_id: post.id,
          sender_id: post.username,
          sender_type: 'simulated_attacker',
          receiver_id: 'RCV-IG-001',
          receiver_surface: 'Instagram Reels',
          platform: 'instagram',
          content_type: 'video',
          content_preview: post.caption,
          content_reference: post.video_url || post.image_path,
          created_at: new Date().toISOString(),
          received_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          status: 'analyzed',
          classification: data.classification,
          risk_score: data.risk_score || 92,
          risk_level: data.risk_level || 'HIGH',
          confidence: 0.96,
          ai_model: 'deepfake_video_pipeline',
          forensic_reasons: data.forensic_reasons || ['Deepfake video warping artifacts detected'],
          recommended_action: 'QUARANTINE',
          final_action: 'QUARANTINE',
          timeline: []
        };

        onInspectEvent(syntheticEvent);
        onOpenWarning(syntheticEvent);
      }
    } catch (err) {
      console.error("Video security pipeline call error:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'reels') {
      const reelPosts = posts.filter(p => p.media_type === 'video');
      reelPosts.forEach(p => analyzeReelVideo(p));
    }
    if (selectedPost && selectedPost.media_type === 'video') {
      analyzeReelVideo(selectedPost);
    }
  }, [activeTab, selectedPost, posts]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'safe' | 'threat'>('all');

  // Create Post State
  const [createImageIndex, setCreateImageIndex] = useState<number>(0);
  const [createCaption, setCreateCaption] = useState<string>('');
  const [createScanning, setCreateScanning] = useState<boolean>(false);
  const [createResult, setCreateResult] = useState<any | null>(null);

  // Profile Authenticity Scanner State
  const [selectedProfileUsername, setSelectedProfileUsername] = useState<string>('@marcus_researcher');
  const [profileUrlInput, setProfileUrlInput] = useState<string>('https://instagram.com/marcus_researcher');
  const [profileAnalyzing, setProfileAnalyzing] = useState<boolean>(false);
  const [profileAnalysisResult, setProfileAnalysisResult] = useState<InstagramProfile | null>(
    INSTAGRAM_20_PROFILES[0]
  );
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({
    '@marcus_researcher': true,
    '@elena_designs': true
  });

  // Direct Messages State
  const [dmText, setDmText] = useState<string>('');
  const [dmSending, setDmSending] = useState<boolean>(false);

  // Active Post Interactions (Likes & Comments)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [commentInput, setCommentInput] = useState<string>('');

  // Stories Data
  const stories = useMemo(() => [
    { id: 's1', user: 'Your Story', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800', isThreat: false, caption: 'Sunset in Tokyo 🌇' },
    { id: 's2', user: 'marcus_r', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', isThreat: false, caption: 'Deploying zero-trust core ☕' },
    { id: 's3', user: 'elena_d', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', isThreat: false, caption: 'New studio aesthetics' },
    { id: 's4', user: 'liam_w', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', isThreat: false, caption: 'Alpine ridge hike 🏔️' },
    { id: 's5', user: 'crypto_bot', avatar: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150', image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800', isThreat: true, caption: 'FREE BTC AIRDROP 500% RETURN' }
  ], []);

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Filter by threat status
      if (activeFilter === 'safe' && post.expected_classification !== 'ORIGINAL') return false;
      if (activeFilter === 'threat' && post.expected_classification === 'ORIGINAL') return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUser = post.username.toLowerCase().includes(q) || post.authorName.toLowerCase().includes(q);
        const matchesCaption = post.caption.toLowerCase().includes(q);
        const matchesTags = post.hashtags.some(t => t.toLowerCase().includes(q));
        const matchesClass = post.expected_classification.toLowerCase().includes(q);
        return matchesUser || matchesCaption || matchesTags || matchesClass;
      }
      return true;
    });
  }, [posts, activeFilter, searchQuery]);

  // Instagram DMs from Backend Events
  const instagramEvents = useMemo(() => {
    return events.filter(e => {
      const p = (e.platform || '').toLowerCase();
      const s = (e.receiver_surface || '').toLowerCase();
      const n = (e.sender_id || '').toLowerCase();
      return p === 'instagram' || s.includes('instagram') || s.includes('social') || n.includes('ig') || n.includes('marcus');
    });
  }, [events]);

  const unreadCount = useMemo(() => {
    return instagramEvents.filter(e => (e.final_action === 'QUARANTINE' || e.final_action === 'BLOCK') && !e.user_action).length;
  }, [instagramEvents]);

  // Like Toggle
  const toggleLike = (postId: string) => {
    setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Bookmark Toggle
  const toggleBookmark = (postId: string) => {
    setSavedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Add Comment to Post
  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;
    const newComment = { user: accountHandle.replace('@', ''), text: commentInput.trim(), time: "Just now" };
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          commentsList: [newComment, ...p.commentsList]
        };
      }
      return p;
    }));
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(prev => prev ? {
        ...prev,
        commentsCount: prev.commentsCount + 1,
        commentsList: [newComment, ...prev.commentsList]
      } : null);
    }
    setCommentInput('');
  };

  // Profile Analysis Trigger
  const handleAnalyzeProfile = (profileUsername: string) => {
    setProfileAnalyzing(true);
    setTimeout(() => {
      const found = INSTAGRAM_20_PROFILES.find(p => p.username.toLowerCase() === profileUsername.toLowerCase()) || INSTAGRAM_20_PROFILES[0];
      setProfileAnalysisResult(found);
      setSelectedProfileUsername(found.username);
      setProfileUrlInput(`https://instagram.com/${found.username.replace('@', '')}`);
      setProfileAnalyzing(false);
    }, 400);
  };

  // Create Post Submit via CyberShield Gateway
  const handleCreatePost = async () => {
    const selectedTemplate = INSTAGRAM_50_POSTS[createImageIndex % INSTAGRAM_50_POSTS.length];
    setCreateScanning(true);
    setCreateResult(null);

    try {
      const response = await onSendEvent({
        platform: 'instagram',
        sender_id: 'SND-IG-001',
        sender_name: 'Marcus Reynolds',
        recipient_id: 'RCV-IG-001',
        recipient_name: 'Receiver Social User',
        content_type: 'image',
        payload: {
          text: createCaption || selectedTemplate.caption,
          image_url: selectedTemplate.image_path,
          hashtags: selectedTemplate.hashtags
        }
      });

      const isThreat = response.decision === 'QUARANTINE' || response.decision === 'BLOCK';
      const newPost: InstagramPost = {
        id: response.event_id || `IG-USER-${Date.now()}`,
        image_path: selectedTemplate.image_path,
        thumbnail_path: selectedTemplate.thumbnail_path,
        expected_classification: isThreat ? 'MANIPULATED' : 'ORIGINAL',
        source_dataset: 'User_Uploaded_Live_Stream',
        detector_type: 'image_manipulation_ai',
        username: accountHandle,
        authorName: accountOwnerName,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        caption: createCaption || selectedTemplate.caption,
        hashtags: ['#cybershield', '#protection', '#verified'],
        likes: 1,
        commentsCount: 0,
        commentsList: [],
        timestamp: 'Just now',
        risk_score: response.risk_score || (isThreat ? 92 : 8),
        risk_level: response.risk_level || (isThreat ? 'HIGH' : 'LOW'),
        forensic_reasons: response.reasons || (isThreat ? ['Manipulated pixel noise artifacts detected'] : ['Authentic Bayer sensor grid verified'])
      };

      setCreateResult({
        decision: response.decision,
        risk_score: response.risk_score,
        reasons: response.reasons || []
      });

      // Add to beginning of grid
      setPosts(prev => [newPost, ...prev]);
      setCreateCaption('');
    } catch (err) {
      console.error("Create post error:", err);
    } finally {
      setCreateScanning(false);
    }
  };

  // Send Direct Message Reply (Exact RCV-IG-001 -> SND-IG-001)
  const handleSendDM = async () => {
    if (!dmText.trim() || dmSending) return;
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
          text: dmText.trim()
        }
      });
      setDmText('');
    } catch (err) {
      console.error("DM send error:", err);
    } finally {
      setDmSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '960px', margin: '0 auto', background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', overflow: 'hidden', color: '#f8fafc', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
      
      {/* 1. TOP HEADER & MAIN SECTION SWITCHER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 30 }}>
        
        {/* Instagram Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {(activeTab !== 'home' || selectedPost || mainSection !== 'feed') && (
            <button
              onClick={() => {
                setMainSection('feed');
                setActiveTab('home');
                setSelectedPost(null);
              }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '5px 10px',
                color: '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
              title="Back to Instagram Feed"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
          <span style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.5px', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Instagram
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '20px', fontSize: '0.68rem', color: '#4ade80', fontWeight: 600 }}>
            <ShieldCheck size={12} color="#4ade80" /> CyberShield Protected
          </div>
        </div>

        {/* Section Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => { setMainSection('feed'); setActiveTab('home'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: mainSection === 'feed' ? 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(16,185,129,0.15))' : 'transparent',
              color: mainSection === 'feed' ? '#4ade80' : '#94a3b8'
            }}
          >
            <Grid size={14} /> Feed & 3-Col Grid
          </button>

          <button
            onClick={() => { setMainSection('profile_scanner'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: mainSection === 'profile_scanner' ? 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(37,99,235,0.15))' : 'transparent',
              color: mainSection === 'profile_scanner' ? '#60a5fa' : '#94a3b8'
            }}
          >
            <User size={14} /> Profile Authenticity Scanner
          </button>
        </div>

        {/* Action Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => { setMainSection('feed'); setActiveTab('dms'); }}
            style={{ position: 'relative', background: 'none', border: 'none', color: activeTab === 'dms' && mainSection === 'feed' ? '#4ade80' : '#cbd5e1', cursor: 'pointer' }}
            title="Direct Messages"
          >
            <Send size={20} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#ef4444', color: '#fff', fontSize: '0.62rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setMainSection('feed'); setActiveTab('activity'); }}
            style={{ background: 'none', border: 'none', color: activeTab === 'activity' && mainSection === 'feed' ? '#ec4899' : '#cbd5e1', cursor: 'pointer' }}
            title="Activity Notifications"
          >
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* 2. SECTION A: FEED & 3-COLUMN IMAGE GRID */}
      {mainSection === 'feed' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Sub Navigation Bar for Feed */}
          {activeTab !== 'dms' && activeTab !== 'activity' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              
              {/* Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setActiveFilter('all')}
                  style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, border: '1px solid', borderColor: activeFilter === 'all' ? '#4ade80' : 'rgba(255,255,255,0.1)', background: activeFilter === 'all' ? 'rgba(34,197,94,0.15)' : 'transparent', color: activeFilter === 'all' ? '#4ade80' : '#94a3b8', cursor: 'pointer' }}
                >
                  All (50 Posts)
                </button>
                <button
                  onClick={() => setActiveFilter('safe')}
                  style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, border: '1px solid', borderColor: activeFilter === 'safe' ? '#22c55e' : 'rgba(255,255,255,0.1)', background: activeFilter === 'safe' ? 'rgba(34,197,94,0.2)' : 'transparent', color: activeFilter === 'safe' ? '#4ade80' : '#94a3b8', cursor: 'pointer' }}
                >
                  ✓ Original / Safe (25)
                </button>
                <button
                  onClick={() => setActiveFilter('threat')}
                  style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, border: '1px solid', borderColor: activeFilter === 'threat' ? '#ef4444' : 'rgba(255,255,255,0.1)', background: activeFilter === 'threat' ? 'rgba(239,68,68,0.2)' : 'transparent', color: activeFilter === 'threat' ? '#f87171' : '#94a3b8', cursor: 'pointer' }}
                >
                  ⚠️ Manipulated / Threat (25)
                </button>
              </div>

              {/* Search Box & View Mode Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={14} color="#64748b" style={{ position: 'absolute', left: '8px' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts, users, tags..."
                    style={{ padding: '5px 10px 5px 28px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.75rem', color: '#f8fafc', width: '180px' }}
                  />
                  {searchQuery && (
                    <X size={12} color="#94a3b8" onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '8px', cursor: 'pointer' }} />
                  )}
                </div>

                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{ padding: '5px 8px', background: viewMode === 'grid' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: viewMode === 'grid' ? '#fff' : '#64748b', cursor: 'pointer', borderRadius: '5px 0 0 5px' }}
                    title="3-Column Grid View"
                  >
                    <Grid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('feed')}
                    style={{ padding: '5px 8px', background: viewMode === 'feed' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: viewMode === 'feed' ? '#fff' : '#64748b', cursor: 'pointer', borderRadius: '0 5px 5px 0' }}
                    title="Vertical Scroll Feed"
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'reels' ? (
            <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={22} color="#ec4899" /> Instagram Reels Video Stream
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Real-time MP4 video frame sampling & CyberShield Video Security Pipeline integration (<code style={{ color: '#ec4899' }}>deepfake_video_pipeline</code>).
              </div>

              {posts.filter(p => p.media_type === 'video').map(post => {
                const vAnalysis = videoAnalysisMap[post.id];
                const isBlocked = videoActionsMap[post.id] === 'BLOCK';
                const isAllowed = videoActionsMap[post.id] === 'ALLOW';

                const isModelNotTrained = vAnalysis?.model_status === 'MODEL_NOT_TRAINED' || !vAnalysis;
                const isThreat = !isModelNotTrained && (vAnalysis?.classification === 'DEEPFAKE' || vAnalysis?.classification === 'MANIPULATED') && !isAllowed;

                return (
                  <div
                    key={post.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: isThreat ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '14px',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Reel Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={post.avatarUrl} alt={post.authorName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{post.username}</div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{post.authorName} • {post.timestamp}</div>
                        </div>
                      </div>

                      {/* Pipeline Status Indicator */}
                      <div style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, background: isModelNotTrained ? 'rgba(59, 130, 246, 0.15)' : isThreat ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: isModelNotTrained ? '#60a5fa' : isThreat ? '#f87171' : '#4ade80', border: `1px solid ${isModelNotTrained ? 'rgba(59,130,246,0.3)' : isThreat ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
                        {isModelNotTrained ? 'ℹ️ PIPELINE: MODEL_NOT_TRAINED' : isThreat ? '🚨 DEEPFAKE / THREAT' : '✓ REAL / SAFE'}
                      </div>
                    </div>

                    {/* Reel Video Player / Intercept Area */}
                    <div style={{ position: 'relative', width: '100%', background: '#000' }}>
                      {isBlocked ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                          <Ban size={36} color="#f87171" style={{ marginBottom: '10px' }} />
                          <div style={{ fontSize: '1rem', fontWeight: 800 }}>🚫 Reel Blocked by CyberShield Policy</div>
                          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>Sender {post.username} blocked on Instagram channel.</div>
                          <button
                            onClick={() => setVideoActionsMap(prev => ({ ...prev, [post.id]: 'ALLOW' }))}
                            style={{ marginTop: '12px', padding: '6px 14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Unblock / Allow Playback
                          </button>
                        </div>
                      ) : isThreat ? (
                        /* THREAT / DEEPFAKE INTERCEPTED OVERLAY (Requirement 5) */
                        <div style={{ padding: '30px 20px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fff' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171', fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>
                            <ShieldAlert size={24} color="#f87171" /> 🚨 DEEPFAKE / MANIPULATED REEL INTERCEPTED
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f87171' }}>
                              Classification: {vAnalysis.classification}
                            </span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f87171' }}>
                              Risk Score: {vAnalysis.risk_score}/100 ({vAnalysis.risk_level})
                            </span>
                          </div>

                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                            Why is this dangerous?
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                            {vAnalysis.forensic_reasons.map((reason, idx) => (
                              <div key={idx} style={{ fontSize: '0.74rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#f87171' }}>•</span> {reason}
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => setVideoActionsMap(prev => ({ ...prev, [post.id]: 'BLOCK' }))}
                              style={{ flex: 1, padding: '10px', background: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                              <Ban size={16} /> BLOCK SENDER
                            </button>
                            <button
                              onClick={() => setVideoActionsMap(prev => ({ ...prev, [post.id]: 'ALLOW' }))}
                              style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                              <Check size={16} /> ALLOW PLAYBACK
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* NORMAL / SAFE OR MODEL_NOT_TRAINED VIDEO PLAYBACK (Requirement 2 & 4) */
                        <div style={{ position: 'relative', width: '100%', background: '#000' }}>
                          <video
                            src={post.video_url}
                            poster={post.thumbnail_path}
                            controls
                            loop
                            playsInline
                            style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
                          />

                          {isModelNotTrained && (
                            <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', padding: '6px 10px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', borderRadius: '6px', fontSize: '0.7rem', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Info size={12} color="#60a5fa" />
                              <span>Video Security Pipeline: Awaiting Model Training (MODEL_NOT_TRAINED) — Playing normally</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions & Caption */}
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#e2e8f0', marginBottom: '6px' }}>
                        <strong>{post.username}</strong> {post.caption}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#ec4899' }}>
                        {post.hashtags.join(' ')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'home' || activeTab === 'explore' ? (
            <div>
              {/* Stories Tray */}
              <div style={{ display: 'flex', gap: '14px', padding: '14px 20px', overflowX: 'auto', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {stories.map(s => (
                  <div
                    key={s.id}
                    onClick={() => setActiveStory(s)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <div style={{
                      padding: '2px',
                      borderRadius: '50%',
                      background: s.isThreat ? 'linear-gradient(45deg, #ef4444, #dc2626)' : 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
                    }}>
                      <img
                        src={s.avatar}
                        alt={s.user}
                        style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0b0f19' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.user}
                    </span>
                  </div>
                ))}
              </div>

              {/* View Mode: 3-COLUMN IMAGE GRID */}
              {viewMode === 'grid' ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '4px',
                  padding: '4px'
                }}>
                  {filteredPosts.map(post => {
                    const isThreat = post.expected_classification !== 'ORIGINAL';
                    const isLiked = likedPosts[post.id];

                    return (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        style={{
                          position: 'relative',
                          aspectRatio: '1/1',
                          overflow: 'hidden',
                          background: '#1e293b',
                          cursor: 'pointer',
                          borderRadius: '2px'
                        }}
                      >
                        {/* Real JPG/PNG Image with Lazy Loading */}
                        <img
                          src={post.thumbnail_path}
                          alt={post.caption}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            display: 'block'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; }}
                        />

                        {/* Top-Right CyberShield Security Indicator Badge */}
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          backdropFilter: 'blur(6px)',
                          background: isThreat ? 'rgba(239, 68, 68, 0.85)' : 'rgba(34, 197, 94, 0.85)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}>
                          {isThreat ? <AlertTriangle size={10} color="#fff" /> : <CheckCircle size={10} color="#fff" />}
                          {isThreat ? '⚠️ THREAT' : '✓ SAFE'}
                        </div>

                        {/* Bottom Bar Info Overlay on Hover */}
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '6px 8px',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.72rem',
                          color: '#fff'
                        }}>
                          <span style={{ fontWeight: 600, fontSize: '0.68rem', color: '#cbd5e1' }}>
                            {post.username}
                          </span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Heart size={11} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : '#fff'} />
                              {post.likes + (isLiked ? 1 : 0)}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MessageCircle size={11} /> {post.commentsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* View Mode: VERTICAL SCROLL FEED */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 20px', maxWidth: '600px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                  {filteredPosts.map(post => {
                    const isThreat = post.expected_classification !== 'ORIGINAL';
                    const isLiked = likedPosts[post.id];
                    const isSaved = savedPosts[post.id];

                    return (
                      <div
                        key={post.id}
                        style={{
                          background: 'rgba(15, 23, 42, 0.7)',
                          border: isThreat ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Post Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={post.avatarUrl} alt={post.authorName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{post.username}</div>
                              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{post.authorName} • {post.timestamp}</div>
                            </div>
                          </div>

                          <div style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, background: isThreat ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: isThreat ? '#f87171' : '#4ade80', border: `1px solid ${isThreat ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}` }}>
                            {isThreat ? '⚠️ THREAT DETECTED' : '✓ PROTECTED'}
                          </div>
                        </div>

                        {/* Image Body */}
                        <div style={{ position: 'relative', width: '100%', maxHeight: '450px', overflow: 'hidden', background: '#000', cursor: 'pointer' }} onClick={() => setSelectedPost(post)}>
                          <img src={post.image_path} alt={post.caption} style={{ width: '100%', height: 'auto', maxHeight: '450px', objectFit: 'contain', display: 'block' }} />
                          {isThreat && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={12} /> Splicing / Scam Detected ({post.risk_score}/100)
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                            <button onClick={() => toggleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? '#ef4444' : '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} />
                              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{post.likes + (isLiked ? 1 : 0)}</span>
                            </button>
                            <button onClick={() => setSelectedPost(post)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MessageCircle size={20} />
                              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{post.commentsCount}</span>
                            </button>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f8fafc' }}>
                              <Share2 size={18} />
                            </button>
                          </div>
                          <button onClick={() => toggleBookmark(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSaved ? '#3b82f6' : '#f8fafc' }}>
                            <Bookmark size={20} fill={isSaved ? '#3b82f6' : 'none'} />
                          </button>
                        </div>

                        {/* Caption & CyberShield Security Box */}
                        <div style={{ padding: '0 14px 14px 14px' }}>
                          <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '6px' }}>
                            <strong>{post.username}</strong> {post.caption}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginBottom: '10px' }}>
                            {post.hashtags.join(' ')}
                          </div>

                          {/* Forensic Analysis Accordion */}
                          <div style={{ padding: '8px 10px', background: isThreat ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.08)', border: `1px solid ${isThreat ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`, borderRadius: '6px', fontSize: '0.72rem' }}>
                            <div style={{ fontWeight: 700, color: isThreat ? '#f87171' : '#4ade80', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                              <Shield size={12} /> CyberShield {post.detector_type} Result: {post.expected_classification} (Risk: {post.risk_score}/100 - {post.risk_level})
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>
                              {post.forensic_reasons[0]}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'create' ? (
            /* TAB: CREATE POST (+) WITH REAL-TIME SCAN */
            <div style={{ padding: '24px 20px', maxWidth: '600px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusSquare size={20} color="#4ade80" /> Create Simulated Instagram Post
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '18px' }}>
                Select an image sample, add custom caption, and test CyberShield real-time AI image forensics.
              </div>

              {/* Template Image Picker */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
                  Select Image Asset ({INSTAGRAM_50_POSTS.length} Dataset Samples):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', maxHeight: '180px', overflowY: 'auto', padding: '6px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {INSTAGRAM_50_POSTS.map((p, idx) => (
                    <div
                      key={p.id}
                      onClick={() => setCreateImageIndex(idx)}
                      style={{
                        aspectRatio: '1/1',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: createImageIndex === idx ? '2px solid #4ade80' : '1px solid transparent',
                        position: 'relative'
                      }}
                    >
                      <img src={p.thumbnail_path} alt={p.id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {p.expected_classification !== 'ORIGINAL' && (
                        <div style={{ position: 'absolute', top: 2, right: 2, width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div style={{ display: 'flex', gap: '14px', background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
                <img
                  src={INSTAGRAM_50_POSTS[createImageIndex % INSTAGRAM_50_POSTS.length].thumbnail_path}
                  alt="Selected preview"
                  style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>Caption / Text:</label>
                  <textarea
                    rows={3}
                    value={createCaption}
                    onChange={(e) => setCreateCaption(e.target.value)}
                    placeholder={INSTAGRAM_50_POSTS[createImageIndex % INSTAGRAM_50_POSTS.length].caption}
                    style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.78rem', resize: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {createResult && (
                <div style={{ padding: '10px 14px', background: createResult.decision === 'ALLOW' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${createResult.decision === 'ALLOW' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '8px', marginBottom: '14px', fontSize: '0.78rem' }}>
                  <strong style={{ color: createResult.decision === 'ALLOW' ? '#4ade80' : '#f87171' }}>
                    {createResult.decision === 'ALLOW' ? '✓ Post Scanned & Published' : '⚠️ Post Quarantined by CyberShield'}
                  </strong>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                    Risk Score: {createResult.risk_score}/100 • Reasons: {createResult.reasons.join(', ')}
                  </div>
                </div>
              )}

              <button
                onClick={handleCreatePost}
                disabled={createScanning}
                style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Sparkles size={16} /> {createScanning ? 'Scanning with Multimodal Engine...' : 'Scan & Publish Post to Grid'}
              </button>
            </div>
          ) : activeTab === 'dms' ? (
            /* TAB: DIRECT MESSAGES & TWO-WAY EXACT SENDER REPLY */
            <div style={{ display: 'flex', flexDirection: 'column', height: '520px', background: '#070a12' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" alt="Marcus" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Marcus Reynolds (SND-IG-001)</div>
                  <div style={{ fontSize: '0.68rem', color: '#4ade80' }}>● CyberShield Gateway Channel Connected</div>
                </div>
              </div>

              {/* Message List */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ alignSelf: 'flex-start', maxWidth: '75%', padding: '10px 14px', background: '#1e293b', borderRadius: '14px 14px 14px 2px', fontSize: '0.82rem', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>Loved your new design portfolio post! Let us collaborate on the next security project.</div>
                  <div style={{ fontSize: '0.65rem', color: '#4ade80', marginTop: '4px' }}>✓ Protected by CyberShield Delivered</div>
                </div>

                {instagramEvents.map(evt => {
                  const isThreat = evt.final_action === 'QUARANTINE' || evt.final_action === 'BLOCK';
                  const isFromReceiver = evt.sender_id.includes('RCV-IG-001') || evt.sender_id.includes('Alex');

                  return (
                    <div
                      key={evt.event_id}
                      style={{
                        alignSelf: isFromReceiver ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        padding: '10px 14px',
                        background: isFromReceiver ? '#0284c7' : isThreat ? 'rgba(239, 68, 68, 0.15)' : '#1e293b',
                        border: isThreat ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: isFromReceiver ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        fontSize: '0.82rem',
                        color: '#fff'
                      }}
                    >
                      {isThreat && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171', fontWeight: 700, fontSize: '0.7rem', marginBottom: '4px' }}>
                          <AlertTriangle size={12} /> ⚠️ QUARANTINED INSTAGRAM DM
                        </div>
                      )}
                      <div>{evt.content_preview}</div>
                      <div style={{ fontSize: '0.65rem', color: isFromReceiver ? '#bae6fd' : '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
                        {isFromReceiver ? 'Sent via CyberShield Core' : isThreat ? `Threat (${evt.risk_score}/100)` : '✓ Delivered'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DM Reply Input */}
              <div style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={dmText}
                  onChange={(e) => setDmText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendDM(); }}
                  placeholder="Reply to Marcus Reynolds (SND-IG-001)..."
                  style={{ flex: 1, padding: '10px 14px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: '#fff', fontSize: '0.8rem' }}
                />
                <button
                  onClick={handleSendDM}
                  disabled={dmSending || !dmText.trim()}
                  style={{ padding: '0 16px', background: '#22c55e', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} /> Send
                </button>
              </div>
            </div>
          ) : (
            /* TAB: ACTIVITY DRAWER */
            <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '14px' }}>
                Recent Activity & CyberShield Security Alerts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '8px' }}>
                  <CheckCircle size={18} color="#4ade80" />
                  <div style={{ fontSize: '0.78rem', color: '#f8fafc' }}>
                    <strong>@marcus_researcher</strong> liked your Tokyo architecture photo.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
                  <AlertTriangle size={18} color="#f87171" />
                  <div style={{ fontSize: '0.78rem', color: '#f8fafc' }}>
                    <strong>CyberShield Alert:</strong> Spliced fake giveaway post by @crypto_giveaway_bot_99 was quarantined.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom App Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '12px 0', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setActiveTab('home')}
              style={{ background: 'none', border: 'none', color: activeTab === 'home' ? '#4ade80' : '#94a3b8', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
            >
              <Home size={20} />
              <span style={{ fontSize: '0.62rem', fontWeight: 600 }}>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              style={{ background: 'none', border: 'none', color: activeTab === 'explore' ? '#4ade80' : '#94a3b8', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
            >
              <Compass size={20} />
              <span style={{ fontSize: '0.62rem', fontWeight: 600 }}>Explore</span>
            </button>

            <button
              onClick={() => setActiveTab('reels')}
              style={{ background: 'none', border: 'none', color: activeTab === 'reels' ? '#ec4899' : '#94a3b8', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
            >
              <Video size={20} color={activeTab === 'reels' ? '#ec4899' : '#94a3b8'} />
              <span style={{ fontSize: '0.62rem', fontWeight: 600 }}>Reels</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              style={{ background: 'none', border: 'none', color: activeTab === 'create' ? '#4ade80' : '#94a3b8', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
            >
              <PlusSquare size={22} color={activeTab === 'create' ? '#4ade80' : '#cbd5e1'} />
              <span style={{ fontSize: '0.62rem', fontWeight: 600 }}>Create</span>
            </button>

            <button
              onClick={() => { setMainSection('profile_scanner'); }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
            >
              <User size={20} />
              <span style={{ fontSize: '0.62rem', fontWeight: 600 }}>Profile Scanner</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. SECTION B: PROFILE AUTHENTICITY & LINK SCANNER */}
      {mainSection === 'profile_scanner' && (
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header & Description */}
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={22} color="#60a5fa" /> Instagram Profile Authenticity Scanner
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px' }}>
              Deep bot profiling, follower/following ratio analytics, bio keyword scanners, and fake account detection powered by CyberShield <code style={{ color: '#60a5fa' }}>fake_profile_analyzer_ai</code>.
            </div>
          </div>

          {/* Profile URL Input Bar */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                value={profileUrlInput}
                onChange={(e) => setProfileUrlInput(e.target.value)}
                placeholder="Enter Instagram profile URL or handle (e.g. https://instagram.com/crypto_giveaway_bot_99)"
                style={{ width: '100%', padding: '11px 14px 11px 36px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.82rem', boxSizing: 'border-box' }}
              />
            </div>
            <button
              onClick={() => {
                const parts = profileUrlInput.replace('https://instagram.com/', '').replace('/', '');
                handleAnalyzeProfile(parts.startsWith('@') ? parts : `@${parts}`);
              }}
              disabled={profileAnalyzing}
              style={{ padding: '0 20px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={15} /> {profileAnalyzing ? 'Analyzing...' : 'Analyze Profile'}
            </button>
          </div>

          {/* Quick Demo Profile Selector Pills */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
              Select from Demo Dataset ({INSTAGRAM_20_PROFILES.length} Profiles):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {INSTAGRAM_20_PROFILES.map(p => {
                const isFake = p.expected_classification !== 'AUTHENTIC';
                const isSelected = selectedProfileUsername.toLowerCase() === p.username.toLowerCase();

                return (
                  <button
                    key={p.username}
                    onClick={() => handleAnalyzeProfile(p.username)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '16px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: isSelected ? (isFake ? '#ef4444' : '#3b82f6') : 'rgba(255,255,255,0.1)',
                      background: isSelected ? (isFake ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)') : 'rgba(0,0,0,0.3)',
                      color: isFake ? '#f87171' : '#60a5fa',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isFake ? '⚠️' : '✓'} {p.username}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Profile Card & Authenticity Report */}
          {profileAnalysisResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Instagram Profile Card Header */}
              <div style={{ display: 'flex', gap: '20px', padding: '18px', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img
                  src={profileAnalysisResult.avatarUrl}
                  alt={profileAnalysisResult.name}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                      {profileAnalysisResult.username}
                    </span>
                    {profileAnalysisResult.isVerified && (
                      <CheckCircle size={16} color="#3b82f6" fill="#3b82f6" />
                    )}
                    <button
                      onClick={() => setFollowingMap(prev => ({ ...prev, [profileAnalysisResult.username]: !prev[profileAnalysisResult.username] }))}
                      style={{
                        padding: '4px 14px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        background: followingMap[profileAnalysisResult.username] ? 'rgba(255,255,255,0.1)' : '#3b82f6',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      {followingMap[profileAnalysisResult.username] ? 'Following' : 'Follow'}
                    </button>
                    <button
                      onClick={() => { setMainSection('feed'); setActiveTab('dms'); }}
                      style={{ padding: '4px 14px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}
                    >
                      Message
                    </button>
                  </div>

                  {/* Follower Stats */}
                  <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', marginBottom: '8px' }}>
                    <span><strong>{profileAnalysisResult.postsCount}</strong> posts</span>
                    <span><strong>{profileAnalysisResult.followersCount.toLocaleString()}</strong> followers</span>
                    <span><strong>{profileAnalysisResult.followingCount.toLocaleString()}</strong> following</span>
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{profileAnalysisResult.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>{profileAnalysisResult.bio}</div>
                  {profileAnalysisResult.website && (
                    <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ExternalLink size={11} /> {profileAnalysisResult.website}
                    </div>
                  )}
                </div>
              </div>

              {/* CyberShield Profile Security Report Box */}
              <div style={{
                padding: '16px 18px',
                background: profileAnalysisResult.expected_classification === 'AUTHENTIC' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${profileAnalysisResult.expected_classification === 'AUTHENTIC' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.35)'}`,
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {profileAnalysisResult.expected_classification === 'AUTHENTIC' ? (
                      <ShieldCheck size={22} color="#4ade80" />
                    ) : (
                      <ShieldAlert size={22} color="#f87171" />
                    )}
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: profileAnalysisResult.expected_classification === 'AUTHENTIC' ? '#4ade80' : '#f87171' }}>
                        {profileAnalysisResult.expected_classification === 'AUTHENTIC' ? '✓ LIKELY AUTHENTIC ACCOUNT' : '🚨 FAKE / BOT ACCOUNT DETECTED'}
                      </strong>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        Analyzed via CyberShield <code style={{ color: '#60a5fa' }}>fake_profile_analyzer_ai</code>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: profileAnalysisResult.expected_classification === 'AUTHENTIC' ? '#4ade80' : '#f87171' }}>
                      {profileAnalysisResult.risk_score}<span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>/100</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: profileAnalysisResult.risk_level === 'LOW' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: profileAnalysisResult.risk_level === 'LOW' ? '#4ade80' : '#f87171' }}>
                      {profileAnalysisResult.risk_level} RISK
                    </span>
                  </div>
                </div>

                {/* Forensic Factors */}
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Forensic Evidence & Heuristic Breakdown:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {profileAnalysisResult.forensic_reasons.map((reason, idx) => (
                    <div key={idx} style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: profileAnalysisResult.expected_classification === 'AUTHENTIC' ? '#4ade80' : '#f87171' }}>•</span>
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Posts Grid */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '10px' }}>
                  Recent Posts ({profileAnalysisResult.recentPosts.length} Samples)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                  {profileAnalysisResult.recentPosts.map((imgUrl, idx) => (
                    <div key={idx} style={{ aspectRatio: '1/1', background: '#1e293b', overflow: 'hidden', borderRadius: '2px' }}>
                      <img src={imgUrl} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* 4. INDIVIDUAL POST VIEW MODAL (CLICKED FROM 3-COL GRID) */}
      {selectedPost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#0f172a',
            border: selectedPost.expected_classification !== 'ORIGINAL' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            maxWidth: '850px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            
            {/* Left Side: High Resolution Image */}
            <div style={{ flex: 1.2, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <img
                src={selectedPost.image_path}
                alt={selectedPost.caption}
                style={{ width: '100%', height: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
              />

              {/* Warning Overlay on Image if Threat */}
              {selectedPost.expected_classification !== 'ORIGINAL' && (
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  right: '14px',
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.9)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={18} color="#fff" />
                  <div>
                    <div>⚠️ CYBERSHIELD SECURITY WARNING</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 500 }}>
                      Image splicing / deceptive financial fraud heuristics detected ({selectedPost.risk_score}/100)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Details, Comments & CyberShield Forensic Box */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.08)', background: '#0b0f19' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={selectedPost.avatarUrl} alt={selectedPost.username} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{selectedPost.username}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{selectedPost.authorName} • {selectedPost.timestamp}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Comments & Caption */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Author Caption */}
                <div style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                  <strong style={{ color: '#fff' }}>{selectedPost.username}</strong> {selectedPost.caption}
                  <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '4px' }}>
                    {selectedPost.hashtags.join(' ')}
                  </div>
                </div>

                {/* CyberShield Image Analysis Card */}
                <div style={{
                  padding: '12px 14px',
                  background: selectedPost.expected_classification === 'ORIGINAL' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${selectedPost.expected_classification === 'ORIGINAL' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.35)'}`,
                  borderRadius: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: selectedPost.expected_classification === 'ORIGINAL' ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {selectedPost.expected_classification === 'ORIGINAL' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                      {selectedPost.expected_classification === 'ORIGINAL' ? '✓ CYBERSHIELD VERIFIED' : '⚠️ CYBERSHIELD WARNING'}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: selectedPost.expected_classification === 'ORIGINAL' ? '#4ade80' : '#f87171' }}>
                      {selectedPost.risk_score}/100 ({selectedPost.risk_level})
                    </span>
                  </div>

                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '6px' }}>
                    Detector: <code style={{ color: '#60a5fa' }}>{selectedPost.detector_type}</code> • Dataset: <code style={{ color: '#cbd5e1' }}>{selectedPost.source_dataset}</code>
                  </div>

                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                    {selectedPost.forensic_reasons.map((r, i) => (
                      <div key={i} style={{ marginTop: '2px' }}>• {r}</div>
                    ))}
                  </div>

                  {selectedPost.expected_classification !== 'ORIGINAL' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        onClick={() => {
                          const syntheticEvent: SecurityEvent = {
                            event_id: selectedPost.id,
                            sender_id: selectedPost.username,
                            sender_type: 'simulated_attacker',
                            receiver_id: 'RCV-IG-001',
                            receiver_surface: 'Instagram Feed',
                            platform: 'instagram',
                            content_type: 'image',
                            content_preview: selectedPost.caption,
                            content_reference: selectedPost.image_path,
                            created_at: new Date().toISOString(),
                            received_at: new Date().toISOString(),
                            processed_at: new Date().toISOString(),
                            timestamp: new Date().toISOString(),
                            status: 'analyzed',
                            classification: selectedPost.expected_classification,
                            risk_score: selectedPost.risk_score,
                            risk_level: selectedPost.risk_level,
                            confidence: 0.96,
                            ai_model: selectedPost.detector_type,
                            forensic_reasons: selectedPost.forensic_reasons,
                            recommended_action: 'QUARANTINE',
                            final_action: 'QUARANTINE',
                            timeline: []
                          };
                          onOpenWarning(syntheticEvent);
                        }}
                        style={{ flex: 1, padding: '6px 10px', background: 'rgba(239, 68, 68, 0.25)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '6px', color: '#f87171', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        ⚠️ Security Warning Card
                      </button>
                      <button
                        onClick={() => {
                          const syntheticEvent: SecurityEvent = {
                            event_id: selectedPost.id,
                            sender_id: selectedPost.username,
                            sender_type: 'simulated_attacker',
                            receiver_id: 'RCV-IG-001',
                            receiver_surface: 'Instagram Feed',
                            platform: 'instagram',
                            content_type: 'image',
                            content_preview: selectedPost.caption,
                            content_reference: selectedPost.image_path,
                            created_at: new Date().toISOString(),
                            received_at: new Date().toISOString(),
                            processed_at: new Date().toISOString(),
                            timestamp: new Date().toISOString(),
                            status: 'analyzed',
                            classification: selectedPost.expected_classification,
                            risk_score: selectedPost.risk_score,
                            risk_level: selectedPost.risk_level,
                            confidence: 0.96,
                            ai_model: selectedPost.detector_type,
                            forensic_reasons: selectedPost.forensic_reasons,
                            recommended_action: 'QUARANTINE',
                            final_action: 'QUARANTINE',
                            timeline: []
                          };
                          onInspectEvent(syntheticEvent);
                        }}
                        style={{ flex: 1, padding: '6px 10px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '6px', color: '#60a5fa', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        🔍 Inspect Forensics
                      </button>
                    </div>
                  )}
                </div>

                {/* Comments List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>Comments:</div>
                  {selectedPost.commentsList.map((c, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                      <strong>{c.user}</strong> {c.text} <span style={{ fontSize: '0.62rem', color: '#64748b' }}>{c.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions & Comment Input */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <button onClick={() => toggleLike(selectedPost.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: likedPosts[selectedPost.id] ? '#ef4444' : '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Heart size={20} fill={likedPosts[selectedPost.id] ? '#ef4444' : 'none'} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{selectedPost.likes + (likedPosts[selectedPost.id] ? 1 : 0)}</span>
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f8fafc' }}>
                      <Share2 size={18} />
                    </button>
                  </div>
                  <button onClick={() => toggleBookmark(selectedPost.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: savedPosts[selectedPost.id] ? '#3b82f6' : '#f8fafc' }}>
                    <Bookmark size={20} fill={savedPosts[selectedPost.id] ? '#3b82f6' : 'none'} />
                  </button>
                </div>

                {/* Add Comment Input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(selectedPost.id); }}
                    placeholder="Add a comment as @dr_alex_vance..."
                    style={{ flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.75rem' }}
                  />
                  <button
                    onClick={() => handleAddComment(selectedPost.id)}
                    disabled={!commentInput.trim()}
                    style={{ padding: '0 14px', background: '#3b82f6', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Post
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 5. FULL-SCREEN STORY VIEWER MODAL */}
      {activeStory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '420px', height: '90vh', borderRadius: '16px', overflow: 'hidden', background: '#1e293b' }}>
            <img src={activeStory.image} alt={activeStory.user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

            {/* Story Top Bar */}
            <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={activeStory.avatar} alt={activeStory.user} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{activeStory.user}</span>
              </div>
              <button onClick={() => setActiveStory(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Story Threat / Safe Overlay */}
            {activeStory.isThreat ? (
              <div style={{ position: 'absolute', bottom: '20px', left: '14px', right: '14px', padding: '12px', background: 'rgba(239, 68, 68, 0.95)', borderRadius: '10px', color: '#fff', fontSize: '0.78rem' }}>
                <strong>⚠️ STORY QUARANTINED BY CYBERSHIELD</strong>
                <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>{activeStory.caption}</div>
              </div>
            ) : (
              <div style={{ position: 'absolute', bottom: '20px', left: '14px', right: '14px', padding: '10px', background: 'rgba(0,0,0,0.6)', borderRadius: '8px', color: '#fff', fontSize: '0.78rem' }}>
                {activeStory.caption}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
