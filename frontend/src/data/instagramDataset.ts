export interface InstagramPost {
  id: string;
  image_path: string;
  thumbnail_path: string;
  expected_classification: 'ORIGINAL' | 'MANIPULATED' | 'SCAM' | 'PHISHING';
  source_dataset: string;
  detector_type: 'image_manipulation_ai' | 'fake_profile_analyzer_ai';
  username: string;
  authorName: string;
  avatarUrl: string;
  caption: string;
  hashtags: string[];
  likes: number;
  commentsCount: number;
  commentsList: { user: string; text: string; time: string }[];
  timestamp: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  forensic_reasons: string[];
  media_type?: 'image' | 'video';
  video_url?: string;
  video_metadata?: {
    duration_sec: number;
    fps: number;
    resolution: string;
  };
}

export interface InstagramProfile {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  website: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
  expected_classification: 'AUTHENTIC' | 'SUSPICIOUS' | 'FAKE';
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  forensic_reasons: string[];
  recentPosts: string[]; // image URLs
}

export const INSTAGRAM_REELS_POSTS: InstagramPost[] = [
  {
    id: "IG-REEL-001",
    image_path: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
    media_type: "video",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video_metadata: { duration_sec: 15.0, fps: 30.0, resolution: "1080x1920" },
    expected_classification: "ORIGINAL",
    source_dataset: "CyberShield_Video_Testbed",
    detector_type: "deepfake_video_pipeline" as any,
    username: "@cyber_security_lab",
    authorName: "Dr. Alex Vance",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Real-time AI Video Security Pipeline testing across Instagram Reels media stream. 🛡️",
    hashtags: ["#reels", "#cybersecurity", "#ai", "#privacy"],
    likes: 3840,
    commentsCount: 94,
    commentsList: [
      { user: "marcus_r", text: "Zero-trust video inspection working seamlessly!", time: "10m" }
    ],
    timestamp: "15m ago",
    risk_score: 8,
    risk_level: "LOW",
    forensic_reasons: ["Authentic temporal frame continuity and video lip sync verified"]
  },
  {
    id: "IG-REEL-002",
    image_path: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    media_type: "video",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    video_metadata: { duration_sec: 22.0, fps: 24.0, resolution: "1080x1920" },
    expected_classification: "MANIPULATED",
    source_dataset: "FaceForensics++_Subcorpus",
    detector_type: "deepfake_video_pipeline" as any,
    username: "@synthetic_media_hub",
    authorName: "Synthetic Media Lab",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    caption: "Synthetic face swap & temporal frame warping artifact test reel.",
    hashtags: ["#deepfake", "#ai", "#forensics", "#warning"],
    likes: 1205,
    commentsCount: 45,
    commentsList: [
      { user: "sec_officer", text: "Facial boundary blending artifacts flagged.", time: "1h" }
    ],
    timestamp: "1h ago",
    risk_score: 92,
    risk_level: "HIGH",
    forensic_reasons: ["Temporal frame inconsistency detected", "Facial boundary warping and blending artifacts"]
  },
  {
    id: "IG-REEL-003",
    image_path: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80",
    media_type: "video",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    video_metadata: { duration_sec: 18.0, fps: 30.0, resolution: "1080x1920" },
    expected_classification: "ORIGINAL",
    source_dataset: "Authentic_Reels_Sample",
    detector_type: "deepfake_video_pipeline" as any,
    username: "@tokyo_wanderer",
    authorName: "Kenji Takahashi",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    caption: "Midnight stroll through Shinjuku neon alleys. 🌃",
    hashtags: ["#tokyo", "#japan", "#reels", "#nightdrive"],
    likes: 5410,
    commentsCount: 112,
    commentsList: [
      { user: "elena_d", text: "The color grading is so crisp!", time: "2h" }
    ],
    timestamp: "2h ago",
    risk_score: 5,
    risk_level: "LOW",
    forensic_reasons: ["Standard camera sensor noise profile", "Zero deepfake manipulation artifacts detected"]
  }
];

