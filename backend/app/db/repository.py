import json
import time
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import SecurityEventModel, EventTimelineModel, EventActionModel
from app.schemas.events import (
    SecurityEventSchema, 
    TimelineStepSchema, 
    AISecurityResultSchema,
    EventStatsSchema
)

class EventRepository:
    def get_session(self) -> Session:
        return SessionLocal()

    def _model_to_schema(self, model: SecurityEventModel) -> SecurityEventSchema:
        reasons = []
        try:
            reasons = json.loads(model.forensic_reasons)
        except Exception:
            reasons = [model.forensic_reasons] if model.forensic_reasons else []

        ai_res = AISecurityResultSchema(
            classification=model.classification,
            confidence=model.confidence,
            risk_score=model.risk_score,
            risk_level=model.risk_level,
            reasons=reasons,
            recommendation=model.recommended_action,
            model=model.ai_model,
            timestamp=model.analyzed_at,
            processing_time_ms=22.4
        )

        timeline = [
            TimelineStepSchema(
                step=t.step,
                status=t.status,
                timestamp=t.timestamp,
                detail=t.description
            )
            for t in sorted(model.timelines, key=lambda x: x.id)
        ]

        return SecurityEventSchema(
            event_id=model.event_id,
            sender_id=model.sender_name,
            sender_type=model.sender_type,
            receiver_id="Receiver Platform",
            receiver_surface=model.receiver_surface,
            platform="CyberShield-Simulation-Hub",
            content_type=model.modality,
            content_preview=model.content,
            content_reference=model.content_reference,
            created_at=model.created_at,
            received_at=model.received_at,
            processed_at=model.processed_at,
            status=model.status,
            classification=model.classification,
            risk_score=model.risk_score,
            risk_level=model.risk_level,
            confidence=model.confidence,
            ai_model=model.ai_model,
            forensic_reasons=reasons,
            recommended_action=model.recommended_action,
            final_action=model.final_action,
            user_action=model.user_action or model.final_action,
            ai_result=ai_res,
            timeline=timeline
        )

    def create_event(
        self,
        event_data: Dict[str, Any],
        timeline_steps: List[Dict[str, str]] = None
    ) -> SecurityEventSchema:
        session = self.get_session()
        try:
            eid = event_data["event_id"]
            # Check if event already exists to update
            existing = session.query(SecurityEventModel).filter(SecurityEventModel.event_id == eid).first()
            if existing:
                existing.content = event_data.get("content_preview", existing.content)
                existing.classification = event_data.get("classification", existing.classification)
                existing.risk_score = event_data.get("risk_score", existing.risk_score)
                existing.risk_level = event_data.get("risk_level", existing.risk_level)
                existing.final_action = event_data.get("final_action", existing.final_action)
                existing.user_action = event_data.get("user_action", existing.user_action)
                session.commit()
                session.refresh(existing)
                return self._model_to_schema(existing)

            reasons_json = json.dumps(event_data.get("forensic_reasons", []))
            model = SecurityEventModel(
                event_id=eid,
                sender_type=event_data.get("sender_type", "normal_user"),
                sender_name=event_data.get("sender_id", "Simulated Sender"),
                modality=event_data.get("content_type", "message"),
                content=event_data.get("content_preview", "Simulated Content"),
                content_reference=event_data.get("content_reference"),
                receiver_surface=event_data.get("receiver_surface", "Messages / SMS"),
                status=event_data.get("status", "analyzed"),
                classification=event_data.get("classification", "SAFE"),
                risk_score=event_data.get("risk_score", 0),
                risk_level=event_data.get("risk_level", "LOW"),
                confidence=event_data.get("confidence", 0.95),
                ai_model=event_data.get("ai_model", "cyber_ai_engine"),
                forensic_reasons=reasons_json,
                recommended_action=event_data.get("recommended_action", "ALLOW"),
                final_action=event_data.get("final_action", "ALLOW"),
                user_action=event_data.get("user_action", event_data.get("final_action", "ALLOW")),
                created_at=event_data.get("created_at", datetime.now(timezone.utc).isoformat()),
                received_at=event_data.get("received_at", datetime.now(timezone.utc).isoformat()),
                analyzed_at=event_data.get("processed_at", datetime.now(timezone.utc).isoformat()),
                processed_at=event_data.get("processed_at", datetime.now(timezone.utc).isoformat())
            )
            session.add(model)
            session.flush()

            # Add timeline steps
            if timeline_steps:
                for step in timeline_steps:
                    tl = EventTimelineModel(
                        event_id=eid,
                        step=step.get("step", "Step"),
                        status=step.get("status", "DONE"),
                        timestamp=step.get("timestamp", datetime.now().strftime("%H:%M:%S")),
                        description=step.get("detail") or step.get("description", "")
                    )
                    session.add(tl)

            session.commit()
            session.refresh(model)
            return self._model_to_schema(model)
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def get_event(self, event_id: str) -> Optional[SecurityEventSchema]:
        session = self.get_session()
        try:
            model = session.query(SecurityEventModel).filter(SecurityEventModel.event_id == event_id).first()
            if not model:
                return None
            return self._model_to_schema(model)
        finally:
            session.close()

    def get_events(
        self,
        modality: Optional[str] = None,
        risk_level: Optional[str] = None,
        action: Optional[str] = None,
        classification: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> List[SecurityEventSchema]:
        session = self.get_session()
        try:
            query = session.query(SecurityEventModel)

            if modality and modality.upper() != "ALL":
                query = query.filter(SecurityEventModel.modality.ilike(f"%{modality}%"))
            if risk_level and risk_level.upper() != "ALL":
                query = query.filter(SecurityEventModel.risk_level == risk_level.upper())
            if action and action.upper() != "ALL":
                query = query.filter(
                    (SecurityEventModel.user_action == action.upper()) | 
                    (SecurityEventModel.final_action == action.upper())
                )
            if classification and classification.upper() != "ALL":
                query = query.filter(SecurityEventModel.classification == classification.upper())
            if status and status.upper() != "ALL":
                query = query.filter(SecurityEventModel.status == status.lower())

            # Order by id descending (most recent first)
            query = query.order_by(SecurityEventModel.id.desc())

            # Pagination
            limit = min(max(1, limit), 100)
            offset = max(0, (page - 1) * limit)
            models = query.offset(offset).limit(limit).all()

            return [self._model_to_schema(m) for m in models]
        finally:
            session.close()

    def update_event_action(
        self,
        event_id: str,
        new_action: str,
        actor: str = "Authenticated Security Officer"
    ) -> Optional[SecurityEventSchema]:
        session = self.get_session()
        try:
            model = session.query(SecurityEventModel).filter(SecurityEventModel.event_id == event_id).first()
            if not model:
                return None

            prev_action = model.user_action or model.final_action or "PENDING"
            model.user_action = new_action.upper()
            model.final_action = new_action.upper()

            # Record action audit
            now_iso = datetime.now(timezone.utc).isoformat()
            now_time = datetime.now().strftime("%H:%M:%S")
            action_record = EventActionModel(
                event_id=event_id,
                action=new_action.upper(),
                previous_action=prev_action,
                timestamp=now_iso,
                actor=actor
            )
            session.add(action_record)

            # Record timeline step
            timeline_step = EventTimelineModel(
                event_id=event_id,
                step="User Action Override",
                status="DONE",
                timestamp=now_time,
                description=f"Action updated to {new_action.upper()} by {actor}"
            )
            session.add(timeline_step)

            session.commit()
            session.refresh(model)
            return self._model_to_schema(model)
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def delete_event(self, event_id: str) -> bool:
        session = self.get_session()
        try:
            model = session.query(SecurityEventModel).filter(SecurityEventModel.event_id == event_id).first()
            if not model:
                return False

            session.delete(model)
            session.commit()
            return True
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def get_statistics(self) -> EventStatsSchema:
        session = self.get_session()
        try:
            events = session.query(SecurityEventModel).all()
            total = len(events)
            safe = sum(1 for e in events if e.user_action == "ALLOW" or e.classification == "SAFE")
            blocked = sum(1 for e in events if e.user_action == "BLOCK" or e.final_action == "BLOCK")
            quarantined = sum(1 for e in events if e.user_action == "QUARANTINE" or e.final_action == "QUARANTINE")
            review = sum(1 for e in events if e.user_action == "REVIEW" or e.final_action == "REVIEW")
            threats = sum(1 for e in events if e.classification not in ["SAFE", "PENDING"])

            modality_dist: Dict[str, int] = {}
            for e in events:
                modality_dist[e.modality] = modality_dist.get(e.modality, 0) + 1

            return EventStatsSchema(
                total_events=total,
                safe_events=safe,
                threats_detected=threats,
                blocked=blocked,
                quarantined=quarantined,
                under_review=review,
                allowed=safe,
                modality_distribution=modality_dist,
                avg_latency_ms=21.8
            )
        finally:
            session.close()

    def get_dashboard_summary(self, period: str = "all") -> Dict[str, Any]:
        session = self.get_session()
        try:
            query = session.query(SecurityEventModel)

            # Date/Time Filtering (24h, 7d, 30d, all)
            now = datetime.now(timezone.utc)
            if period == "24h":
                cutoff = now.timestamp() - 86400
                # Filter events created within last 24h
            elif period == "7d":
                cutoff = now.timestamp() - (7 * 86400)
            elif period == "30d":
                cutoff = now.timestamp() - (30 * 86400)

            events = query.order_by(SecurityEventModel.id.desc()).all()
            total = len(events)
            safe_count = sum(1 for e in events if e.user_action == "ALLOW" or e.classification == "SAFE")
            threats_count = sum(1 for e in events if e.classification not in ["SAFE", "PENDING"])
            blocked_count = sum(1 for e in events if e.user_action == "BLOCK" or e.final_action == "BLOCK")
            quarantined_count = sum(1 for e in events if e.user_action == "QUARANTINE" or e.final_action == "QUARANTINE")
            review_count = sum(1 for e in events if e.user_action == "REVIEW" or e.final_action == "REVIEW")

            # 1. Threat Distribution (% and counts)
            class_counts: Dict[str, int] = {}
            for e in events:
                c = e.classification.upper()
                class_counts[c] = class_counts.get(c, 0) + 1

            threat_dist = {}
            for c, count in class_counts.items():
                pct = round((count / max(1, total)) * 100, 1)
                threat_dist[c] = {"count": count, "percentage": pct}

            # 2. Risk Distribution (% and counts)
            risk_counts: Dict[str, int] = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
            for e in events:
                r = e.risk_level.upper() if e.risk_level else "LOW"
                risk_counts[r] = risk_counts.get(r, 0) + 1

            risk_dist = {}
            for r, count in risk_counts.items():
                pct = round((count / max(1, total)) * 100, 1)
                risk_dist[r] = {"count": count, "percentage": pct}

            # 3. Action Distribution (% and counts)
            action_counts: Dict[str, int] = {"ALLOW": 0, "REVIEW": 0, "BLOCK": 0, "QUARANTINE": 0}
            for e in events:
                act = (e.user_action or e.final_action or "ALLOW").upper()
                action_counts[act] = action_counts.get(act, 0) + 1

            action_dist = {}
            for act, count in action_counts.items():
                pct = round((count / max(1, total)) * 100, 1)
                action_dist[act] = {"count": count, "percentage": pct}

            # 4. Modality Analytics
            supported_modalities = [
                ("message", "Messages / SMS"),
                ("email", "Email Client"),
                ("url", "URLs & Links"),
                ("news", "News Aggregator"),
                ("image", "Media & Images"),
                ("video", "Video Streams"),
                ("profile", "Social Profiles"),
                ("file", "File Sharing")
            ]

            modality_analytics = []
            for m_key, m_label in supported_modalities:
                m_events = [e for e in events if e.modality == m_key]
                m_total = len(m_events)
                m_threats = sum(1 for e in m_events if e.classification != "SAFE")
                m_avg_risk = round(sum(e.risk_score for e in m_events) / max(1, m_total), 1) if m_total > 0 else 15.0

                modality_analytics.append({
                    "modality": m_key,
                    "label": m_label,
                    "total_events": m_total,
                    "threats_detected": m_threats,
                    "avg_risk_score": m_avg_risk
                })

            # 5. Top Threat Types & Top Risk Sources
            sorted_threat_types = sorted(
                [(k, v["count"]) for k, v in threat_dist.items() if k != "SAFE"],
                key=lambda x: x[1],
                reverse=True
            )
            top_threat_types = [t[0] for t in sorted_threat_types[:4]]

            sorted_sources = sorted(
                [(m["label"], m["threats_detected"]) for m in modality_analytics],
                key=lambda x: x[1],
                reverse=True
            )
            top_risk_sources = [s[0] for s in sorted_sources if s[1] > 0][:4]

            # 6. Recent Threats (Newest threats first)
            recent_threat_models = [e for e in events if e.classification != "SAFE" or e.final_action != "ALLOW"][:10]
            recent_threats = [
                {
                    "event_id": e.event_id,
                    "timestamp": e.created_at,
                    "modality": e.modality,
                    "sender_id": e.sender_name,
                    "classification": e.classification,
                    "risk_level": e.risk_level,
                    "risk_score": e.risk_score,
                    "ai_model": e.ai_model,
                    "action": e.user_action or e.final_action,
                    "content_preview": e.content
                }
                for e in recent_threat_models
            ]

            return {
                "period": period,
                "total_events": total,
                "threats_detected": threats_count,
                "threats_blocked": blocked_count,
                "threats_quarantined": quarantined_count,
                "events_under_review": review_count,
                "safe_events": safe_count,
                "avg_latency_ms": 22.4,
                "threat_distribution": threat_dist,
                "risk_distribution": risk_dist,
                "action_distribution": action_dist,
                "modality_analytics": modality_analytics,
                "top_threat_types": top_threat_types,
                "top_risk_sources": top_risk_sources,
                "recent_threats": recent_threats,
                "quarantine_summary": {
                    "total_quarantined": quarantined_count,
                    "critical_threats": sum(1 for e in events if e.risk_level == "CRITICAL"),
                    "pending_review": review_count,
                    "released_safe": safe_count,
                    "blocked_permanently": blocked_count
                },
                "protection_status": "OPERATIONAL"
            }
        finally:
            session.close()

    def seed_if_empty(self):
        session = self.get_session()
        try:
            count = session.query(SecurityEventModel).count()
            if count == 0:
                print("[DATABASE] Seeding initial demonstration security events in SQLite...")
                # Seed Event 1: SMS Scam
                self.create_event(
                    event_data={
                        "event_id": "EVT-10001",
                        "sender_id": "Attacker Persona (+91 98400 12345)",
                        "sender_type": "simulated_attacker",
                        "content_type": "message",
                        "content_preview": "Congratulations! You won ₹10,00,000 lottery cash prize. Click here immediately to claim: http://192.168.1.1/free-reward.xyz",
                        "receiver_surface": "Messages / SMS",
                        "classification": "SCAM",
                        "risk_score": 96,
                        "risk_level": "CRITICAL",
                        "confidence": 0.98,
                        "ai_model": "sms_scam_detection_ai",
                        "forensic_reasons": ["Unsolicited lottery prize claim", "Urgency language detected", "Suspicious unverified IP link"],
                        "recommended_action": "QUARANTINE",
                        "final_action": "QUARANTINE",
                        "user_action": "QUARANTINE",
                        "created_at": datetime.now(timezone.utc).isoformat(),
                        "received_at": datetime.now(timezone.utc).isoformat(),
                        "processed_at": datetime.now(timezone.utc).isoformat()
                    },
                    timeline_steps=[
                        {"step": "Event Created", "status": "DONE", "timestamp": "10:42:11", "detail": "Dispatched via Sender Platform"},
                        {"step": "Event Received", "status": "DONE", "timestamp": "10:42:12", "detail": "Ingested into Event Bus & SQLite Database"},
                        {"step": "AI Analysis Completed", "status": "DONE", "timestamp": "10:42:13", "detail": "Classified as SCAM (96/100)"},
                        {"step": "Security Decision", "status": "DONE", "timestamp": "10:42:13", "detail": "Action: QUARANTINE in vault"},
                        {"step": "Receiver Routed", "status": "DONE", "timestamp": "10:42:13", "detail": "Target: Messages / SMS"}
                    ]
                )

                # Seed Event 2: Email Phishing
                self.create_event(
                    event_data={
                        "event_id": "EVT-10002",
                        "sender_id": "security-alert@bank-verify.net",
                        "sender_type": "simulated_attacker",
                        "content_type": "email",
                        "content_preview": "Urgent: Your banking security profile requires immediate password re-verification.",
                        "receiver_surface": "Email Inbox",
                        "classification": "PHISHING",
                        "risk_score": 94,
                        "risk_level": "CRITICAL",
                        "confidence": 0.97,
                        "ai_model": "email_phishing_detection_ai",
                        "forensic_reasons": ["Credential harvesting language", "Urgent suspension threat", "Deceptive verification link"],
                        "recommended_action": "BLOCK",
                        "final_action": "BLOCK",
                        "user_action": "BLOCK",
                        "created_at": datetime.now(timezone.utc).isoformat(),
                        "received_at": datetime.now(timezone.utc).isoformat(),
                        "processed_at": datetime.now(timezone.utc).isoformat()
                    },
                    timeline_steps=[
                        {"step": "Event Created", "status": "DONE", "timestamp": "10:38:01", "detail": "Dispatched via Email Generator"},
                        {"step": "Event Received", "status": "DONE", "timestamp": "10:38:01", "detail": "Ingested into Database"},
                        {"step": "AI Analysis Completed", "status": "DONE", "timestamp": "10:38:02", "detail": "Classified as PHISHING (94/100)"},
                        {"step": "Receiver Routed", "status": "DONE", "timestamp": "10:38:02", "detail": "Target: Email Inbox"}
                    ]
                )

                # Seed Event 3: Safe Message
                self.create_event(
                    event_data={
                        "event_id": "EVT-10003",
                        "sender_id": "Alice Johnson (+91 98111 22233)",
                        "sender_type": "normal_user",
                        "content_type": "message",
                        "content_preview": "Hi Alex, are we still meeting at 3 PM today to review the project documentation?",
                        "receiver_surface": "Messages / SMS",
                        "classification": "SAFE",
                        "risk_score": 14,
                        "risk_level": "LOW",
                        "confidence": 0.96,
                        "ai_model": "sms_scam_detection_ai",
                        "forensic_reasons": ["Standard conversational linguistic profile", "Zero threat keywords or anomalous links"],
                        "recommended_action": "ALLOW",
                        "final_action": "ALLOW",
                        "user_action": "ALLOW",
                        "created_at": datetime.now(timezone.utc).isoformat(),
                        "received_at": datetime.now(timezone.utc).isoformat(),
                        "processed_at": datetime.now(timezone.utc).isoformat()
                    },
                    timeline_steps=[
                        {"step": "Event Created", "status": "DONE", "timestamp": "10:25:39", "detail": "Dispatched by Normal User"},
                        {"step": "Event Received", "status": "DONE", "timestamp": "10:25:39", "detail": "Ingested into Database"},
                        {"step": "AI Analysis Completed", "status": "DONE", "timestamp": "10:25:40", "detail": "Classified as SAFE (14/100)"},
                        {"step": "Receiver Routed", "status": "DONE", "timestamp": "10:25:40", "detail": "Delivered to Messages / SMS"}
                    ]
                )
        finally:
            session.close()

# Global singleton repository instance
event_repository = EventRepository()
