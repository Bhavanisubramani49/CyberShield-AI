from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class SecurityNotificationSchema(BaseModel):
    id: Optional[int] = None
    notification_id: str
    event_id: str
    title: str
    message: str
    severity: str
    classification: str
    risk_score: int
    risk_level: str
    action: str
    is_read: bool
    created_at: str
    read_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class NotificationUnreadStatsSchema(BaseModel):
    unread_count: int
    critical_count: int
    high_risk_count: int
    review_count: int
    total_count: int

class NotificationActionUpdateRequest(BaseModel):
    action: str
