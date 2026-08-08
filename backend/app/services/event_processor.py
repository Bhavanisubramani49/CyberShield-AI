import time
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.schemas.events import (
    EventAnalyzeRequest,
    EventSendRequest,
    AISecurityResultSchema,
    SecurityEventSchema,
    TimelineStepSchema,
    EventStatsSchema
)
from app.db.repository import event_repository
from app.services.analysis import model_registry

class EventProcessorService:
    def __init__(self):
        self._counter = 10080

    def _generate_event_id(self) -> str:
        eid = f"EVT-{self._counter}"
        self._counter += 1
        return eid

    def route_receiver_surface(self, content_type: str) -> str:
        mapping = {
            "message": "Messages / SMS",
            "sms": "Messages / SMS",
            "email": "Email Inbox",
            "url": "URLs & Links",
            "news": "News Feed",
            "image": "Media & Images",
            "video": "Videos",
            "profile": "Social Feed",
            "file": "File Security"
        }
        return mapping.get(content_type.lower(), "Instant Alerts")

    def analyze_payload(self, req: EventAnalyzeRequest) -> AISecurityResultSchema:
        res = model_registry.route_and_analyze(
            content_type=req.content_type,
            payload=req.payload,
            sender_type=req.sender_type
        )
        return AISecurityResultSchema(
            classification=res.classification,
            confidence=res.confidence,
            risk_score=res.risk_score,
            risk_level=res.risk_level,
            reasons=res.forensic_reasons,
            recommendation=res.recommended_action,
            model=res.model_name,
            timestamp=datetime.now(timezone.utc).isoformat(),
            processing_time_ms=res.processing_time_ms
        )

    def process_and_store_event(
        self,
        event_id: Optional[str] = None,
        content_type: str = "message",
        sender_type: str = "simulated_attacker",
        sender_name: str = "Simulated Sender",
        payload: Dict[str, Any] = None,
        ai_result: Optional[AISecurityResultSchema] = None,
        user_action_override: Optional[str] = None
    ) -> SecurityEventSchema:
        if not event_id:
            event_id = self._generate_event_id()

        payload = payload or {}
        now_iso = datetime.now(timezone.utc).isoformat()
        now_time = datetime.now().strftime("%H:%M:%S")

        # Run AI analysis via Model Registry if not pre-computed
        if not ai_result:
            req = EventAnalyzeRequest(
                content_type=content_type,
                sender_type=sender_type,
                sender_name=sender_name,
                payload=payload
            )
            ai_result = self.analyze_payload(req)

        receiver_surface = self.route_receiver_surface(content_type)
        final_action = user_action_override or ai_result.recommendation
        
        timeline_steps = [
            {"step": "Event Created", "status": "DONE", "timestamp": now_time, "detail": "Dispatched in Sender Platform"},
            {"step": "Event Received", "status": "DONE", "timestamp": now_time, "detail": "Ingested into SQLite Database"},
            {"step": "AI Analysis Started", "status": "DONE", "timestamp": now_time, "detail": f"Routed to {ai_result.model}"},
            {"step": "AI Analysis Completed", "status": "DONE", "timestamp": now_time, "detail": f"Classification: {ai_result.classification} ({ai_result.risk_score}/100)"},
            {"step": "Security Decision", "status": "DONE", "timestamp": now_time, "detail": f"Action: {ai_result.recommendation}"},
            {"step": "Receiver Routed", "status": "DONE", "timestamp": now_time, "detail": f"Target: {receiver_surface}"}
        ]

        content_preview = str(
            payload.get("text") or 
            payload.get("subject") or 
            payload.get("url") or 
            payload.get("headline") or 
            payload.get("filename") or 
            payload.get("username") or 
            "Simulated Content"
        )

        event_dict = {
            "event_id": event_id,
            "sender_id": sender_name,
            "sender_type": sender_type,
            "receiver_surface": receiver_surface,
            "content_type": content_type,
            "content_preview": content_preview,
            "content_reference": payload.get("link") or payload.get("url"),
            "status": "analyzed",
            "classification": ai_result.classification,
            "risk_score": ai_result.risk_score,
            "risk_level": ai_result.risk_level,
            "confidence": ai_result.confidence,
            "ai_model": ai_result.model,
            "forensic_reasons": ai_result.reasons,
            "recommended_action": ai_result.recommendation,
            "final_action": final_action,
            "user_action": final_action,
            "created_at": now_iso,
            "received_at": now_iso,
            "processed_at": now_iso
        }

        # Store permanently via Repository layer
        return event_repository.create_event(event_dict, timeline_steps)

    def get_all_events(
        self,
        modality: Optional[str] = None,
        risk_level: Optional[str] = None,
        action: Optional[str] = None,
        classification: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        date_filter: Optional[str] = None,
        sort_by: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> List[SecurityEventSchema]:
        return event_repository.get_events(
            modality=modality,
            risk_level=risk_level,
            action=action,
            classification=classification,
            status=status,
            search=search,
            date_filter=date_filter,
            sort_by=sort_by,
            page=page,
            limit=limit
        )

    def count_events(
        self,
        modality: Optional[str] = None,
        risk_level: Optional[str] = None,
        action: Optional[str] = None,
        classification: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        date_filter: Optional[str] = None
    ) -> int:
        return event_repository.count_events(
            modality=modality,
            risk_level=risk_level,
            action=action,
            classification=classification,
            status=status,
            search=search,
            date_filter=date_filter
        )

    def get_event_by_id(self, event_id: str) -> Optional[SecurityEventSchema]:
        return event_repository.get_event(event_id)

    def update_event_action(self, event_id: str, new_action: str, actor: str = "Authenticated Security Officer") -> Optional[SecurityEventSchema]:
        return event_repository.update_event_action(event_id, new_action, actor)

    def delete_event(self, event_id: str) -> bool:
        return event_repository.delete_event(event_id)

    def get_event_stats(self) -> EventStatsSchema:
        return event_repository.get_statistics()

# Global singleton service instance
event_processor_service = EventProcessorService()
