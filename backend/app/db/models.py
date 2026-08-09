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
