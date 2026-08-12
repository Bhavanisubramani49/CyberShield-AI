export interface DemoMediaItem {
  id: string;
  category: 'instagram' | 'photos' | 'videos' | 'news' | 'web' | 'files';
  type: 'image' | 'video' | 'article' | 'url' | 'file';
  isThreat: boolean;
  title: string;
  author: string;
  handle: string;
  avatarUrl: string;
  mediaUrl: string;
  thumbnailUrl: string;
  caption?: string;
  hashtags?: string[];
  likes?: number;
  commentsCount?: number;
  duration?: string;
  fileSize?: string;
  fileType?: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  classification: 'SAFE' | 'MANIPULATED' | 'DEEPFAKE' | 'FAKE_NEWS' | 'PHISHING' | 'MALICIOUS' | 'SCAM' | 'FAKE_PROFILE';
  reasons: string[];
}

export const DEMO_MEDIA_CATALOG: DemoMediaItem[] = [
  // ==========================================
  // 1. INSTAGRAM SAMPLES (SAFE & THREAT)
  // ==========================================
  {
    id: 'ig-safe-01',
    category: 'instagram',
    type: 'image',
    isThreat: false,
    title: 'Modern Architecture in Tokyo',
    author: 'Elena Rostova',
    handle: '@elena_designs',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80',
    caption: 'Tokyo sunset reflection against glass facades. Always inspired by minimalist geometric architecture! 🌇✨',
    hashtags: ['#architecture', '#tokyo', '#design', '#travel'],
    likes: 1240,
    commentsCount: 48,
    riskScore: 8,
    riskLevel: 'LOW',
    classification: 'SAFE',
    reasons: ['Consistent camera sensor noise pattern', 'Authentic lighting and clean EXIF metadata']
  },
  {
    id: 'ig-safe-02',
    category: 'instagram',
    type: 'image',
    isThreat: false,
    title: 'Workspace Coffee & Code',
    author: 'Marcus Reynolds',
    handle: '@marcus_researcher',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=80',
    caption: 'Finalizing the multi-platform CyberShield integration adapters today. Great coffee and deep focus. ☕💻',
    hashtags: ['#coding', '#cybersecurity', '#workspace', '#focus'],
    likes: 890,
    commentsCount: 32,
    riskScore: 10,
    riskLevel: 'LOW',
    classification: 'SAFE',
    reasons: ['Authentic camera sensor structure', 'Zero pixel manipulation artifacts detected']
  },
  {
    id: 'ig-safe-03',
    category: 'instagram',
    type: 'image',
    isThreat: false,
    title: 'Alpine Hiking Trail Sunrise',
    author: 'Liam Walker',
    handle: '@liam_explores',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=80',
    caption: 'Woke up at 4 AM to catch the sunrise over the ridge. Nature never fails to amaze. 🏔️☀️',
    hashtags: ['#nature', '#mountains', '#hiking', '#adventure'],
    likes: 2150,
    commentsCount: 76,
    riskScore: 6,
    riskLevel: 'LOW',
    classification: 'SAFE',
    reasons: ['Natural high-dynamic range sensor data', 'Continuous spatial luminance distribution']
  },
  {
    id: 'ig-safe-04',
    category: 'instagram',
    type: 'video',
    isThreat: false,
    title: 'Espresso Pour-Over Art',
    author: 'Sarah Chen',
    handle: '@sarah_chen',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80',
    caption: 'Morning pour-over slow motion routine. Perfectly balanced roast! ☕✨',
    hashtags: ['#coffee', '#lifestyle', '#slowmo', '#morning'],
    likes: 1580,
    commentsCount: 42,
    duration: '0:15',
    riskScore: 12,
    riskLevel: 'LOW',
    classification: 'SAFE',
    reasons: ['Temporal frame continuity verified', 'Natural lighting gradient and frame timestamps']
  },
  {
    id: 'ig-threat-01',
    category: 'instagram',
    type: 'image',
    isThreat: true,
    title: 'FREE CRYPTO AIRDROP 500% RETURN',
    author: 'Crypto Giveaway Bot 99',
    handle: '@crypto_giveaway_bot_99',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&auto=format&fit=crop&q=80',
    caption: '🚨 OFFICIAL BTC GIVEAWAY: Send 0.1 BTC to receive 0.5 BTC instantly! Click link in bio to claim immediately before expiration! 💰🔥',
    hashtags: ['#crypto', '#airdrop', '#bitcoin', '#freebtc'],
    likes: 12,
    commentsCount: 140,
    riskScore: 94,
    riskLevel: 'CRITICAL',
    classification: 'FAKE_PROFILE',
    reasons: [
      'Anomalous following-to-follower ratio (4,500 following vs 12 followers)',
      'Unverified financial giveaway scam keywords in bio and caption',
      'Potential redirection to credential harvesting portal'
    ]
  },
  {
    id: 'ig-threat-02',
    category: 'instagram',
    type: 'image',
    isThreat: true,
    title: 'Doctored Wire Transfer Receipt',
    author: 'Scam Account 404',
    handle: '@instant_cash_claims',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    caption: 'Payment approved! $50,000 transferred to selected follower account. Claim your share now by clicking link!',
    hashtags: ['#wiretransfer', '#freecash', '#winner'],
    likes: 5,
    commentsCount: 88,
    riskScore: 88,
    riskLevel: 'HIGH',
    classification: 'MANIPULATED',
    reasons: [
      'Error Level Analysis (ELA) reveals copy-move pixel anomalies around numerical figures',
      'EXIF metadata shows synthetic editing software compression artifacts'
    ]
  },

  // ==========================================
  // 2. PHOTOS & GALLERY SAMPLES
  // ==========================================
  {
    id: 'photo-safe-01',
    category: 'photos',
    type: 'image',
    isThreat: false,
    title: 'family_vacation_photo_dsc_0842.jpg',
    author: 'Gallery User',
    handle: '@gallery_vault',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
    caption: 'Tropical coastline camera capture (Sony Alpha 7IV).',
    fileSize: '4.2 MB',
    fileType: 'image/jpeg',
    riskScore: 8,
    riskLevel: 'LOW',
    classification: 'SAFE',
    reasons: ['Authentic camera Bayer pattern verified', 'EXIF metadata matches Sony A7IV hardware capture']
  },
  {
    id: 'photo-safe-02',
    category: 'photos',
    type: 'image',
    isThreat: false,
    title: 'autumn_forest_trail_raw.png',
    author: 'Gallery User',
    handle: '@gallery_vault',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&auto=format&fit=crop&q=80',
    caption: 'High resolution nature photograph with untouched optical sensor noise.',
    fileSize: '6.8 MB',
    fileType: 'image/png',
    riskScore: 7,
    riskLevel: 'LOW',
    classification: 'SAFE',
    reasons: ['Zero synthetic generative artifacts', 'Natural luminance falloff']
  },
  {
    id: 'photo-threat-01',
    category: 'photos',
    type: 'image',
    isThreat: true,
    title: 'doctored_payment_receipt_spliced.png',
    author: 'Unverified Sender',
    handle: '@unknown_sender',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    caption: 'Spliced transaction invoice with digitally altered payment sum.',
    fileSize: '1.4 MB',
    fileType: 'image/png',
    riskScore: 88,
    riskLevel: 'HIGH',
    classification: 'MANIPULATED',
    reasons: [
      'Pixel-level copy-move inconsistency and GAN residual artifacts identified',
      'EXIF metadata shows missing Bayer sensor noise and synthetic compression headers'
    ]
  },

  // ==========================================
  // 3. VIDEOS & STREAMS / YOUTUBE SAMPLES
  // ==========================================
  {
    id: 'vid-safe-01',
    category: 'videos',
    type: 'video',
    isThreat: false,
    title: 'Big Buck Bunny Open Source 4K Demo',
    author: 'Blender Animation Studio',
    handle: '@blender_open_source',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&auto=format&fit=crop&q=80',
    caption: 'Official open source video stream with intact temporal metadata.',
    duration: '9:56',
    riskScore: 10,
    riskLevel: 'LOW',
    classification: 'SAFE',
    reasons: ['Consistent spatial frequency and frame rate continuity across sampled frames']
  },
  {
    id: 'vid-safe-02',
    category: 'videos',
    type: 'video',
    isThreat: false,
    title: 'CyberShield Zero-Trust Architecture Keynote',
    author: 'CyberShield Security Team',
    handle: '@cybershield_core',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80',
    caption: 'Executive architectural walk-through explaining multimodal threat containment.',
    duration: '2:14',
    riskScore: 12,
    riskLevel: 'LOW',
    classification: 'SAFE',
    reasons: ['Natural facial micro-expressions verified', 'Audio-visual lip synchronization intact']
  },
  {
    id: 'vid-threat-01',
    category: 'videos',
    type: 'video',
    isThreat: true,
    title: 'executive_face_swap_deepfake.mp4',
    author: 'Synthetic Media Lab',
    handle: '@ai_deepfake_generator',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534972195531-a756b1126f24?w=400&auto=format&fit=crop&q=80',
    caption: 'Fabricated executive statement generated via GAN face_swap architecture.',
    duration: '0:15',
    riskScore: 92,
    riskLevel: 'CRITICAL',
    classification: 'DEEPFAKE',
    reasons: [
      'Temporal frame inconsistency detected across 48 sampled video frames',
      'Facial boundary blending artifacts and unnatural eye blinking intervals'
    ]
  },

  // ==========================================
  // 4. NEWS & ARTICLES SAMPLES
  // ==========================================
  {
    id: 'news-safe-01',
    category: 'news',
    type: 'article',
    isThreat: false,
    title: 'NASA Rover Discovers Ancient Sedimentary Formations on Mars Surface',
    author: 'Dr. Rebecca Foster',
    handle: '@science_daily',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&auto=format&fit=crop&q=80',
    caption: 'Scientists at the Jet Propulsion Laboratory confirmed that rover telemetry indicates preserved mineral strata consistent with ancient riverbed deposition.',
    riskScore: 12,
    riskLevel: 'LOW',
    classification: 'SAFE',
    reasons: ['Neutral objective reporting tone', 'Standard journalistic attribution and peer-reviewed citations']
  },
  {
    id: 'news-threat-01',
    category: 'news',
    type: 'article',
    isThreat: true,
    title: 'SHOCKING: Secret Miracle Cure Doctors Won’t Tell You About Cures All Viruses in 2 Hours!',
    author: 'Disinformation Hub',
    handle: '@viral_sensations_daily',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=800&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&auto=format&fit=crop&q=80',
    caption: 'Leaked government memo confirms secret boiled garlic remedy destroys all viral infections instantly. Big pharma trying to ban all reporting!',
    riskScore: 92,
    riskLevel: 'CRITICAL',
    classification: 'FAKE_NEWS',
    reasons: [
      'High linguistic distortion score with unverified dramatic medical claims',
      'Sensationalist clickbait phrases ("secret cure", "miracle", "won\'t tell you")',
      'Excessive capitalization and emotional urgency formatting'
    ]
  },

  // ==========================================
  // 5. WEB & URL SAMPLES
  // ==========================================
  {
    id: 'web-safe-01',
    category: 'web',
    type: 'url',
    isThreat: false,
    title: 'MDN Web Docs — JavaScript Reference',
    author: 'Mozilla Developer Network',
    handle: '@mozilla_dev',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
    caption: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    riskScore: 8,
    riskLevel: 'LOW',
    classification: 'SAFE',
    reasons: ['Domain reputation clean', 'Valid HTTPS certificate chain and clean lexical structure']
  },
  {
    id: 'web-threat-01',
    category: 'web',
    type: 'url',
    isThreat: true,
    title: 'Direct IP Phishing Portal (192.168.1.10)',
    author: 'Suspicious IP Host',
    handle: '@ip_credential_portal',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80',
    caption: 'http://192.168.1.10/update-login.php?token=xyz998273',
    riskScore: 100,
    riskLevel: 'CRITICAL',
    classification: 'MALICIOUS',
    reasons: [
      'Direct IP address host used instead of registered domain',
      'Insecure plain HTTP protocol (missing TLS certificate)',
      'Path contains deceptive banking login keywords'
    ]
  },

  // ==========================================
  // 6. FILES & STORAGE SAMPLES
  // ==========================================
  {
    id: 'file-safe-01',
    category: 'files',
    type: 'file',
    isThreat: false,
    title: 'Annual_CyberSecurity_Report_2026.pdf',
    author: 'Security Officer',
    handle: '@enterprise_sec',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    mediaUrl: '',
    thumbnailUrl: '',
    caption: 'Verified PDF document with clean structural headers.',
    fileSize: '3.4 MB',
    fileType: 'application/pdf',
    riskScore: 8,
    riskLevel: 'LOW',
    classification: 'SAFE',
    reasons: ['Safe document structure (PDF)', 'Zero embedded executable macros or exploit shellcode']
  },
  {
    id: 'file-threat-01',
    category: 'files',
    type: 'file',
    isThreat: true,
    title: 'Urgent_Invoice_March2026.docm',
    author: 'Attacker Script Generator',
    handle: '@macro_dropper_sim',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    mediaUrl: '',
    thumbnailUrl: '',
    caption: 'Macro-enabled Word document containing suspicious VBA auto-exec triggers.',
    fileSize: '480 KB',
    fileType: 'application/vnd.ms-word.document.macroEnabled.12',
    riskScore: 88,
    riskLevel: 'HIGH',
    classification: 'MALICIOUS',
    reasons: [
      'High-risk executable/macro extension detected (.docm)',
      'Embedded Office VBA macro trigger flag capable of secondary payload execution'
    ]
  }
];
