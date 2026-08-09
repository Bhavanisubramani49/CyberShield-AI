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
    sender_id: string;
    recipient_id: string;
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
      ...payload,
      source_app: payload.source_app || 'CyberShield External Sender Application (Port 5174)'
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Transmission failed.' }));
    throw new Error(err.detail || `Transmission failed with status ${res.status}`);
  }

  return await res.json();
}
