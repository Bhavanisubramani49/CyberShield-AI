from typing import List, Dict, Any
from datetime import datetime, timezone
from app.integrations.base import BasePlatformAdapter
from app.integrations.permissions import PermissionScope, IntegrationStatus, ConnectionHealth
from app.integrations.schemas import NormalizedEventSchema

class CyberShieldSimulationAdapter(BasePlatformAdapter):
    platform_id = "simulation"
    name = "CyberShield Simulation Platform"
    category = "Academic Sandbox & Threat Hub"
    is_simulation = True
    description = "Controlled local academic security testbed connecting Sender Platform, Multimodal AI Engine, and Receiver Platform surfaces."
    auth_requirement_note = "Pre-configured and authorized for academic security research within the safe sandbox environment."

    def get_required_permissions(self) -> List[str]:
        return [
            PermissionScope.READ_MESSAGES.value,
            PermissionScope.READ_EMAIL.value,
            PermissionScope.READ_URLS.value,
            PermissionScope.READ_MEDIA.value,
            PermissionScope.READ_PROFILES.value,
            PermissionScope.READ_FILES.value,
            PermissionScope.RECEIVE_EVENTS.value,
            PermissionScope.ANALYZE_CONTENT.value,
            PermissionScope.SEND_SIMULATION.value,
            PermissionScope.MANAGE_SECURITY_ACTIONS.value
        ]

    def get_capabilities(self) -> List[str]:
        return [
            "8-Modality Attack Payloads",
            "Real-Time SSE Bus Ingestion",
            "Direct Multimodal AI Routing",
            "Multi-App Receiver Surfaces",
            "Instant Containment Decisions"
        ]

    def get_default_status(self) -> str:
        return IntegrationStatus.AUTHORIZED_SIMULATION.value

    def get_default_health(self) -> str:
        return ConnectionHealth.ONLINE.value

    def can_process_event(self, granted_permissions: List[str]) -> bool:
        # Requires at least RECEIVE_EVENTS and ANALYZE_CONTENT
        has_recv = PermissionScope.RECEIVE_EVENTS.value in granted_permissions
        has_ai = PermissionScope.ANALYZE_CONTENT.value in granted_permissions
        return has_recv and has_ai

    def normalize_event(self, raw_payload: Dict[str, Any], granted_permissions: List[str]) -> NormalizedEventSchema:
        if not self.can_process_event(granted_permissions):
            raise PermissionError("Permission Denied: Simulation Adapter lacks required RECEIVE_EVENTS or ANALYZE_CONTENT permission.")

        now_iso = datetime.now(timezone.utc).isoformat()
        eid = raw_payload.get("event_id") or f"EVT-SIM-{int(datetime.now().timestamp())}"
        ctype = raw_payload.get("content_type", "message")
        payload = raw_payload.get("payload", {})
        
        # Extract text or reference
        content_text = payload.get("text") or payload.get("content") or payload.get("url") or str(payload)

        return NormalizedEventSchema(
            event_id=eid,
            source_platform="CyberShield Simulation Platform",
            source_type="simulation",
            sender_name=raw_payload.get("sender_name", "Academic Test Persona"),
            content_type=ctype,
            content=content_text,
            content_reference=payload.get("url") or payload.get("file_name") or payload.get("image_name"),
            receiver_surface=raw_payload.get("receiver_surface", "Simulated Receiver Surface"),
            permissions_context=granted_permissions,
            timestamp=now_iso
        )