export const INSTAGRAM_50_POSTS: InstagramPost[] = [
  ...INSTAGRAM_REELS_POSTS,
  // --- 25 SAFE / ORIGINAL POSTS ---
  {
    id: "IG-IMG-001",
    image_path: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CASIA2.0_Authentic_Subcorpus",
    detector_type: "image_manipulation_ai",
    username: "@elena_designs",
    authorName: "Elena Rostova",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    caption: "Geometric reflections across the Ginza district at sunset. Pure harmony in urban architecture.",
    hashtags: ["#architecture", "#tokyo", "#minimalism", "#design"],
    likes: 1420,
    commentsCount: 38,
    commentsList: [
      { user: "kenji_t", text: "The lighting gradient is incredible!", time: "2h" },
      { user: "alex_vance", text: "Verified authentic camera Bayer pattern.", time: "1h" }
    ],
    timestamp: "2h ago",
    risk_score: 8,
    risk_level: "LOW",
    forensic_reasons: [
      "Continuous spatial sensor Bayer pattern verified with zero splicing boundaries",
      "EXIF header matches authentic Sony A7R hardware capture metadata"
    ]
  },
  {
    id: "IG-IMG-002",
    image_path: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CoMoFoD_Original_Control",
    detector_type: "image_manipulation_ai",
    username: "@marcus_researcher",
    authorName: "Marcus Reynolds",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Refining the multimodal neural heuristic pipelines today. Zero-trust security in progress! 💻☕",
    hashtags: ["#cybersecurity", "#developer", "#coding", "#zerotrust"],
    likes: 890,
    commentsCount: 24,
    commentsList: [
      { user: "sarah_chen", text: "Looking sharp Marcus!", time: "3h" }
    ],
    timestamp: "4h ago",
    risk_score: 10,
    risk_level: "LOW",
    forensic_reasons: [
      "Error Level Analysis (ELA) exhibits uniform compression noise across high-frequency edges"
    ]
  },
  {
    id: "IG-IMG-003",
    image_path: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "IEEE_Forensics_Benchmark",
    detector_type: "image_manipulation_ai",
    username: "@liam_explores",
    authorName: "Liam Walker",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    caption: "Early morning mountain ridge hike. The atmospheric haze over the peaks is unmatched. 🏔️",
    hashtags: ["#mountains", "#nature", "#hiking", "#adventure"],
    likes: 2150,
    commentsCount: 65,
    commentsList: [
      { user: "wanderlust_dan", text: "Which trail was this?", time: "5h" }
    ],
    timestamp: "5h ago",
    risk_score: 6,
    risk_level: "LOW",
    forensic_reasons: [
      "Natural high-dynamic range sensor data with consistent luminance distribution"
    ]
  },
  {
    id: "IG-IMG-004",
    image_path: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "Columbia_Uncompressed_Image_Set",
    detector_type: "image_manipulation_ai",
    username: "@maya_travels",
    authorName: "Maya Lin",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    caption: "Crystal clear waters along the tropical coastline. Best vacation ever! 🌊🏝️",
    hashtags: ["#beach", "#tropical", "#vacation", "#summer"],
    likes: 1890,
    commentsCount: 42,
    commentsList: [
      { user: "chloe_b", text: "Take me there!", time: "6h" }
    ],
    timestamp: "6h ago",
    risk_score: 7,
    risk_level: "LOW",
    forensic_reasons: ["Natural color channel correlation verified across all pixel blocks"]
  },
  {
    id: "IG-IMG-005",
    image_path: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CASIA2.0_Authentic_Subcorpus",
    detector_type: "image_manipulation_ai",
    username: "@nature_tones",
    authorName: "Oliver Vance",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Sunlight filtering through redwood tree canopy. Untouched raw camera capture.",
    hashtags: ["#forest", "#redwoods", "#rawphotography", "#zen"],
    likes: 1320,
    commentsCount: 19,
    commentsList: [],
    timestamp: "7h ago",
    risk_score: 5,
    risk_level: "LOW",
    forensic_reasons: ["Zero synthetic resampling or affine transformation artifacts"]
  },
  {
    id: "IG-IMG-006",
    image_path: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "IEEE_Forensics_Benchmark",
    detector_type: "image_manipulation_ai",
    username: "@culinary_journal",
    authorName: "Chef Antoine",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    caption: "Tonight's dinner service setting. Warm ambient interior and artisanal flavors.",
    hashtags: ["#restaurant", "#dining", "#gastronomy", "#atmosphere"],
    likes: 960,
    commentsCount: 15,
    commentsList: [],
    timestamp: "8h ago",
    risk_score: 9,
    risk_level: "LOW",
    forensic_reasons: ["Optical lens focal depth matches camera aperture metadata"]
  },
  {
    id: "IG-IMG-007",
    image_path: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CASIA2.0_Authentic_Subcorpus",
    detector_type: "image_manipulation_ai",
    username: "@hardware_insights",
    authorName: "Dr. Alex Vance",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    caption: "Macro photography of an advanced quantum encryption microprocessor die. 🔬",
    hashtags: ["#hardware", "#chips", "#macro", "#quantum"],
    likes: 2410,
    commentsCount: 52,
    commentsList: [],
    timestamp: "9h ago",
    risk_score: 11,
    risk_level: "LOW",
    forensic_reasons: ["Authentic micro-sensor pixel grid alignment"]
  },
  {
    id: "IG-IMG-008",
    image_path: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "Columbia_Uncompressed_Image_Set",
    detector_type: "image_manipulation_ai",
    username: "@interior_curator",
    authorName: "Sophia Reed",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    caption: "Scandinavian minimalist interior styling with natural oak accents.",
    hashtags: ["#interior", "#homedecor", "#minimalism"],
    likes: 1120,
    commentsCount: 22,
    commentsList: [],
    timestamp: "10h ago",
    risk_score: 6,
    risk_level: "LOW",
    forensic_reasons: ["Clean spatial luminance continuity"]
  },
  {
    id: "IG-IMG-009",
    image_path: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CoMoFoD_Original_Control",
    detector_type: "image_manipulation_ai",
    username: "@dev_daily",
    authorName: "Jordan Hayes",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    caption: "Building responsive cross-platform interfaces with React and Tailwind. ⚡",
    hashtags: ["#frontend", "#react", "#webdev"],
    likes: 850,
    commentsCount: 16,
    commentsList: [],
    timestamp: "11h ago",
    risk_score: 8,
    risk_level: "LOW",
    forensic_reasons: ["Zero high-pass frequency anomalies"]
  },
  {
    id: "IG-IMG-010",
    image_path: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "IEEE_Forensics_Benchmark",
    detector_type: "image_manipulation_ai",
    username: "@cyber_institute",
    authorName: "Cyber Defense Lab",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Security telemetry operations room during real-time incident response drills.",
    hashtags: ["#cybersecurity", "#soc", "#infosec"],
    likes: 1640,
    commentsCount: 31,
    commentsList: [],
    timestamp: "12h ago",
    risk_score: 10,
    risk_level: "LOW",
    forensic_reasons: ["Authentic multi-monitor optical exposure levels"]
  },
  {
    id: "IG-IMG-011",
    image_path: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CASIA2.0_Authentic_Subcorpus",
    detector_type: "image_manipulation_ai",
    username: "@future_cloud",
    authorName: "Cloud Architect Network",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    caption: "Global data center fiber optic interconnects. Massive bandwidth scaling.",
    hashtags: ["#datacenter", "#cloud", "#networking"],
    likes: 1950,
    commentsCount: 44,
    commentsList: [],
    timestamp: "13h ago",
    risk_score: 9,
    risk_level: "LOW",
    forensic_reasons: ["Consistent optical lighting and sensor characteristics"]
  },
  {
    id: "IG-IMG-012",
    image_path: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CoMoFoD_Original_Control",
    detector_type: "image_manipulation_ai",
    username: "@coffee_roasters",
    authorName: "Artisan Brews",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    caption: "Freshly roasted single-origin Ethiopian beans. Citrus and floral aroma.",
    hashtags: ["#coffee", "#barista", "#specialtycoffee"],
    likes: 1280,
    commentsCount: 27,
    commentsList: [],
    timestamp: "14h ago",
    risk_score: 7,
    risk_level: "LOW",
    forensic_reasons: ["Clean macro focus falloff with zero cloning"]
  },
  {
    id: "IG-IMG-013",
    image_path: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "IEEE_Forensics_Benchmark",
    detector_type: "image_manipulation_ai",
    username: "@roadtrip_diaries",
    authorName: "Lucas Grey",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    caption: "Desert highway road trip stretching all the way to the horizon. 🏜️🚗",
    hashtags: ["#roadtrip", "#desert", "#travelgram"],
    likes: 2100,
    commentsCount: 49,
    commentsList: [],
    timestamp: "15h ago",
    risk_score: 6,
    risk_level: "LOW",
    forensic_reasons: ["Natural atmospheric light gradient and clean metadata"]
  },
  {
    id: "IG-IMG-014",
    image_path: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CASIA2.0_Authentic_Subcorpus",
    detector_type: "image_manipulation_ai",
    username: "@yosemite_visuals",
    authorName: "Wilderness Collective",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Sunset over Yosemite Valley. Iconic granite cliffs in golden hour light.",
    hashtags: ["#yosemite", "#goldenhour", "#nationalparks"],
    likes: 3100,
    commentsCount: 82,
    commentsList: [],
    timestamp: "16h ago",
    risk_score: 8,
    risk_level: "LOW",
    forensic_reasons: ["Authentic RAW conversion sensor noise signature"]
  },
  {
    id: "IG-IMG-015",
    image_path: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CoMoFoD_Original_Control",
    detector_type: "image_manipulation_ai",
    username: "@urban_lights",
    authorName: "David Cole",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    caption: "Neon light trails across night highway overpass. 🌃",
    hashtags: ["#nightphotography", "#longexposure", "#cyberpunk"],
    likes: 1740,
    commentsCount: 39,
    commentsList: [],
    timestamp: "17h ago",
    risk_score: 11,
    risk_level: "LOW",
    forensic_reasons: ["Consistent long exposure sensor photon statistics"]
  },
  {
    id: "IG-IMG-016",
    image_path: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "IEEE_Forensics_Benchmark",
    detector_type: "image_manipulation_ai",
    username: "@startup_collab",
    authorName: "Tech Founders Hub",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Collaborative design workshop exploring multimodal user interactions.",
    hashtags: ["#teamwork", "#designthinking", "#innovation"],
    likes: 1290,
    commentsCount: 28,
    commentsList: [],
    timestamp: "18h ago",
    risk_score: 9,
    risk_level: "LOW",
    forensic_reasons: ["Zero facial warping or splicing boundaries"]
  },
  {
    id: "IG-IMG-017",
    image_path: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CASIA2.0_Authentic_Subcorpus",
    detector_type: "image_manipulation_ai",
    username: "@ux_prototypes",
    authorName: "Hannah Bell",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    caption: "Wireframing complex security telemetry dashboards on tablet.",
    hashtags: ["#uxdesign", "#ui", "#wireframe"],
    likes: 1450,
    commentsCount: 33,
    commentsList: [],
    timestamp: "19h ago",
    risk_score: 7,
    risk_level: "LOW",
    forensic_reasons: ["Authentic screen reflection and lens geometry"]
  },
  {
    id: "IG-IMG-018",
    image_path: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CoMoFoD_Original_Control",
    detector_type: "image_manipulation_ai",
    username: "@fresh_greens",
    authorName: "Healthy Kitchen",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    caption: "Organic salad bowl with avocado, quinoa, and lemon tahini dressing. 🥗",
    hashtags: ["#healthyfood", "#organic", "#vegan"],
    likes: 980,
    commentsCount: 20,
    commentsList: [],
    timestamp: "20h ago",
    risk_score: 8,
    risk_level: "LOW",
    forensic_reasons: ["Natural depth of field optical bokeh verified"]
  },
  {
    id: "IG-IMG-019",
    image_path: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "IEEE_Forensics_Benchmark",
    detector_type: "image_manipulation_ai",
    username: "@satellite_telemetry",
    authorName: "Earth Orbit Lab",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Planetary atmospheric visualization captured by deep space telemetry sensors.",
    hashtags: ["#space", "#astronomy", "#satellite"],
    likes: 4200,
    commentsCount: 95,
    commentsList: [],
    timestamp: "21h ago",
    risk_score: 10,
    risk_level: "LOW",
    forensic_reasons: ["Standard scientific telemetry calibration headers intact"]
  },
  {
    id: "IG-IMG-020",
    image_path: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CASIA2.0_Authentic_Subcorpus",
    detector_type: "image_manipulation_ai",
    username: "@digital_creators",
    authorName: "Studio Sync",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    caption: "Late evening team sprint testing high availability microservice deployments.",
    hashtags: ["#tech", "#devlife", "#agile"],
    likes: 1150,
    commentsCount: 25,
    commentsList: [],
    timestamp: "22h ago",
    risk_score: 8,
    risk_level: "LOW",
    forensic_reasons: ["Zero digital copy-move block repetitions"]
  },
  {
    id: "IG-IMG-021",
    image_path: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "Columbia_Uncompressed_Image_Set",
    detector_type: "image_manipulation_ai",
    username: "@portrait_stories",
    authorName: "Clara Davis",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    caption: "Natural sunlight studio portrait. Unfiltered authentic skin texture.",
    hashtags: ["#portrait", "#studio", "#authentic"],
    likes: 2890,
    commentsCount: 68,
    commentsList: [],
    timestamp: "23h ago",
    risk_score: 7,
    risk_level: "LOW",
    forensic_reasons: ["Natural dermal micro-texture and zero generative artifacts"]
  },
  {
    id: "IG-IMG-022",
    image_path: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CoMoFoD_Original_Control",
    detector_type: "image_manipulation_ai",
    username: "@alpine_mist",
    authorName: "Erik Lindqvist",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Misty pine forest morning in northern Scandinavia.",
    hashtags: ["#scandinavia", "#mist", "#naturelovers"],
    likes: 1840,
    commentsCount: 36,
    commentsList: [],
    timestamp: "1d ago",
    risk_score: 6,
    risk_level: "LOW",
    forensic_reasons: ["Consistent optical fog diffusion gradients"]
  },
  {
    id: "IG-IMG-023",
    image_path: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "IEEE_Forensics_Benchmark",
    detector_type: "image_manipulation_ai",
    username: "@grand_canyon_views",
    authorName: "National Park Views",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    caption: "Sunset light on the geological strata of the Grand Canyon.",
    hashtags: ["#grandcanyon", "#geology", "#landscapes"],
    likes: 3400,
    commentsCount: 88,
    commentsList: [],
    timestamp: "1d ago",
    risk_score: 8,
    risk_level: "LOW",
    forensic_reasons: ["Natural geological chromatic stratification"]
  },
  {
    id: "IG-IMG-024",
    image_path: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "CASIA2.0_Authentic_Subcorpus",
    detector_type: "image_manipulation_ai",
    username: "@lens_and_light",
    authorName: "Victor Vance",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    caption: "Golden hour field photography with natural flare bokeh.",
    hashtags: ["#goldenhour", "#bokeh", "#sunset"],
    likes: 1980,
    commentsCount: 45,
    commentsList: [],
    timestamp: "1d ago",
    risk_score: 7,
    risk_level: "LOW",
    forensic_reasons: ["Authentic spherical lens flare aberration pattern"]
  },
  {
    id: "IG-IMG-025",
    image_path: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=400&auto=format&fit=crop&q=80",
    expected_classification: "ORIGINAL",
    source_dataset: "Columbia_Uncompressed_Image_Set",
    detector_type: "image_manipulation_ai",
    username: "@urban_coffee_lab",
    authorName: "Tokyo Coffee Journal",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    caption: "Shibuya alleyway morning brew spot. Simple and quiet.",
    hashtags: ["#tokyo", "#shibuya", "#streetphotography"],
    likes: 1540,
    commentsCount: 30,
    commentsList: [],
    timestamp: "1d ago",
    risk_score: 8,
    risk_level: "LOW",
    forensic_reasons: ["Clean EXIF timestamp with authentic ambient lighting balance"]
  },

  // --- 25 SUSPICIOUS / MANIPULATED / SCAM POSTS ---
  {
    id: "IG-IMG-026",
    image_path: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&auto=format&fit=crop&q=80",
    expected_classification: "SCAM",
    source_dataset: "CASIA2.0_Manipulated_Adversarial",
    detector_type: "image_manipulation_ai",
    username: "@crypto_giveaway_bot_99",
    authorName: "BTC Fast Doubler Bot",
    avatarUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
    caption: "🚨 OFFICIAL TESLA BTC AIRDROP: Send 0.1 BTC to receive 0.5 BTC instantly! Limited to first 50 participants. Click link in bio NOW! 💰🔥",
    hashtags: ["#crypto", "#bitcoin", "#airdrop", "#giveaway", "#freebtc"],
    likes: 14,
    commentsCount: 180,
    commentsList: [
      { user: "cybershield_bot", text: "⚠️ Intercepted: Multiplier financial lure detected.", time: "10m" }
    ],
    timestamp: "10m ago",
    risk_score: 95,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "High linguistic scam probability score (98%) matching cryptocurrency advance-fee fraud",
      "Deceptive promotional overlay spliced over unverified stock imagery"
    ]
  },
  {
    id: "IG-IMG-027",
    image_path: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
    expected_classification: "MANIPULATED",
    source_dataset: "CoMoFoD_CopyMove_Forged",
    detector_type: "image_manipulation_ai",
    username: "@instant_cash_claims",
    authorName: "Fast Grant Payouts",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    caption: "Approved wire transfer voucher: $50,000 sent to today's lucky follower. DM account number to receive your grant share!",
    hashtags: ["#wiretransfer", "#grant", "#cashvoucher"],
    likes: 8,
    commentsCount: 92,
    commentsList: [],
    timestamp: "25m ago",
    risk_score: 91,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Error Level Analysis (ELA) reveals copy-move pixel anomalies around numerical payout sums",
      "Synthetic font overlay does not match authentic bank voucher document compression"
    ]
  },
  {
    id: "IG-IMG-028",
    image_path: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80",
    expected_classification: "PHISHING",
    source_dataset: "PhishIris_Visual_Phishing_Dataset",
    detector_type: "image_manipulation_ai",
    username: "@security_alert_team_v2",
    authorName: "Account Security Center",
    avatarUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
    caption: "URGENT SECURITY WARNING: Your account will be permanently deactivated in 12 hours for copyright infringement. Verify your login credentials at the attached link immediately.",
    hashtags: ["#instagramsecurity", "#verifyaccount", "#helpcenter"],
    likes: 3,
    commentsCount: 45,
    commentsList: [],
    timestamp: "40m ago",
    risk_score: 98,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Credential harvesting brand impersonation banner matching high-urgency phishing heuristics",
      "Deceptive redirect domain disguised as official security portal"
    ]
  },
  {
    id: "IG-IMG-029",
    image_path: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=80",
    expected_classification: "SCAM",
    source_dataset: "CASIA2.0_Manipulated_Adversarial",
    detector_type: "image_manipulation_ai",
    username: "@daily_crypto_pump_signal",
    authorName: "VIP Trading Signals",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    caption: "1,000% Profit guaranteed within 24 hours! Join VIP Telegram group using link in bio. Guaranteed no losses!",
    hashtags: ["#trading", "#forex", "#crypto", "#guaranteedincome"],
    likes: 12,
    commentsCount: 65,
    commentsList: [],
    timestamp: "1h ago",
    risk_score: 89,
    risk_level: "HIGH",
    forensic_reasons: [
      "Unrealistic investment return claims with high-risk financial fraud patterns",
      "Spliced balance sheet graphic with anomalous pixel noise"
    ]
  },
  {
    id: "IG-IMG-030",
    image_path: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&auto=format&fit=crop&q=80",
    expected_classification: "MANIPULATED",
    source_dataset: "Misinfo_Visual_Linguistic_Corpus",
    detector_type: "image_manipulation_ai",
    username: "@viral_miracle_remedies",
    authorName: "Health Secrets Revealed",
    avatarUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
    caption: "SECRET CURE: Doctors are hiding this natural boiled herbal mixture that cures all chronic diseases in 3 hours! Big pharma banning this post!",
    hashtags: ["#miraclecure", "#secretremedy", "#healthconspiracy"],
    likes: 19,
    commentsCount: 110,
    commentsList: [],
    timestamp: "2h ago",
    risk_score: 92,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Sensationalist medical disinformation with high linguistic distortion index",
      "Doctored clinical certificate badge with mismatched EXIF compression"
    ]
  },
  {
    id: "IG-IMG-031",
    image_path: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80",
    expected_classification: "MANIPULATED",
    source_dataset: "CoMoFoD_CopyMove_Forged",
    detector_type: "image_manipulation_ai",
    username: "@doctored_luxury_assets",
    authorName: "Millionaire Lifestyle Club",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Just bought my third private jet with automated arbitrage profits! Follow to copy all my trades.",
    hashtags: ["#luxury", "#millionaire", "#privatejet", "#lifestyle"],
    likes: 25,
    commentsCount: 74,
    commentsList: [],
    timestamp: "3h ago",
    risk_score: 87,
    risk_level: "HIGH",
    forensic_reasons: [
      "Deep pixel analysis indicates composite splicing of subject figure onto jet tarmac background",
      "Illumination direction on subject contradicts background shadow vectors"
    ]
  },
  {
    id: "IG-IMG-032",
    image_path: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80",
    expected_classification: "SCAM",
    source_dataset: "CASIA2.0_Manipulated_Adversarial",
    detector_type: "image_manipulation_ai",
    username: "@free_giftcard_generators",
    authorName: "Amazon Gift Card Bot",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    caption: "$500 Amazon Gift Cards for EVERY user who installs the test app from the bio link. Code: FREE500.",
    hashtags: ["#freegiftcards", "#amazoncards", "#giveawayalert"],
    likes: 5,
    commentsCount: 140,
    commentsList: [],
    timestamp: "4h ago",
    risk_score: 93,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Trojan dropper application lure pattern detected in bio link payload",
      "Spliced retailer gift card code graphics with anomalous noise gradients"
    ]
  },
  {
    id: "IG-IMG-033",
    image_path: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&auto=format&fit=crop&q=80",
    expected_classification: "PHISHING",
    source_dataset: "PhishIris_Visual_Phishing_Dataset",
    detector_type: "image_manipulation_ai",
    username: "@banking_refund_agent",
    authorName: "Central Bank Tax Refund",
    avatarUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
    caption: "Unclaimed $3,450 tax refund waiting in escrow. Confirm bank account routing number at portal to deposit immediately.",
    hashtags: ["#taxrefund", "#refundalert", "#officialbank"],
    likes: 2,
    commentsCount: 50,
    commentsList: [],
    timestamp: "5h ago",
    risk_score: 96,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Tax authority impersonation with urgent banking credential harvesting parameters"
    ]
  },
  {
    id: "IG-IMG-034",
    image_path: "https://images.unsplash.com/photo-1542744094-3a31727220c3?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1542744094-3a31727220c3?w=400&auto=format&fit=crop&q=80",
    expected_classification: "MANIPULATED",
    source_dataset: "CoMoFoD_CopyMove_Forged",
    detector_type: "image_manipulation_ai",
    username: "@fake_forex_academy",
    authorName: "Forex Master Academy",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Live trading profits from this morning's session: +$148,900.00. DM 'PROFIT' to get entry into our private signals room.",
    hashtags: ["#forextrading", "#profits", "#investing"],
    likes: 18,
    commentsCount: 88,
    commentsList: [],
    timestamp: "6h ago",
    risk_score: 88,
    risk_level: "HIGH",
    forensic_reasons: [
      "Color quantization artifacts detected on brokerage balance screenshot numbers",
      "Cloning artifacts visible along numerical currency columns"
    ]
  },
  {
    id: "IG-IMG-035",
    image_path: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&auto=format&fit=crop&q=80",
    expected_classification: "SCAM",
    source_dataset: "CASIA2.0_Manipulated_Adversarial",
    detector_type: "image_manipulation_ai",
    username: "@instant_loan_no_credit",
    authorName: "Emergency Fast Loans",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    caption: "Instant $10,000 to $50,000 cash loans with 0% interest for 12 months. No credit checks. Pay $50 processing fee to receive funds.",
    hashtags: ["#personalloan", "#instantcash", "#nocreditcheck"],
    likes: 9,
    commentsCount: 62,
    commentsList: [],
    timestamp: "7h ago",
    risk_score: 94,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Advance-fee loan scam pattern: demands upfront fee for non-existent disbursements"
    ]
  },
  {
    id: "IG-IMG-036",
    image_path: "https://images.unsplash.com/photo-1534972195531-a756b1126f24?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1534972195531-a756b1126f24?w=400&auto=format&fit=crop&q=80",
    expected_classification: "MANIPULATED",
    source_dataset: "FaceForensics_Deepfake_Benchmark",
    detector_type: "image_manipulation_ai",
    username: "@celebrity_exclusive_leaks",
    authorName: "AI Deepfake Lab",
    avatarUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
    caption: "LEAKED: CEO admits to insider trading during private conference call. Full unedited audio/video in bio!",
    hashtags: ["#deepfake", "#insidertrading", "#breakingnews"],
    likes: 32,
    commentsCount: 165,
    commentsList: [],
    timestamp: "8h ago",
    risk_score: 93,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "GAN facial boundary warping and eye reflection asymmetry detected",
      "Synthetic face replacement artifacts along neckline and jawline contour"
    ]
  },
  {
    id: "IG-IMG-037",
    image_path: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&auto=format&fit=crop&q=80",
    expected_classification: "SCAM",
    source_dataset: "CASIA2.0_Manipulated_Adversarial",
    detector_type: "image_manipulation_ai",
    username: "@crypto_cloud_mining_hub",
    authorName: "Free Cloud Miner",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    caption: "Mine 1 BTC per day on your smartphone without using battery or CPU! Download cloud mining profile now.",
    hashtags: ["#cloudmining", "#freebitcoin", "#passiveincome"],
    likes: 15,
    commentsCount: 94,
    commentsList: [],
    timestamp: "9h ago",
    risk_score: 90,
    risk_level: "HIGH",
    forensic_reasons: [
      "Malicious mobile configuration profile dropper signature detected"
    ]
  },
  {
    id: "IG-IMG-038",
    image_path: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop&q=80",
    expected_classification: "PHISHING",
    source_dataset: "PhishIris_Visual_Phishing_Dataset",
    detector_type: "image_manipulation_ai",
    username: "@meta_copyright_protection",
    authorName: "Meta Rights Management",
    avatarUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
    caption: "Case #98129: Trademark violation reported against your account. Fill out the official appeal form to prevent ban.",
    hashtags: ["#metahelp", "#copyrightappeal", "#verifiedmeta"],
    likes: 1,
    commentsCount: 30,
    commentsList: [],
    timestamp: "10h ago",
    risk_score: 97,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Spoofed Meta corporate branding designed to harvest 2FA security codes"
    ]
  },
  {
    id: "IG-IMG-039",
    image_path: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&auto=format&fit=crop&q=80",
    expected_classification: "MANIPULATED",
    source_dataset: "CoMoFoD_CopyMove_Forged",
    detector_type: "image_manipulation_ai",
    username: "@doctored_diploma_service",
    authorName: "Express Degree Portal",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Verifiable University Degrees from top Ivy League colleges in 48 hours. No exams required.",
    hashtags: ["#degrees", "#diploma", "#university"],
    likes: 11,
    commentsCount: 72,
    commentsList: [],
    timestamp: "11h ago",
    risk_score: 89,
    risk_level: "HIGH",
    forensic_reasons: [
      "Spliced institutional university seals with high copy-move spatial variance"
    ]
  },
  {
    id: "IG-IMG-040",
    image_path: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&auto=format&fit=crop&q=80",
    expected_classification: "MANIPULATED",
    source_dataset: "CASIA2.0_Manipulated_Adversarial",
    detector_type: "image_manipulation_ai",
    username: "@luxury_lottery_winner",
    authorName: "Mega Millions Winner",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    caption: "Won $120 Million in last night's draw! Giving away $5,000 to the first 500 followers who share this post.",
    hashtags: ["#lotterywinner", "#cashgiveaway", "#blessed"],
    likes: 45,
    commentsCount: 310,
    commentsList: [],
    timestamp: "12h ago",
    risk_score: 92,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Doctored lottery check digits showing digital paintbrush blending artifacts"
    ]
  },
  {
    id: "IG-IMG-041",
    image_path: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&auto=format&fit=crop&q=80",
    expected_classification: "SCAM",
    source_dataset: "CASIA2.0_Manipulated_Adversarial",
    detector_type: "image_manipulation_ai",
    username: "@luxury_villa_giveaway",
    authorName: "Real Estate Raffles",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Win this $4.5M Malibu mansion! Tickets only $25. Link in bio to buy your entry ticket before midnight.",
    hashtags: ["#mansionraffle", "#luxuryrealestate", "#winahome"],
    likes: 21,
    commentsCount: 95,
    commentsList: [],
    timestamp: "13h ago",
    risk_score: 86,
    risk_level: "HIGH",
    forensic_reasons: [
      "Unauthorized property image scraped from architectural magazine with fake lottery overlay"
    ]
  },
  {
    id: "IG-IMG-042",
    image_path: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=400&auto=format&fit=crop&q=80",
    expected_classification: "SCAM",
    source_dataset: "CoMoFoD_CopyMove_Forged",
    detector_type: "image_manipulation_ai",
    username: "@passive_crypto_staking",
    authorName: "Staking Master AI",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    caption: "Stake your ETH to earn 50% weekly dividends. Connect your web3 wallet to smart contract at portal.",
    hashtags: ["#ethereum", "#staking", "#yieldfarming"],
    likes: 14,
    commentsCount: 60,
    commentsList: [],
    timestamp: "14h ago",
    risk_score: 95,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Wallet draining smart contract signature linked to known malicious address clusters"
    ]
  },
  {
    id: "IG-IMG-043",
    image_path: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=400&auto=format&fit=crop&q=80",
    expected_classification: "MANIPULATED",
    source_dataset: "Misinfo_Visual_Linguistic_Corpus",
    detector_type: "image_manipulation_ai",
    username: "@shocking_world_events",
    authorName: "Sensational News 24/7",
    avatarUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
    caption: "SHOCKING: Global emergency declared as major central banks announce immediate cash ban! Read leaked memo in bio.",
    hashtags: ["#breakingnews", "#cashban", "#emergency"],
    likes: 38,
    commentsCount: 190,
    commentsList: [],
    timestamp: "15h ago",
    risk_score: 91,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Fabricated government document header spliced with sensationalist fearmongering text"
    ]
  },
  {
    id: "IG-IMG-044",
    image_path: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80",
    expected_classification: "PHISHING",
    source_dataset: "PhishIris_Visual_Phishing_Dataset",
    detector_type: "image_manipulation_ai",
    username: "@verify_blue_badge_bot",
    authorName: "Instagram Verification Service",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Get your official Blue Verified Checkmark today for free! Enter your password and account info on the verification page.",
    hashtags: ["#bluebadge", "#verification", "#getverified"],
    likes: 4,
    commentsCount: 85,
    commentsList: [],
    timestamp: "16h ago",
    risk_score: 97,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Phishing credential harvester mimicking official badge verification portal"
    ]
  },
  {
    id: "IG-IMG-045",
    image_path: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    expected_classification: "MANIPULATED",
    source_dataset: "CoMoFoD_CopyMove_Forged",
    detector_type: "image_manipulation_ai",
    username: "@nft_art_mint_scam",
    authorName: "Exclusive NFT Mint",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    caption: "FREE Mint for top 100 Discord members! Connect your wallet to claim rare generative artwork.",
    hashtags: ["#nftmint", "#freeart", "#cryptoart"],
    likes: 16,
    commentsCount: 77,
    commentsList: [],
    timestamp: "17h ago",
    risk_score: 89,
    risk_level: "HIGH",
    forensic_reasons: [
      "Plagiarized digital artwork metadata with embedded wallet approval exploit triggers"
    ]
  },
  {
    id: "IG-IMG-046",
    image_path: "https://images.unsplash.com/photo-1563986768711-b3bde3dc821e?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1563986768711-b3bde3dc821e?w=400&auto=format&fit=crop&q=80",
    expected_classification: "PHISHING",
    source_dataset: "PhishIris_Visual_Phishing_Dataset",
    detector_type: "image_manipulation_ai",
    username: "@paypal_payment_hold",
    authorName: "PayPal Resolution Center",
    avatarUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
    caption: "Transaction #PP-82910 held. You have received $850.00 from buyer. Enter your credit card details to release payment.",
    hashtags: ["#paypal", "#paymenthold", "#resolutioncenter"],
    likes: 2,
    commentsCount: 40,
    commentsList: [],
    timestamp: "18h ago",
    risk_score: 98,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Brand credential harvesting format targeting credit card CVV numbers"
    ]
  },
  {
    id: "IG-IMG-047",
    image_path: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=400&auto=format&fit=crop&q=80",
    expected_classification: "MANIPULATED",
    source_dataset: "CASIA2.0_Manipulated_Adversarial",
    detector_type: "image_manipulation_ai",
    username: "@fake_celebrity_quotes",
    authorName: "Viral Quotes Daily",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Billionaire investor endorses secret automated trading app on national television broadcast.",
    hashtags: ["#investing", "#quotes", "#wealth"],
    likes: 42,
    commentsCount: 130,
    commentsList: [],
    timestamp: "19h ago",
    risk_score: 90,
    risk_level: "HIGH",
    forensic_reasons: [
      "Fabricated quote typography composited over broadcast news snapshot"
    ]
  },
  {
    id: "IG-IMG-048",
    image_path: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
    expected_classification: "SCAM",
    source_dataset: "CASIA2.0_Manipulated_Adversarial",
    detector_type: "image_manipulation_ai",
    username: "@hack_any_social_account",
    authorName: "Cyber Recovery Specialists",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    caption: "Recover any hacked Instagram, WhatsApp, or Facebook account in 10 minutes. 100% success rate. DM for tools.",
    hashtags: ["#accountrecovery", "#hacked", "#cyberhelp"],
    likes: 7,
    commentsCount: 68,
    commentsList: [],
    timestamp: "20h ago",
    risk_score: 93,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Malicious payload delivery pretending to be credential recovery utility"
    ]
  },
  {
    id: "IG-IMG-049",
    image_path: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=400&auto=format&fit=crop&q=80",
    expected_classification: "SCAM",
    source_dataset: "CASIA2.0_Manipulated_Adversarial",
    detector_type: "image_manipulation_ai",
    username: "@cash_app_flip_glitch",
    authorName: "Money Flip Official",
    avatarUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
    caption: "New Cash App software glitch! Send $100 to receive $1,000 immediately in your balance. Working as of today.",
    hashtags: ["#cashappflip", "#moneyglitch", "#fastcash"],
    likes: 10,
    commentsCount: 115,
    commentsList: [],
    timestamp: "21h ago",
    risk_score: 95,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Classic Cash App money flip advance fee scam format with doctored balance graphic"
    ]
  },
  {
    id: "IG-IMG-050",
    image_path: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80",
    thumbnail_path: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80",
    expected_classification: "PHISHING",
    source_dataset: "PhishIris_Visual_Phishing_Dataset",
    detector_type: "image_manipulation_ai",
    username: "@cloud_storage_quota_alert",
    authorName: "Cloud Storage Admin",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    caption: "Your photo storage quota is 99% full! Photos will be deleted in 24 hours unless you verify login credentials at link.",
    hashtags: ["#storagealert", "#cloudbackup", "#quotaexceeded"],
    likes: 3,
    commentsCount: 52,
    commentsList: [],
    timestamp: "22h ago",
    risk_score: 97,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Urgency-driven storage warning phishing template designed to capture master account password"
    ]
  }
];

