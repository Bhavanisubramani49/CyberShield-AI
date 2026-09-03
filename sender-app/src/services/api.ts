import { GatewaySendResponse, GatewayHealthResponse } from '../types';

const GATEWAY_URL = 'http://127.0.0.1:8000/api/v1/gateway';
const DEFAULT_API_KEY = 'cs-sim-key-prod-2026';

export async function checkGatewayHealth(): Promise<GatewayHealthResponse> {
  const res = await fetch(`${GATEWAY_URL}/health`);
  if (!res.ok) {
    throw new Error('CyberShield Core Gateway is offline or unreachable.');
  }
  return await res.json();
}

export async function transmitEventToCore(
  payload: {
    platform?: string;
    sender_id: string;
    sender_name?: string;
    recipient_id: string;
    recipient_name?: string;
    content_type: string;
    payload: Record<string, any>;
    source_app?: string;
  },
  apiKey: string = DEFAULT_API_KEY
): Promise<GatewaySendResponse> {
  const res = await fetch(`${GATEWAY_URL}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CyberShield-API-Key': apiKey
    },
    body: JSON.stringify({
      platform: payload.platform || 'whatsapp',
      sender_id: payload.sender_id,
      sender_name: payload.sender_name || 'Marcus Reynolds',
      recipient_id: payload.recipient_id,
      recipient_name: payload.recipient_name || 'Receiver Mobile User',
      content_type: payload.content_type,
      payload: payload.payload,
      source_app: payload.source_app || 'CyberShield External Sender Application (Port 5174)'
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Transmission failed.' }));
    throw new Error(err.detail || `Transmission failed with status ${res.status}`);
  }

  return await res.json();
}

// Multi-User Conversation Ecosystem Functions for Sender App
const API_V1_URL = 'http://127.0.0.1:8000/api/v1';

export async function fetchDemoUsersSenderAPI() {
  try {
    const res = await fetch(`${API_V1_URL}/conversations/users`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Sender conversations users API offline:', e);
  }
  return [];
}

export async function fetchConversationsSenderAPI(userId: string = 'user-riya') {
  try {
    const res = await fetch(`${API_V1_URL}/conversations?user_id=${encodeURIComponent(userId)}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Sender conversations API offline:', e);
  }
  return [];
}

export async function fetchConversationMessagesSenderAPI(conversationId: string) {
  try {
    const res = await fetch(`${API_V1_URL}/conversations/${encodeURIComponent(conversationId)}/messages`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Sender conversation messages API offline:', e);
  }
  return [];
}

export async function sendConversationMessageSenderAPI(conversationId: string, senderId: string, content: string) {
  const res = await fetch(`${API_V1_URL}/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender_id: senderId,
      content,
      content_type: 'text'
    })
  });
  if (!res.ok) {
    throw new Error('Sender dispatch failed.');
  }
  return await res.json();
}

