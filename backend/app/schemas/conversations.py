from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DemoUserSchema(BaseModel):
    user_id: str
    name: str
    avatar: str
    role: str
    status: str = "online"

class ConversationMemberSchema(BaseModel):
    user_id: str
    name: str
    avatar: str
    role: str

class LatestMessageSchema(BaseModel):
    message_id: str
    sender_id: str
    content: str
    security_status: str
    classification: str
    risk_score: int
    timestamp: str

class ConversationSummarySchema(BaseModel):
    conversation_id: str
    conversation_type: str
    title: str
    created_by: str
    status: str
    members: List[ConversationMemberSchema]
    member_count: int
    latest_message: Optional[LatestMessageSchema] = None
    threat_count: int
    updated_at: str

class MessageItemSchema(BaseModel):
    message_id: str
    conversation_id: str
    sender_id: str
    sender_name: str
    sender_avatar: str
    content: str
    content_type: str
    timestamp: str
    security_status: str
    classification: str
    risk_score: int
    risk_level: str
    confidence: float
    forensic_reasons: List[str]
    event_id: Optional[str] = None
    created_at: str

class SendConversationMessageRequest(BaseModel):
    sender_id: str
    content: str
    content_type: str = "text"
