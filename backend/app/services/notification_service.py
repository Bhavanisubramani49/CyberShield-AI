from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import NotificationModel, SecurityEventModel
from app.schemas.notifications import SecurityNotificationSchema, NotificationUnreadStatsSchema

class NotificationService:
    def get_session(self) -> Session:
        return SessionLocal()

    def _model_to_schema(self, model: NotificationModel) -> SecurityNotificationSchema:
        return SecurityNotificationSchema(
            id=model.id,
            notification_id=model.notification_id,
            event_id=model.event_id,
            title=model.title,
            message=model.message,
            severity=model.severity,
            classification=model.classification,
            risk_score=model.risk_score,
            risk_level=model.risk_level,
            action=model.action,
            is_read=bool(model.is_read),
            created_at=model.created_at,
            read_at=model.read_at
        )

    def create_notification_from_event(self, event: SecurityEventModel) -> Optional[SecurityNotificationSchema]:
        session = self.get_session()
        try:
            # 1. Duplicate Prevention: Check if notification already exists for event_id
            existing = session.query(NotificationModel).filter(NotificationModel.event_id == event.event_id).first()
            if existing:
                existing.action = event.user_action or event.final_action or existing.action
                session.commit()
                session.refresh(existing)
                return self._model_to_schema(existing)

            # 2. Map Severity and Content
            risk_level = (event.risk_level or "LOW").upper()
            classification = event.classification or "SAFE"
            score = event.risk_score or 0
            action = event.user_action or event.final_action or "ALLOW"

            if risk_level == "CRITICAL":
                severity = "CRITICAL"
                title = f"🚨 Critical Security Threat: {classification}"
                message = f"High-confidence threat intercepted. CyberShield AI recommends {event.recommended_action}."
            elif risk_level == "HIGH":
                severity = "HIGH_RISK"
                title = f"⚠️ High-Risk Content: {classification}"
                message = f"Potential threat flagged with calibrated risk score {score}/100. Action required."
            elif risk_level == "MEDIUM" or event.recommended_action == "REVIEW":
                severity = "REVIEW"
                title = f"🔎 Review Required: {classification}"
                message = f"Suspicious indicators detected in {event.modality}. User decision requested."
            else:
                severity = "INFO"
                title = f"✓ Safe Content Verified"
                message = f"Communication passed zero-trust analysis with score {score}/100."

            nid = f"NOTIF-{event.event_id.replace('EVT-', '')}"
            now_iso = datetime.now(timezone.utc).isoformat()

            notif = NotificationModel(
                notification_id=nid,
                event_id=event.event_id,
                title=title,
                message=message,
                severity=severity,
                classification=classification,
                risk_score=score,
                risk_level=risk_level,
                action=action,
                is_read=0,
                created_at=event.created_at or now_iso,
                read_at=None
            )
            session.add(notif)
            session.commit()
            session.refresh(notif)

            # 3. Notification Retention Strategy: keep newest 100 notifications
            total_notifs = session.query(NotificationModel).count()
            if total_notifs > 100:
                oldest = session.query(NotificationModel).order_by(NotificationModel.id.asc()).limit(total_notifs - 100).all()
                for old in oldest:
                    session.delete(old)
                session.commit()

            return self._model_to_schema(notif)
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def get_notifications(
        self,
        severity: Optional[str] = None,
        is_read: Optional[bool] = None,
        page: int = 1,
        limit: int = 20
    ) -> List[SecurityNotificationSchema]:
        session = self.get_session()
        try:
            # Sync any events in SQLite that don't have notifications yet
            events = session.query(SecurityEventModel).all()
            for e in events:
                has_notif = session.query(NotificationModel).filter(NotificationModel.event_id == e.event_id).first()
                if not has_notif:
                    self.create_notification_from_event(e)

            query = session.query(NotificationModel)

            if severity and severity.upper() != "ALL":
                query = query.filter(NotificationModel.severity == severity.upper())
            if is_read is not None:
                query = query.filter(NotificationModel.is_read == (1 if is_read else 0))

            query = query.order_by(NotificationModel.id.desc())

            limit = min(max(1, limit), 100)
            offset = max(0, (page - 1) * limit)
            models = query.offset(offset).limit(limit).all()

            return [self._model_to_schema(m) for m in models]
        finally:
            session.close()

    def get_unread_stats(self) -> NotificationUnreadStatsSchema:
        session = self.get_session()
        try:
            total = session.query(NotificationModel).count()
            unread = session.query(NotificationModel).filter(NotificationModel.is_read == 0).count()
            critical = session.query(NotificationModel).filter(
                NotificationModel.is_read == 0,
                NotificationModel.severity == "CRITICAL"
            ).count()
            high_risk = session.query(NotificationModel).filter(
                NotificationModel.is_read == 0,
                NotificationModel.severity == "HIGH_RISK"
            ).count()
            review = session.query(NotificationModel).filter(
                NotificationModel.is_read == 0,
                NotificationModel.severity == "REVIEW"
            ).count()

            return NotificationUnreadStatsSchema(
                unread_count=unread,
                critical_count=critical,
                high_risk_count=high_risk,
                review_count=review,
                total_count=total
            )
        finally:
            session.close()

    def mark_as_read(self, notification_id: str, is_read: bool = True) -> Optional[SecurityNotificationSchema]:
        session = self.get_session()
        try:
            notif = session.query(NotificationModel).filter(NotificationModel.notification_id == notification_id).first()
            if not notif:
                return None
            notif.is_read = 1 if is_read else 0
            notif.read_at = datetime.now(timezone.utc).isoformat() if is_read else None
            session.commit()
            session.refresh(notif)
            return self._model_to_schema(notif)
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def mark_all_as_read(self) -> int:
        session = self.get_session()
        try:
            now_iso = datetime.now(timezone.utc).isoformat()
            updated = session.query(NotificationModel).filter(NotificationModel.is_read == 0).update({
                NotificationModel.is_read: 1,
                NotificationModel.read_at: now_iso
            })
            session.commit()
            return updated
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def delete_notification(self, notification_id: str) -> bool:
        session = self.get_session()
        try:
            notif = session.query(NotificationModel).filter(NotificationModel.notification_id == notification_id).first()
            if not notif:
                return False
            session.delete(notif)
            session.commit()
            return True
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

# Global singleton notification service
notification_service = NotificationService()
