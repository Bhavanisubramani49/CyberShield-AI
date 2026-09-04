export interface SenderUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  personaType: 'researcher' | 'attacker' | 'bot' | 'custom';
}

export interface GatewaySendResponse {
  event_id: string;
  platform: string;
  sender_id: string;
  recipient_id: string;
  status: string;
  decision: 'ALLOW' | 'REVIEW' | 'BLOCK' | 'QUARANTINE';
  delivered_to_receiver: boolean;
  receiver_status: 'DELIVERED_NORMAL' | 'INTERCEPTED_AND_QUARANTINED' | 'INTERCEPTED_AND_BLOCKED' | 'PENDING_USER_REVIEW';
  classification: string;
  risk_score: number;
  risk_level: string;
  reasons: string[];
  model: string;
  processing_time_ms: number;
  timestamp: string;
}

export interface GatewayHealthResponse {
  status: string;
  gateway_version: string;
  ai_detectors_active: number;
  persistence: string;
  active_adapters: number;
  environment: string;
  timestamp: string;
}

export interface UserContact {
  id: number;
  user_id: string;
  contact_user_id: string;
  display_name: string;
  phone_number: string;
  avatar: string;
  status: string;
  last_seen: string;
  is_online: boolean;
  is_favorite: boolean;
}

export interface ConversationMember {
  user_id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface ConversationSummary {
  conversation_id: string;
  conversation_type: 'DIRECT' | 'GROUP' | string;
  channel?: string;
  title: string;
  created_by: string;
  status: string;
  members: ConversationMember[];
  member_count: number;
  latest_message?: {
    message_id: string;
    sender_id: string;
    content: string;
    security_status: string;
    classification: string;
    risk_score: number;
    timestamp: string;
    created_at?: string;
  };
  threat_count: number;
  updated_at: string;
}

export interface MessageItem {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  content: string;
  content_type: string;
  timestamp: string;
  security_status: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS' | 'BLOCKED' | 'ALLOWED' | string;
  classification: string;
  risk_score: number;
  risk_level: string;
  confidence: number;
  forensic_reasons: string[];
  event_id?: string;
  created_at?: string;
}
