from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class AISecurityResultSchema(BaseModel):
    classification: str
    confidence: float
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
    platform: str
    content_type: str
    content_preview: str
    content_reference: Optional[str] = None
    timestamp: str
    status: str
    ai_result: Optional[AISecurityResultSchema] = None
    user_action: Optional[str] = None
