from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class SecurityEventModel(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(64), unique=True, index=True, nullable=False)
    sender_type = Column(String(64), nullable=False)
    sender_name = Column(String(255), nullable=False)
    modality = Column(String(64), index=True, nullable=False)
    content = Column(Text, nullable=False)
    content_reference = Column(String(255), nullable=True)
    receiver_surface = Column(String(128), nullable=False, default="Messages / SMS")
    status = Column(String(64), nullable=False, default="analyzed")
    classification = Column(String(64), index=True, nullable=False)
    risk_score = Column(Integer, nullable=False, default=0)
    risk_level = Column(String(32), index=True, nullable=False)
    confidence = Column(Float, nullable=False, default=0.95)
    ai_model = Column(String(128), nullable=False)
    forensic_reasons = Column(Text, nullable=False)  # JSON-serialized list of strings
    recommended_action = Column(String(64), nullable=False)
    final_action = Column(String(64), index=True, nullable=False)
    user_action = Column(String(64), nullable=True)
    created_at = Column(String(64), index=True, nullable=False)
    received_at = Column(String(64), nullable=False)
    analyzed_at = Column(String(64), nullable=False)
    processed_at = Column(String(64), nullable=False)

    # Relationships
    timelines = relationship(
        "EventTimelineModel", 
        back_populates="event", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    actions = relationship(
        "EventActionModel", 
        back_populates="event", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    notifications = relationship(
        "NotificationModel", 
        back_populates="event", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )

class EventTimelineModel(Base):
    __tablename__ = "event_timelines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(64), ForeignKey("security_events.event_id", ondelete="CASCADE"), index=True, nullable=False)
    step = Column(String(128), nullable=False)
    status = Column(String(64), nullable=False, default="DONE")
    timestamp = Column(String(64), nullable=False)
    description = Column(Text, nullable=True)

    event = relationship("SecurityEventModel", back_populates="timelines")

class EventActionModel(Base):
    __tablename__ = "event_actions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(64), ForeignKey("security_events.event_id", ondelete="CASCADE"), index=True, nullable=False)
    action = Column(String(64), nullable=False)
    previous_action = Column(String(64), nullable=False)
    timestamp = Column(String(64), nullable=False)
    actor = Column(String(128), nullable=False, default="Authenticated Security Officer")

    event = relationship("SecurityEventModel", back_populates="actions")

class NotificationModel(Base):
    __tablename__ = "security_notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    notification_id = Column(String(64), unique=True, index=True, nullable=False)
    event_id = Column(String(64), ForeignKey("security_events.event_id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(32), index=True, nullable=False)  # INFO, REVIEW, WARNING, HIGH_RISK, CRITICAL
    classification = Column(String(64), nullable=False)
    risk_score = Column(Integer, nullable=False, default=0)
    risk_level = Column(String(32), nullable=False, default="LOW")
    action = Column(String(64), nullable=False, default="ALLOW")
    is_read = Column(Integer, nullable=False, default=0, index=True)
    created_at = Column(String(64), nullable=False)
    read_at = Column(String(64), nullable=True)

    event = relationship("SecurityEventModel", back_populates="notifications")

class PlatformIntegrationModel(Base):
    __tablename__ = "platform_integrations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    platform_id = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)
    status = Column(String(64), nullable=False, default="NOT_CONNECTED")
    is_simulation = Column(Integer, nullable=False, default=0)
    required_permissions = Column(Text, nullable=False)  # JSON-serialized list
    granted_permissions = Column(Text, nullable=False, default="[]")  # JSON-serialized list
    capabilities = Column(Text, nullable=False)  # JSON-serialized list
    connection_health = Column(String(64), nullable=False, default="OFFLINE")
    last_connected_at = Column(String(64), nullable=True)
    created_at = Column(String(64), nullable=False)
    updated_at = Column(String(64), nullable=False)

    audits = relationship(
        "IntegrationAuditModel",
        back_populates="integration",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

class IntegrationAuditModel(Base):
    __tablename__ = "integration_audits"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    platform_id = Column(String(64), ForeignKey("platform_integrations.platform_id", ondelete="CASCADE"), index=True, nullable=False)
    action = Column(String(64), nullable=False)
    result = Column(String(64), nullable=False, default="SUCCESS")
    details = Column(Text, nullable=True)
    timestamp = Column(String(64), nullable=False)

    integration = relationship("PlatformIntegrationModel", back_populates="audits")

# =========================================================================
# MULTI-USER CONVERSATION ECOSYSTEM ORM MODELS
# =========================================================================

class DemoUserModel(Base):
    __tablename__ = "demo_users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    avatar = Column(String(255), nullable=False)
    role = Column(String(128), nullable=False, default="Student / Researcher")
    status = Column(String(64), nullable=False, default="online")
    created_at = Column(String(64), nullable=False)

class ConversationModel(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(String(64), unique=True, index=True, nullable=False)
    conversation_type = Column(String(32), index=True, nullable=False, default="DIRECT") # DIRECT or GROUP
    title = Column(String(255), nullable=False)
    created_by = Column(String(64), nullable=False, default="user-kavin")
    status = Column(String(32), nullable=False, default="ACTIVE")
    created_at = Column(String(64), nullable=False)
    updated_at = Column(String(64), nullable=False)

    members = relationship("ConversationMemberModel", back_populates="conversation", cascade="all, delete-orphan")
    messages = relationship("MessageModel", back_populates="conversation", cascade="all, delete-orphan")

class ConversationMemberModel(Base):
    __tablename__ = "conversation_members"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(String(64), ForeignKey("conversations.conversation_id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(64), index=True, nullable=False)
    role = Column(String(32), nullable=False, default="MEMBER") # OWNER, ADMIN, MEMBER
    joined_at = Column(String(64), nullable=False)

    conversation = relationship("ConversationModel", back_populates="members")

class MessageModel(Base):
    __tablename__ = "conversation_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    message_id = Column(String(64), unique=True, index=True, nullable=False)
    conversation_id = Column(String(64), ForeignKey("conversations.conversation_id", ondelete="CASCADE"), index=True, nullable=False)
    sender_id = Column(String(64), index=True, nullable=False)
    content = Column(Text, nullable=False)
    content_type = Column(String(32), nullable=False, default="text") # text, url, image, video, news, file
    timestamp = Column(String(64), index=True, nullable=False)
    
    # CyberShield Security Engine Fields
    security_status = Column(String(32), index=True, nullable=False, default="SAFE") # SAFE, SUSPICIOUS, DANGEROUS
    classification = Column(String(64), nullable=False, default="SAFE")
    risk_score = Column(Integer, nullable=False, default=0)
    risk_level = Column(String(32), nullable=False, default="LOW")
    confidence = Column(Float, nullable=False, default=0.95)
    forensic_reasons = Column(Text, nullable=False, default="[]") # JSON list
    event_id = Column(String(64), nullable=True) # Linked SecurityEvent ID
    created_at = Column(String(64), nullable=False)

    conversation = relationship("ConversationModel", back_populates="messages")
    recipients = relationship("MessageRecipientModel", back_populates="message", cascade="all, delete-orphan")

class MessageRecipientModel(Base):
    __tablename__ = "message_recipients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    message_id = Column(String(64), ForeignKey("conversation_messages.message_id", ondelete="CASCADE"), index=True, nullable=False)
    recipient_id = Column(String(64), index=True, nullable=False)
    delivery_status = Column(String(32), nullable=False, default="DELIVERED") # DELIVERED, QUARANTINED, BLOCKED
    security_action = Column(String(32), nullable=False, default="ALLOW") # ALLOW, QUARANTINE, BLOCK, REVIEW
    delivered_at = Column(String(64), nullable=False)
    read_at = Column(String(64), nullable=True)

    message = relationship("MessageModel", back_populates="recipients")

class UserContactModel(Base):
    __tablename__ = "user_contacts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), index=True, nullable=False) # Owner of contact entry (e.g. user-kavin)
    contact_user_id = Column(String(64), index=True, nullable=False) # Target contact user ID (e.g. user-riya)
    display_name = Column(String(128), nullable=False)
    phone_number = Column(String(64), nullable=False)
    avatar = Column(String(255), nullable=False)
    status = Column(String(255), nullable=False, default="Hey there! I am using WhatsApp.")
    last_seen = Column(String(64), nullable=False, default="Today at 10:42 AM")
    is_online = Column(Integer, nullable=False, default=1)
    is_favorite = Column(Integer, nullable=False, default=0)
    created_at = Column(String(64), nullable=False)


