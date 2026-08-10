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
