export type NavigationPage = 
  | 'home' 
  | 'sender' 
  | 'receiver' 
  | 'monitor' 
  | 'dashboard' 
  | 'history' 
  | 'settings' 
  | 'profile';

export type AuthScreen = 'login' | 'register' | 'forgot_password';

export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  id: string;
  fullName: string;
  name?: string;
  email: string;
  role: string;
  status?: string;
  accountStatus?: string;
  avatar?: string;
  securityScore?: number;
  createdAt?: string;
}

export type ContentType = 
  | 'message' 
  | 'email' 
  | 'url' 
  | 'news' 
  | 'image' 
  | 'video' 
  | 'profile' 
  | 'file';

export type SenderAccountType = 
  | 'normal_user' 
  | 'unknown_user' 
  | 'fake_account' 
  | 'simulated_attacker' 
  | 'simulated_hacker';

export type ThreatClassification = 
  | 'SCAM' 
  | 'PHISHING' 
  | 'MALICIOUS' 
  | 'FAKE_NEWS' 
  | 'MANIPULATED' 
  | 'DEEPFAKE' 
  | 'SUSPICIOUS' 
  | 'SAFE';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SecurityAction = 'BLOCK' | 'REVIEW' | 'ALLOW' | 'QUARANTINE' | 'PENDING';

export interface TimelineStep {
  step: string;
  status: string;
  timestamp: string;
  detail?: string;
}

export interface AISecurityResult {
  classification: ThreatClassification;
  confidence: number;
  risk_score?: number;
  risk_level: RiskLevel;
  reasons: string[];
  recommendation: SecurityAction;
  model: string;
  timestamp: string;
  processing_time_ms: number;
}

export interface SecurityEvent {
  event_id: string;
  sender_id: string;
  sender_type: SenderAccountType | string;
  receiver_id: string;
  receiver_surface?: string;
  platform: string;
  content_type: ContentType | string;
  content_preview: string;
  content_reference?: string;
  created_at?: string;
  received_at?: string;
  processed_at?: string;
  timestamp: string;
  status: string;
  classification?: string;
  risk_score?: number;
  risk_level?: RiskLevel;
  confidence?: number;
  ai_model?: string;
  forensic_reasons?: string[];
  recommended_action?: string;
  final_action?: string;
  ai_result?: AISecurityResult;
  user_action?: SecurityAction | string;
  timeline?: TimelineStep[];
}

export interface EventStats {
  total_events: number;
  safe_events: number;
  threats_detected: number;
  blocked: number;
  quarantined: number;
  under_review: number;
  allowed: number;
  modality_distribution: Record<string, number>;
  avg_latency_ms: number;
}

export interface SystemHealth {
  status: string;
  project_name: string;
  version: string;
  environment: string;
  platforms_connected: {
    platform_1_sender: string;
    platform_2_receiver: string;
    platform_3_cybershield_ai: string;
  };
  active_ai_models: string[];
  timestamp: string;
}
