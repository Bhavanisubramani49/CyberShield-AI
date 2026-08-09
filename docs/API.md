# CyberShield AI — REST API Reference Documentation

Base URL: `http://127.0.0.1:8000/api/v1`  
Interactive OpenAPI Swagger Docs: `http://127.0.0.1:8000/api/v1/docs`  
Interactive ReDoc: `http://127.0.0.1:8000/api/v1/redoc`

---

## 1. System Health & Telemetry

### `GET /api/v1/health`
- **Purpose**: Returns real-time system operational status, active AI models list, and connected platform identifiers.
- **Response**: `200 OK`
```json
{
  "status": "Healthy",
  "project_name": "CyberShield AI",
  "version": "1.0.0",
  "environment": "academic_simulation",
  "platforms_connected": {
    "platform_1_sender": "Connected",
    "platform_2_receiver": "Connected",
    "platform_3_cybershield_ai": "Connected"
  },
  "active_ai_models": [
    "sms_scam_detection_ai",
    "email_phishing_classifier",
    "url_threat_evaluator",
    "fake_news_detector",
    "image_manipulation_detector",
    "deepfake_video_pipeline",
    "fake_profile_analyzer",
    "file_security_checker"
  ],
  "timestamp": "2026-08-09T08:00:00.000000Z"
}
```

### `GET /api/v1/metrics`
- **Purpose**: Returns system performance and memory telemetry.
- **Response**: `200 OK`

---

## 2. Threat Analysis & Security Events

### `POST /api/v1/events/analyze`
- **Purpose**: Routes incoming payload to the appropriate AI detector, computing threat classification, confidence, risk score, and explainable reasons.
- **Request Body**:
```json
{
  "content_type": "message",
  "sender_type": "simulated_attacker",
  "sender_name": "Lottery Bot",
  "payload": {
    "text": "Urgent: You won ₹25,00,000 lottery reward! Click to claim."
  }
}
```
- **Response**: `200 OK`
```json
{
  "classification": "SCAM",
  "confidence": 0.98,
  "risk_score": 96,
  "risk_level": "CRITICAL",
  "reasons": ["Urgent financial reward language", "Unsolicited prize claim structure"],
  "recommendation": "QUARANTINE",
  "model": "sms_scam_detection_ai",
  "processing_time_ms": 16.4,
  "timestamp": "2026-08-09T08:00:00.000000Z"
}
```

### `POST /api/v1/events/send`
- **Purpose**: Ingests and stores a complete security event into the persistent SQLite database, initializing the 6-stage lifecycle and generating an alert.
- **Request Body**: Complete `SecurityEvent` JSON schema.
- **Response**: `200 OK` (Returns stored event with generated `id` and `event_id`).

