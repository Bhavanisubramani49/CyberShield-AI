from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DemoUserSchema(BaseModel):
    user_id: str
    name: str
    email: Optional[str] = None
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
    channel: str = "WHATSAPP"
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

class UserContactSchema(BaseModel):
    id: int
    user_id: str
    contact_user_id: str
    display_name: str
    phone_number: str
    avatar: str
    status: str
    last_seen: str
    is_online: bool
    is_favorite: bool

class MessageActionRequest(BaseModel):
    action: str = Field(..., description="BLOCK or ALLOW")