// =========================================================================
// 20 DEMO PROFILES FOR INSTAGRAM PROFILE AUTHENTICITY SCANNER
// =========================================================================
export const INSTAGRAM_20_PROFILES: InstagramProfile[] = [
  // --- 10 AUTHENTIC PROFILES ---
  {
    username: "@marcus_researcher",
    name: "Marcus Reynolds",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Cybersecurity Researcher • Zero-Trust Architect • CyberShield Sim Lab",
    website: "https://cybershield.ai/research",
    postsCount: 14,
    followersCount: 1420,
    followingCount: 380,
    isVerified: true,
    expected_classification: "AUTHENTIC",
    risk_score: 8,
    risk_level: "LOW",
    forensic_reasons: [
      "Balanced follower-to-following ratio (3.74x)",
      "Longitudinal organic posting history with verified research credentials",
      "Zero high-risk financial giveaway or phishing keywords"
    ],
    recentPosts: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"
    ]
  },
  {
    username: "@elena_designs",
    name: "Elena Rostova",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Architect & Urban Minimalist • Tokyo & Milan • Creating spaces that inspire ✨",
    website: "https://elenarostova.design",
    postsCount: 18,
    followersCount: 3890,
    followingCount: 420,
    isVerified: true,
    expected_classification: "AUTHENTIC",
    risk_score: 6,
    risk_level: "LOW",
    forensic_reasons: [
      "Natural high-engagement follower ratio (9.26x)",
      "Consistent photography EXIF metadata matching professional Sony A7R hardware"
    ],
    recentPosts: [
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400"
    ]
  },
  {
    username: "@sarah_chen_ai",
    name: "Sarah Chen",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "AI Systems Engineer • Coffee Connoisseur • Exploring multimodal heuristics ☕",
    website: "https://sarahchen.dev",
    postsCount: 22,
    followersCount: 2450,
    followingCount: 310,
    isVerified: true,
    expected_classification: "AUTHENTIC",
    risk_score: 7,
    risk_level: "LOW",
    forensic_reasons: ["Verified domain authority and natural comment engagement frequency"],
    recentPosts: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400"
    ]
  },
  {
    username: "@liam_explores",
    name: "Liam Walker",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "Alpine Mountaineering & Outdoor Wilderness Photography 🏔️🌲",
    website: "https://liamexplores.com",
    postsCount: 35,
    followersCount: 5620,
    followingCount: 540,
    isVerified: false,
    expected_classification: "AUTHENTIC",
    risk_score: 8,
    risk_level: "LOW",
    forensic_reasons: ["Authentic geographic tagged posts matching wilderness metadata"],
    recentPosts: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400"
    ]
  },
  {
    username: "@cyber_institute",
    name: "Cyber Defense Lab",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Official Research Account for Global Threat Intelligence & Zero-Trust Defense",
    website: "https://cyberdefense.org",
    postsCount: 48,
    followersCount: 12400,
    followingCount: 180,
    isVerified: true,
    expected_classification: "AUTHENTIC",
    risk_score: 5,
    risk_level: "LOW",
    forensic_reasons: ["Institutional domain SSL validation and high verified community trust"],
    recentPosts: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400"
    ]
  },
  {
    username: "@dr_alex_vance",
    name: "Dr. Alex Vance",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Receiver Lead Security Officer • Quantum Cryptography • CyberShield Ecosystem",
    website: "https://cybershield.ai/vance",
    postsCount: 12,
    followersCount: 1980,
    followingCount: 220,
    isVerified: true,
    expected_classification: "AUTHENTIC",
    risk_score: 7,
    risk_level: "LOW",
    forensic_reasons: ["Authorized platform administrator identity with dual signature"],
    recentPosts: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"
    ]
  },
  {
    username: "@culinary_journal",
    name: "Chef Antoine",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    bio: "Artisanal French Pastry & Gastronomy • Le Cordon Bleu Alum",
    website: "https://antoinecuisine.fr",
    postsCount: 29,
    followersCount: 4100,
    followingCount: 390,
    isVerified: false,
    expected_classification: "AUTHENTIC",
    risk_score: 6,
    risk_level: "LOW",
    forensic_reasons: ["Natural organic interaction velocity and zero spam heuristics"],
    recentPosts: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
    ]
  },
  {
    username: "@roadtrip_diaries",
    name: "Lucas Grey",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "Living in a converted van • Exploring scenic backroads across America 🚐",
    website: "https://roadtripdiaries.com",
    postsCount: 42,
    followersCount: 6890,
    followingCount: 620,
    isVerified: false,
    expected_classification: "AUTHENTIC",
    risk_score: 8,
    risk_level: "LOW",
    forensic_reasons: ["Clean profile metadata and genuine photo EXIF data"],
    recentPosts: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400"
    ]
  },
  {
    username: "@interior_curator",
    name: "Sophia Reed",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "Curating Scandinavian & Japanese interior spaces • Architecture enthusiast",
    website: "https://sophiareed.studio",
    postsCount: 31,
    followersCount: 3750,
    followingCount: 410,
    isVerified: false,
    expected_classification: "AUTHENTIC",
    risk_score: 7,
    risk_level: "LOW",
    forensic_reasons: ["Legitimate portfolio design backlinks verified"],
    recentPosts: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400"
    ]
  },
  {
    username: "@digital_creators",
    name: "Studio Sync",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Creative digital production studio • Motion design & 3D art",
    website: "https://studiosync.tv",
    postsCount: 26,
    followersCount: 4890,
    followingCount: 340,
    isVerified: false,
    expected_classification: "AUTHENTIC",
    risk_score: 9,
    risk_level: "LOW",
    forensic_reasons: ["Zero artificial following spikes detected over 30-day window"],
    recentPosts: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400"
    ]
  },

  // --- 10 SUSPICIOUS / FAKE / BOT PROFILES ---
  {
    username: "@crypto_giveaway_bot_99",
    name: "BTC Fast Doubler Bot",
    avatarUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
    bio: "🔥 FREE CRYPTO REWARDS • 500% GUARANTEED RETURN IN 1 HOUR • CLICK LINK BEFORE IT CLOSES 💰👇",
    website: "http://192.168.1.200/crypto-giveaway.php",
    postsCount: 2,
    followersCount: 14,
    followingCount: 4850,
    isVerified: false,
    expected_classification: "FAKE",
    risk_score: 96,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Extremely anomalous following-to-follower ratio (346.4x following vs followers)",
      "High-density financial scam and multiplier keywords in biography",
      "Direct IP address host used in external bio redirect link"
    ],
    recentPosts: [
      "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400"
    ]
  },
  {
    username: "@instant_cash_claims",
    name: "Fast Grant Payouts",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    bio: "Official government grant distribution agent. Claim $10,000 - $50,000 payouts daily! DM account info.",
    website: "http://free-cash-grants-claim.xyz/payout",
    postsCount: 3,
    followersCount: 22,
    followingCount: 3900,
    isVerified: false,
    expected_classification: "FAKE",
    risk_score: 92,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Government agency impersonation combined with advance-fee wire fraud indicators",
      "Mass aggressive follow-unfollow bot pattern detected"
    ],
    recentPosts: [
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400"
    ]
  },
  {
    username: "@security_alert_team_v2",
    name: "Account Security Center",
    avatarUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
    bio: "Official Instagram Trust & Safety Team. Account violation resolution portal.",
    website: "http://192.168.1.10/meta-security-login.php",
    postsCount: 1,
    followersCount: 5,
    followingCount: 2800,
    isVerified: false,
    expected_classification: "FAKE",
    risk_score: 98,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Blatant platform security team impersonation",
      "Credential harvesting phishing link targeting 2FA authentication tokens"
    ],
    recentPosts: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400"
    ]
  },
  {
    username: "@free_giftcard_generators",
    name: "Amazon Gift Card Bot",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    bio: "Generate unlimited $500 Amazon Gift Cards! 100% Free & Legal. Click below!",
    website: "http://amazon-cards-free-generator.top",
    postsCount: 4,
    followersCount: 18,
    followingCount: 3200,
    isVerified: false,
    expected_classification: "FAKE",
    risk_score: 94,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Suspicious TLD (.top) associated with malware dropper campaigns",
      "Repetitive automated gift card generator spam comments"
    ],
    recentPosts: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400"
    ]
  },
  {
    username: "@verify_blue_badge_bot",
    name: "Instagram Verification Service",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Instant verified badge provider for public figures. Submit your account details to get verified today.",
    website: "http://instagram-blue-tick-portal.net/verify",
    postsCount: 1,
    followersCount: 12,
    followingCount: 1950,
    isVerified: false,
    expected_classification: "FAKE",
    risk_score: 95,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Phishing credential harvester designed to seize Instagram account ownership"
    ],
    recentPosts: [
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400"
    ]
  },
  {
    username: "@cash_app_flip_glitch",
    name: "Money Flip Official",
    avatarUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
    bio: "Turn $50 into $500 in 15 minutes! Guaranteed working Cash App flip glitch. DM me now.",
    website: "http://cashapp-glitch-doubler.info",
    postsCount: 2,
    followersCount: 9,
    followingCount: 4100,
    isVerified: false,
    expected_classification: "FAKE",
    risk_score: 97,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Classic financial flip fraud heuristics with high-urgency DM baiting"
    ],
    recentPosts: [
      "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=400"
    ]
  },
  {
    username: "@doctored_luxury_assets",
    name: "Millionaire Lifestyle Club",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Retire in 30 days! Copy my automated forex arbitrage bot. Guaranteed 10x ROI every week.",
    website: "http://millionaire-arbitrage-vip.biz",
    postsCount: 6,
    followersCount: 35,
    followingCount: 2400,
    isVerified: false,
    expected_classification: "SUSPICIOUS",
    risk_score: 86,
    risk_level: "HIGH",
    forensic_reasons: [
      "Spliced composite photography combined with high-risk investment promises"
    ],
    recentPosts: [
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400"
    ]
  },
  {
    username: "@free_followers_generator_v2",
    name: "Grow Social Fast",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    bio: "Get 10,000 real followers for FREE! No password needed. Test our bot network now.",
    website: "http://10k-free-followers-boost.me",
    postsCount: 2,
    followersCount: 40,
    followingCount: 5100,
    isVerified: false,
    expected_classification: "FAKE",
    risk_score: 91,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Botnet engagement service distributing automated account scraping scripts"
    ],
    recentPosts: [
      "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400"
    ]
  },
  {
    username: "@viral_miracle_remedies",
    name: "Health Secrets Revealed",
    avatarUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
    bio: "Cures big pharma won't tell you about. Click link to order the secret herbal drops.",
    website: "http://miracle-herbal-cure.store",
    postsCount: 5,
    followersCount: 60,
    followingCount: 3800,
    isVerified: false,
    expected_classification: "SUSPICIOUS",
    risk_score: 88,
    risk_level: "HIGH",
    forensic_reasons: [
      "Medical disinformation and unverified miracle cure health claim patterns"
    ],
    recentPosts: [
      "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400"
    ]
  },
  {
    username: "@hack_any_social_account",
    name: "Cyber Recovery Specialists",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    bio: "Professional ethical hackers. Recover any Instagram, WhatsApp, or email account.",
    website: "http://darknet-account-recovery.co",
    postsCount: 3,
    followersCount: 15,
    followingCount: 2900,
    isVerified: false,
    expected_classification: "FAKE",
    risk_score: 94,
    risk_level: "CRITICAL",
    forensic_reasons: [
      "Malicious hacking service scam targeting victims of account compromise"
    ],
    recentPosts: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400"
    ]
  }
];