### `GET /api/v1/events`
- **Purpose**: Paginated, searchable, multi-filter security event retrieval directly from SQLite.
- **Query Parameters**:
  - `search` (string): Search query across Event ID, sender, classification, content.
  - `modality` (string): `message`, `email`, `url`, `fake_news`, `profile`, `image`, `video`, `file`.
  - `risk_level` (string): `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
  - `action` (string): `ALLOW`, `REVIEW`, `BLOCK`, `QUARANTINE`.
  - `classification` (string): `SAFE`, `SCAM`, `PHISHING`, `MALICIOUS`, etc.
  - `date_filter` (string): `all`, `24h`, `7d`, `30d`.
  - `sort_by` (string): `newest`, `oldest`, `highest_risk`, `lowest_risk`.
  - `page` (int, default: 1)
  - `limit` (int, default: 20, max: 100)
- **Response**: `200 OK` (JSON array of `SecurityEventSchema`).

### `GET /api/v1/events/{event_id}`
- **Purpose**: Returns complete forensic inspection details, AI reasons, timeline steps, and action audit trail for a single event.
- **Response**: `200 OK` / `404 Not Found`.

### `POST /api/v1/events/{event_id}/action`
- **Purpose**: Overrides or updates security decision (`ALLOW`, `BLOCK`, `QUARANTINE`, `REVIEW`).
- **Request Body**: `{"action": "QUARANTINE"}`
- **Response**: `200 OK`.

### `DELETE /api/v1/events/{event_id}`
- **Purpose**: Cascade deletes a simulation event and its timeline and audit rows from SQLite.
- **Response**: `200 OK`.

### `GET /api/v1/events/stats`
- **Purpose**: Aggregate statistics (total, safe, threats, blocked, quarantined, under review, modality distribution).
- **Response**: `200 OK`.

### `GET /api/v1/events/stream`
- **Purpose**: Server-Sent Events (SSE) stream for real-time live event broadcasts to connected clients.
- **Response**: `text/event-stream`.

---

## 3. AI Model Registry & Datasets

### `GET /api/v1/ai/models`
- **Purpose**: Returns metadata for all 8 registered AI models including accuracy, precision, recall, F1-score, and modality.
- **Response**: `200 OK`.

### `GET /api/v1/ai/datasets`
- **Purpose**: Returns inventory of benchmark dataset fixtures in `backend/datasets/`.
- **Response**: `200 OK`.

---

## 4. Security Dashboard & Analytics

### `GET /api/v1/dashboard/summary`
- **Purpose**: Aggregated security intelligence across selected timeframe for Dashboard charts and telemetry.
- **Query Parameters**: `period` (`all`, `24h`, `7d`, `30d`).
- **Response**: `200 OK`.

---

## 5. Real-Time Security Notifications & Alert Center

### `GET /api/v1/notifications`
- **Purpose**: Returns real-time alerts generated from persistent security events.
- **Query Parameters**: `severity`, `is_read`, `page`, `limit`.
- **Response**: `200 OK`.

### `GET /api/v1/notifications/unread`
- **Purpose**: Returns unread alert counts and severity breakdown for Header badges.
- **Response**: `200 OK` (`{"unread_count": 0, "critical_count": 0, "high_risk_count": 0, "review_count": 0, "total_count": 3}`).

### `POST /api/v1/notifications/{notification_id}/read`
- **Purpose**: Marks an alert as read/unread in SQLite.
- **Query Parameters**: `is_read` (`true`/`false`).
- **Response**: `200 OK`.

### `POST /api/v1/notifications/read-all`
- **Purpose**: Marks all alerts as read in a single transaction.
- **Response**: `200 OK`.

### `DELETE /api/v1/notifications/{notification_id}`
- **Purpose**: Deletes notification record while keeping `SecurityEvent` intact.
- **Response**: `200 OK`.

---

## 6. Platform Integrations & Zero-Trust Permissions

### `GET /api/v1/integrations`
- **Purpose**: Lists all 7 registered platform adapters (CyberShield Simulation, WhatsApp, Instagram, Facebook, Gmail, Generic Email, Generic Social) and their authorization status.
- **Response**: `200 OK`.

### `GET /api/v1/integrations/summary`
- **Purpose**: High-level integration metrics (authorized sandbox vs disconnected external targets).
- **Response**: `200 OK`.

### `GET /api/v1/integrations/{platform_id}/permissions`
- **Purpose**: Returns list of required permission scopes and granted states for a specific adapter.
- **Response**: `200 OK`.

### `POST /api/v1/integrations/{platform_id}/connect`
- **Purpose**: Authorizes local simulation platform or explains official OAuth requirement for third-party targets.
- **Request Body**: `{"grant_all_permissions": true}`
- **Response**: `200 OK` (or `403 Forbidden` with disclaimer if external).

### `POST /api/v1/integrations/{platform_id}/disconnect`
- **Purpose**: Disconnects adapter and revokes active permission scopes.
- **Response**: `200 OK`.

### `POST /api/v1/integrations/{platform_id}/permissions`
- **Purpose**: Updates granted permission scopes in SQLite.
- **Request Body**: `{"granted_permissions": ["RECEIVE_EVENTS", "ANALYZE_CONTENT"]}`
- **Response**: `200 OK`.

### `POST /api/v1/integrations/normalize-event`
- **Purpose**: Enforces permission checks and normalizes raw incoming event payload.
- **Query Parameters**: `platform_id` (`simulation`, etc.).
- **Response**: `200 OK` (`NormalizedEventSchema`) or `403 Forbidden`.

---

## 7. External Gateway & Inter-App Bridge APIs (Module 16)

### `GET /api/v1/gateway/health`
- **Purpose**: Health heartbeat indicator for the External Sender App and Receiver Mobile App.
- **Response**: `200 OK`
```json
{
  "status": "HEALTHY",
  "gateway_version": "1.0.0",
  "ai_detectors_active": 8,
  "persistence": "SQLite Persistent",
  "active_adapters": 7,
  "environment": "academic_simulation",
  "timestamp": "2026-08-09T08:00:00.000000Z"
}
```

### `POST /api/v1/gateway/send`
- **Purpose**: Ingests external client synthetic communications through the security gateway, validates the API key, executes the multimodal AI inference pipeline, persists in SQLite, and returns the real-time security decision.
- **Headers**:
  - `X-CyberShield-API-Key` (required): Gateway authorization key (default: `cs-sim-key-prod-2026`).
- **Request Body**:
```json
{
  "sender_id": "Colleague Sarah (+1 555 019 2834)",
  "recipient_id": "Receiver Mobile Device (+1 555 019 9999)",
  "content_type": "message",
  "payload": {
    "text": "Good morning team, meeting at 10 AM."
  },
  "source_app": "CyberShield External Sender Application"
}
```
- **Response**: `200 OK`
```json
{
  "event_id": "EVT-GTW-108291",
  "status": "PROCESSED",
  "decision": "ALLOW",
  "delivered_to_receiver": true,
  "receiver_status": "DELIVERED_NORMAL",
  "classification": "SAFE",
  "risk_score": 12,
  "risk_level": "LOW",
  "reasons": ["Authentic conversational pattern", "No financial or urgency trap markers"],
  "model": "sms_scam_detection_ai",
  "processing_time_ms": 18.2,
  "timestamp": "2026-08-09T08:00:00.000000Z"
}
```

### `GET /api/v1/gateway/receiver/inbox`
- **Purpose**: Returns the filtered message feed for the External Receiver Mobile App. Distinguishes normal delivered content from intercepted CyberShield security alert cards.
- **Query Parameters**:
  - `recipient_id` (optional): Filter for specific mobile device identifier.
  - `limit` (int, default: 30)
- **Response**: `200 OK` (JSON array of `GatewayReceiverInboxItem`).

### `POST /api/v1/gateway/receiver/{event_id}/review-action`
- **Purpose**: Allows mobile receiver user to interactively `ALLOW` or `BLOCK` a pending review item.
- **Query Parameters**: `action` (`ALLOW` or `BLOCK`).
- **Response**: `200 OK` (`{"status": "SUCCESS", "event_id": "...", "new_action": "ALLOW"}`).

