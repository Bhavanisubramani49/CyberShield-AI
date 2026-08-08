from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class TimelineStepSchema(BaseModel):
    step: str
    status: str
    timestamp: str
    detail: Optional[str] = None

class AISecurityResultSchema(BaseModel):
    classification: str
    confidence: float
    risk_score: int
    risk_level: str
    reasons: List[str]
    recommendation: str
    model: str
    timestamp: str
    processing_time_ms: float

class EventAnalyzeRequest(BaseModel):
    content_type: str
    sender_type: str
    sender_name: str
    payload: Dict[str, Any]

class EventSendRequest(BaseModel):
    event_id: str
    content_type: str
    sender_type: str
    sender_name: str
    payload: Dict[str, Any]
    ai_result: AISecurityResultSchema

class SecurityEventSchema(BaseModel):
    event_id: str
    sender_id: str
    sender_type: str
    receiver_id: str
    receiver_surface: str
    platform: str
    content_type: str
    content_preview: str
    content_reference: Optional[str] = None
    created_at: str
    received_at: str
    processed_at: str
    status: str
    classification: str
    risk_score: int
    risk_level: str
    confidence: float
    ai_model: str
    forensic_reasons: List[str]
    recommended_action: str
    final_action: str
    user_action: Optional[str] = None
    ai_result: Optional[AISecurityResultSchema] = None
    timeline: List[TimelineStepSchema] = []

class EventStatsSchema(BaseModel):
    total_events: int
    safe_events: int
    threats_detected: int
    blocked: int
    quarantined: int
    under_review: int
    allowed: int
    modality_distribution: Dict[str, int]
    avg_latency_ms: float

class UserActionUpdateRequest(BaseModel):
    action: str
