from fastapi import APIRouter, HTTPException, Header, Depends, Query, status
from typing import Optional, List, Dict
from datetime import datetime, timezone
import time

from app.core.config import settings
from app.schemas.gateway import (
    GatewaySendRequest,
    GatewaySendResponse,
    GatewayHealthResponse,
    GatewayReceiverInboxItem
)
from app.services.event_processor import event_processor_service
from app.services.notification_service import notification_service
from app.db.database import SessionLocal
from app.db.models import SecurityEventModel, IntegrationAuditModel

router = APIRouter(prefix="/gateway", tags=["External Gateway & Inter-App Bridge"])

# Simple in-memory rate limiter tracking timestamps per client
_RATE_LIMIT_BUCKET: Dict[str, List[float]] = {}

def check_rate_limit(client_id: str):
    now = time.time()
    window = 60.0
    max_requests = settings.GATEWAY_RATE_LIMIT_PER_MINUTE

    if client_id not in _RATE_LIMIT_BUCKET:
        _RATE_LIMIT_BUCKET[client_id] = []

    # Filter out requests older than window
    _RATE_LIMIT_BUCKET[client_id] = [t for t in _RATE_LIMIT_BUCKET[client_id] if now - t < window]

    if len(_RATE_LIMIT_BUCKET[client_id]) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded on CyberShield Security Gateway. Please throttle transmission requests."
        )

    _RATE_LIMIT_BUCKET[client_id].append(now)

def verify_gateway_api_key(
    x_cybershield_api_key: Optional[str] = Header(None, alias="X-CyberShield-API-Key"),
    authorization: Optional[str] = Header(None)
) -> str:
    key = x_cybershield_api_key
    if not key and authorization and authorization.startswith("Bearer "):
        key = authorization.replace("Bearer ", "").strip()

    if not key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing CyberShield Gateway API Key. Provide 'X-CyberShield-API-Key' header or Bearer authorization."
        )

    if key != settings.GATEWAY_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid CyberShield Gateway API Key. Access denied."
        )

    check_rate_limit(key)
    return key

@router.get("/health", response_model=GatewayHealthResponse)
def get_gateway_health():
    """Heartbeat and status indicator for External Sender and Receiver applications."""
    return GatewayHealthResponse(
        status="HEALTHY",
        gateway_version=settings.VERSION,
        ai_detectors_active=8,
        persistence="SQLite Persistent",
        active_adapters=7,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc).isoformat()
    )

@router.post("/send", response_model=GatewaySendResponse)
def receive_external_sender_event(
    req: GatewaySendRequest,
    api_key: str = Depends(verify_gateway_api_key)
):
    """
    Core Security Gateway Endpoint:
    Accepts synthetic events from the External Sender Application,
    routes through Multimodal Threat Engine, stores in SQLite,
    dispatches notifications, and returns the containment decision.
    """
    if not req.payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload dictionary cannot be empty."
        )

    # 1. Generate unique gateway event ID
    event_id = f"EVT-GTW-{int(time.time() * 1000) % 1000000:06d}"

    # Map content type & sender persona
    sender_type = "simulated_attacker"
    lower_sender = req.sender_id.lower()
    if "colleague" in lower_sender or "sarah" in lower_sender or "normal" in lower_sender or "dr." in lower_sender:
        sender_type = "normal_user"
    elif "bot" in lower_sender or "fake" in lower_sender:
        sender_type = "fake_account"

    # 2. Execute full analysis & persistence pipeline
    stored_event = event_processor_service.process_and_store_event(
        event_id=event_id,
        content_type=req.content_type,
        sender_type=sender_type,
        sender_name=req.sender_id,
        payload=req.payload
    )

    # 3. Create persistent Notification & Alert record
    db = SessionLocal()
    try:
        event_model = db.query(SecurityEventModel).filter(SecurityEventModel.event_id == stored_event.event_id).first()
        if event_model:
            notification_service.create_notification_from_event(event_model)

        # Log gateway audit record
        audit = IntegrationAuditModel(
            platform_id="simulation",
            action="GATEWAY_EVENT_PROCESSED",
            result="SUCCESS",
            details=f"Event {stored_event.event_id} processed for {req.source_app} ({req.sender_id}): {stored_event.classification} ({stored_event.risk_score}/100) -> {stored_event.final_action}",
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        db.add(audit)
        db.commit()
    finally:
        db.close()

    # 4. Determine Receiver Delivery State
    decision = stored_event.final_action or stored_event.recommended_action or "ALLOW"
    delivered = False
    receiver_status = "DELIVERED_NORMAL"

    if decision == "ALLOW":
        delivered = True
        receiver_status = "DELIVERED_NORMAL"
    elif decision == "QUARANTINE":
        delivered = False
        receiver_status = "INTERCEPTED_AND_QUARANTINED"
    elif decision == "BLOCK":
        delivered = False
        receiver_status = "INTERCEPTED_AND_BLOCKED"
    elif decision == "REVIEW":
        delivered = False
        receiver_status = "PENDING_USER_REVIEW"

    return GatewaySendResponse(
        event_id=stored_event.event_id,
        status="PROCESSED",
        decision=decision,
        delivered_to_receiver=delivered,
        receiver_status=receiver_status,
        classification=stored_event.classification,
        risk_score=stored_event.risk_score,
        risk_level=stored_event.risk_level,
        reasons=stored_event.forensic_reasons or [],
        model=stored_event.ai_model,
        processing_time_ms=stored_event.ai_result.processing_time_ms if stored_event.ai_result else 24.5,
        timestamp=stored_event.created_at
    )

@router.get("/receiver/inbox", response_model=List[GatewayReceiverInboxItem])
def get_receiver_inbox(
    recipient_id: Optional[str] = Query(None, description="Filter for specific receiver device ID"),
    limit: int = Query(30, ge=1, le=100)
):
    """
    Dedicated feed for the External Receiver Mobile Application.
    Distinguishes delivered safe content from intercepted CyberShield security alerts.
    """
    events = event_processor_service.get_all_events(limit=limit)
    inbox_items: List[GatewayReceiverInboxItem] = []

    for e in events:
        decision = e.user_action or e.final_action or e.recommended_action or "ALLOW"
        is_quarantined = decision == "QUARANTINE"

        if decision == "ALLOW":
            delivery_state = "NORMAL_MESSAGE"
        elif decision in ["QUARANTINE", "BLOCK"]:
            delivery_state = "CYBERSHIELD_SECURITY_WARNING"
        else:
            delivery_state = "PENDING_REVIEW"

        inbox_items.append(GatewayReceiverInboxItem(
            event_id=e.event_id,
            sender_id=e.sender_id,
            recipient_id=recipient_id or "Receiver Mobile Device (+1 555 019 9999)",
            content_type=e.content_type,
            content_preview=e.content_preview or "",
            delivery_state=delivery_state,
            security_decision=decision,
            risk_score=e.risk_score,
            risk_level=e.risk_level,
            interception_reasons=e.forensic_reasons or [],
            is_quarantined=is_quarantined,
            timestamp=e.created_at
        ))

    return inbox_items

@router.post("/receiver/{event_id}/review-action")
def update_receiver_review_action(
    event_id: str,
    action: str = Query(..., pattern="^(ALLOW|BLOCK)$")
):
    """Allows receiver user to resolve a pending review item."""
    updated = event_processor_service.update_event_action(event_id, action, actor="Receiver Mobile User")
    if not updated:
        raise HTTPException(status_code=404, detail="Event not found.")
    return {"status": "SUCCESS", "event_id": event_id, "new_action": action}
