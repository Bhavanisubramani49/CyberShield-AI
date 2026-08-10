from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class GatewaySendRequest(BaseModel):
    platform: Optional[str] = Field(default="whatsapp", description="Platform identifier: whatsapp, instagram, messages, email, web, photos, videos, news, files")
    sender_id: str = Field(..., description="Sender Persona or Account Identifier (e.g. SND-WA-001)")
    sender_name: Optional[str] = Field(default="Marcus Reynolds", description="Sender display name")
    recipient_id: str = Field(default="RCV-WA-001", description="Target recipient application identifier")
    recipient_name: Optional[str] = Field(default="Receiver Mobile User", description="Recipient display name")
    content_type: str = Field(default="message", description="Content modality (message, email, url, news, image, video, file, profile)")
    payload: Dict[str, Any] = Field(..., description="Message/Content payload dictionary")
    source_app: Optional[str] = Field(default="CyberShield External Sender App", description="Source client application name")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional transmission metadata")

class GatewaySendResponse(BaseModel):
    event_id: str
    platform: str = "whatsapp"
    sender_id: str = "Marcus Reynolds"
    recipient_id: str = "Receiver Mobile User"
    status: str = "PROCESSED"
    decision: str = Field(..., description="Security decision: ALLOW, REVIEW, BLOCK, QUARANTINE")
    delivered_to_receiver: bool = Field(..., description="True if safe content is delivered directly to user inbox; False if intercepted")
    receiver_status: str = Field(..., description="DELIVERED_NORMAL, INTERCEPTED_AND_QUARANTINED, INTERCEPTED_AND_BLOCKED, PENDING_USER_REVIEW")
    classification: str
    risk_score: int
    risk_level: str
    reasons: List[str] = Field(default_factory=list)
    model: str
    processing_time_ms: float
    timestamp: str

class GatewayHealthResponse(BaseModel):
    status: str = "HEALTHY"
    gateway_version: str = "1.0.0"
    ai_detectors_active: int = 8
    persistence: str = "SQLite Persistent"
    active_adapters: int = 7
    environment: str = "academic_simulation"
    timestamp: str

class GatewayReceiverInboxItem(BaseModel):
    event_id: str
    platform: str = "whatsapp"
    sender_id: str
    recipient_id: str
    content_type: str
    content_preview: str
    delivery_state: str = Field(..., description="NORMAL_MESSAGE, CYBERSHIELD_SECURITY_WARNING, PENDING_REVIEW")
    security_decision: str
    risk_score: int
    risk_level: str
    interception_reasons: List[str] = Field(default_factory=list)
    is_quarantined: bool = False
    timestamp: str
