from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.notifications import SecurityNotificationSchema, NotificationUnreadStatsSchema
from app.services.notification_service import notification_service

router = APIRouter()

@router.get("/notifications", response_model=List[SecurityNotificationSchema], summary="Get Real-Time Security Notifications")
async def get_notifications(
    severity: Optional[str] = Query(None, description="Filter by severity e.g. CRITICAL, HIGH_RISK, REVIEW, INFO"),
    is_read: Optional[bool] = Query(None, description="Filter by read/unread state"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Returns list of security notifications generated directly from persistent SQLite security events.
    """
    return notification_service.get_notifications(
        severity=severity,
        is_read=is_read,
        page=page,
        limit=limit
    )

@router.get("/notifications/unread", response_model=NotificationUnreadStatsSchema, summary="Get Unread Notification Counts & Severity Breakdown")
async def get_unread_notification_stats():
    """
    Returns current unread alert counts and breakdown for header badge and quick alerts.
    """
    return notification_service.get_unread_stats()

@router.post("/notifications/{notification_id}/read", response_model=SecurityNotificationSchema, summary="Mark Notification as Read/Unread")
async def mark_notification_read(notification_id: str, is_read: bool = Query(True)):
    """
    Persists read status for the specified notification in SQLite.
    """
    updated = notification_service.mark_as_read(notification_id, is_read=is_read)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Notification '{notification_id}' not found")
    return updated

@router.post("/notifications/read-all", summary="Mark All Notifications as Read")
async def mark_all_notifications_read():
    """
    Sets is_read=1 across all unread alerts in SQLite.
    """
    count = notification_service.mark_all_as_read()
    return {"status": "success", "marked_read_count": count}

@router.delete("/notifications/{notification_id}", summary="Delete Notification")
async def delete_notification(notification_id: str):
    """
    Removes notification record from SQLite while preserving the underlying SecurityEvent.
    """
    deleted = notification_service.delete_notification(notification_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Notification '{notification_id}' not found")
    return {"status": "success", "message": f"Notification '{notification_id}' removed"}
