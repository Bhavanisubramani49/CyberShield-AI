export type NavigationPage = 
  | 'home' 
  | 'sender' 
  | 'receiver' 
  | 'monitor' 
  | 'dashboard' 
  | 'history' 
  | 'notifications'
  | 'permissions'
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

export interface ModalityMetric {
  modality: string;
  label: string;
  total_events: number;
  threats_detected: number;
  avg_risk_score: number;
}

export interface RecentThreatItem {
  event_id: string;
  timestamp: string;
  modality: string;
  sender_id: string;
  classification: string;
  risk_level: string;
  risk_score: number;
  ai_model: string;
  action: string;
  content_preview: string;
}

export interface DashboardSummaryData {
  period: string;
  total_events: number;
  threats_detected: number;
  threats_blocked: number;
  threats_quarantined: number;
  events_under_review: number;
  safe_events: number;
  avg_latency_ms: number;
  threat_distribution: Record<string, { count: number; percentage: number }>;
  risk_distribution: Record<string, { count: number; percentage: number }>;
  action_distribution: Record<string, { count: number; percentage: number }>;
  modality_analytics: ModalityMetric[];
  ai_model_performance: RegisteredAIModel[];
  top_threat_types: string[];
  top_risk_sources: string[];
  recent_threats: RecentThreatItem[];
  quarantine_summary: {
    total_quarantined: number;
    critical_threats: number;
    pending_review: number;
    released_safe: number;
    blocked_permanently: number;
  };
  protection_status: string;
}

export interface RegisteredAIModel {
  name: string;
  modality: string;
  version: string;
  status: string;
  type?: string;
  description: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
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

export type NotificationSeverity = 'INFO' | 'REVIEW' | 'WARNING' | 'HIGH_RISK' | 'CRITICAL';

export interface SecurityNotification {
  id?: number;
  notification_id: string;
  event_id: string;
  title: string;
  message: string;
  severity: NotificationSeverity | string;
  classification: string;
  risk_score: number;
  risk_level: string;
  action: string;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
}

export interface NotificationUnreadStats {
  unread_count: number;
  critical_count: number;
  high_risk_count: number;
  review_count: number;
  total_count: number;
}

export interface PermissionDetail {
  scope: string;
  title: string;
  description: string;
  is_granted: boolean;
}

export interface PlatformIntegration {
  platform_id: string;
  name: string;
  category: string;
  status: 'AUTHORIZED_SIMULATION' | 'NOT_CONNECTED' | 'PENDING' | 'AUTHORIZED' | 'DENIED' | 'REVOKED' | 'ERROR' | string;
  is_simulation: boolean;
  required_permissions: string[];
  granted_permissions: string[];
  capabilities: string[];
  connection_health: 'ONLINE' | 'OFFLINE' | 'NOT_CONFIGURED' | 'RESTRICTED' | string;
  last_connected_at?: string | null;
  created_at: string;
  updated_at: string;
  description?: string | null;
  auth_requirement_note?: string | null;
}

export interface IntegrationSummary {
  total_adapters: number;
  authorized_platforms: number;
  pending_platforms: number;
  disconnected_platforms: number;
  active_integrations: PlatformIntegration[];
}
