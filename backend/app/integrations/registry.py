import json
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import PlatformIntegrationModel, IntegrationAuditModel
from app.integrations.base import BasePlatformAdapter
from app.integrations.adapters.simulation import CyberShieldSimulationAdapter
from app.integrations.adapters.placeholder import (
    WhatsAppAdapter,
    InstagramAdapter,
    FacebookAdapter,
    GmailAdapter,
    GenericEmailAdapter,
    GenericSocialAdapter
)
from app.integrations.permissions import (
    PermissionScope,
    PERMISSION_METADATA,
    IntegrationStatus,
    ConnectionHealth
)
from app.integrations.schemas import (
    PlatformIntegrationSchema,
    PermissionDetailSchema,
    NormalizedEventSchema,
    IntegrationAuditSchema,
    IntegrationOverviewSummary
)

class IntegrationRegistry:
    def __init__(self):
        self._adapters: Dict[str, BasePlatformAdapter] = {
            "simulation": CyberShieldSimulationAdapter(),
            "whatsapp": WhatsAppAdapter(),
            "instagram": InstagramAdapter(),
            "facebook": FacebookAdapter(),
            "gmail": GmailAdapter(),
            "generic_email": GenericEmailAdapter(),
            "generic_social": GenericSocialAdapter()
        }

    def get_session(self) -> Session:
        return SessionLocal()

    def sync_database_records(self):
        """Ensures all registered adapters have persistent records in SQLite."""
        session = self.get_session()
        try:
            now_iso = datetime.now(timezone.utc).isoformat()
            for pid, adapter in self._adapters.items():
                existing = session.query(PlatformIntegrationModel).filter(PlatformIntegrationModel.platform_id == pid).first()
                if not existing:
                    default_perms = adapter.get_required_permissions() if adapter.is_simulation else []
                    model = PlatformIntegrationModel(
                        platform_id=pid,
                        name=adapter.name,
                        category=adapter.category,
                        status=adapter.get_default_status(),
                        is_simulation=1 if adapter.is_simulation else 0,
                        required_permissions=json.dumps(adapter.get_required_permissions()),
                        granted_permissions=json.dumps(default_perms),
                        capabilities=json.dumps(adapter.get_capabilities()),
                        connection_health=adapter.get_default_health(),
                        last_connected_at=now_iso if adapter.is_simulation else None,
                        created_at=now_iso,
                        updated_at=now_iso
                    )
                    session.add(model)
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def _model_to_schema(self, model: PlatformIntegrationModel) -> PlatformIntegrationSchema:
        adapter = self._adapters.get(model.platform_id)
        req_p = json.loads(model.required_permissions or "[]")
        grant_p = json.loads(model.granted_permissions or "[]")
        caps = json.loads(model.capabilities or "[]")
        return PlatformIntegrationSchema(
            platform_id=model.platform_id,
            name=model.name,
            category=model.category,
            status=model.status,
            is_simulation=bool(model.is_simulation),
            required_permissions=req_p,
            granted_permissions=grant_p,
            capabilities=caps,
            connection_health=model.connection_health,
            last_connected_at=model.last_connected_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
            description=adapter.description if adapter else None,
            auth_requirement_note=adapter.auth_requirement_note if adapter else None
        )

    def get_all_integrations(self) -> List[PlatformIntegrationSchema]:
        self.sync_database_records()
        session = self.get_session()
        try:
            models = session.query(PlatformIntegrationModel).order_by(PlatformIntegrationModel.id.asc()).all()
            return [self._model_to_schema(m) for m in models]
        finally:
            session.close()

    def get_integration(self, platform_id: str) -> Optional[PlatformIntegrationSchema]:
        self.sync_database_records()
        session = self.get_session()
        try:
            model = session.query(PlatformIntegrationModel).filter(PlatformIntegrationModel.platform_id == platform_id).first()
            return self._model_to_schema(model) if model else None
        finally:
            session.close()

    def get_permissions(self, platform_id: str) -> List[PermissionDetailSchema]:
        item = self.get_integration(platform_id)
        if not item:
            return []
        
        result = []
        for scope in item.required_permissions:
            meta = PERMISSION_METADATA.get(scope, {"title": scope, "description": "Platform permission scope."})
            is_granted = scope in item.granted_permissions
            result.append(PermissionDetailSchema(
                scope=scope,
                title=meta["title"],
                description=meta["description"],
                is_granted=is_granted
            ))
        return result

    def log_audit(self, platform_id: str, action: str, result: str = "SUCCESS", details: Optional[str] = None):
        session = self.get_session()
        try:
            now_iso = datetime.now(timezone.utc).isoformat()
            audit = IntegrationAuditModel(
                platform_id=platform_id,
                action=action,
                result=result,
                details=details,
                timestamp=now_iso
            )
            session.add(audit)
            session.commit()
        except Exception:
            session.rollback()
        finally:
            session.close()

    def connect_platform(self, platform_id: str, grant_all: bool = True) -> PlatformIntegrationSchema:
        session = self.get_session()
        try:
            model = session.query(PlatformIntegrationModel).filter(PlatformIntegrationModel.platform_id == platform_id).first()
            if not model:
                raise ValueError(f"Unknown platform '{platform_id}'")

            adapter = self._adapters.get(platform_id)
            now_iso = datetime.now(timezone.utc).isoformat()

            if model.is_simulation:
                # Controlled simulation platform authorization
                req_p = json.loads(model.required_permissions or "[]")
                model.status = IntegrationStatus.AUTHORIZED_SIMULATION.value
                model.connection_health = ConnectionHealth.ONLINE.value
                model.granted_permissions = json.dumps(req_p if grant_all else [])
                model.last_connected_at = now_iso
                model.updated_at = now_iso
                session.commit()
                session.refresh(model)
                self.log_audit(platform_id, "CONNECT", "SUCCESS", "Local sandbox simulation authorized and connected.")
                return self._model_to_schema(model)
            else:
                # Third-party platform: cannot fake real OAuth connection
                model.status = IntegrationStatus.NOT_CONNECTED.value
                model.connection_health = ConnectionHealth.NOT_CONFIGURED.value
                model.updated_at = now_iso
                session.commit()
                self.log_audit(platform_id, "CONNECT_ATTEMPT", "REQUIRED_OAUTH", "Real OAuth integration requires official API credentials.")
                raise PermissionError(f"Direct connection to {model.name} is not configured. Official platform API credentials and explicit user authorization are required.")
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def disconnect_platform(self, platform_id: str) -> PlatformIntegrationSchema:
        session = self.get_session()
        try:
            model = session.query(PlatformIntegrationModel).filter(PlatformIntegrationModel.platform_id == platform_id).first()
            if not model:
                raise ValueError(f"Unknown platform '{platform_id}'")

            now_iso = datetime.now(timezone.utc).isoformat()
            model.status = IntegrationStatus.REVOKED.value if model.is_simulation else IntegrationStatus.NOT_CONNECTED.value
            model.connection_health = ConnectionHealth.OFFLINE.value
            model.granted_permissions = json.dumps([])
            model.updated_at = now_iso
            session.commit()
            session.refresh(model)

            self.log_audit(platform_id, "DISCONNECT", "SUCCESS", "Platform disconnected and permissions revoked.")
            return self._model_to_schema(model)
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def update_permissions(self, platform_id: str, granted_permissions: List[str]) -> PlatformIntegrationSchema:
        session = self.get_session()
        try:
            model = session.query(PlatformIntegrationModel).filter(PlatformIntegrationModel.platform_id == platform_id).first()
            if not model:
                raise ValueError(f"Unknown platform '{platform_id}'")

            now_iso = datetime.now(timezone.utc).isoformat()
            req_p = json.loads(model.required_permissions or "[]")
            valid_grants = [p for p in granted_permissions if p in req_p]

            model.granted_permissions = json.dumps(valid_grants)
            model.updated_at = now_iso

            if model.is_simulation:
                if len(valid_grants) == 0:
                    model.status = IntegrationStatus.REVOKED.value
                    model.connection_health = ConnectionHealth.RESTRICTED.value
                else:
                    model.status = IntegrationStatus.AUTHORIZED_SIMULATION.value
                    model.connection_health = ConnectionHealth.ONLINE.value

            session.commit()
            session.refresh(model)

            self.log_audit(platform_id, "PERMISSION_UPDATE", "SUCCESS", f"Granted: {len(valid_grants)} / {len(req_p)} permissions.")
            return self._model_to_schema(model)
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def normalize_and_validate(self, platform_id: str, raw_payload: Dict[str, Any]) -> NormalizedEventSchema:
        adapter = self._adapters.get(platform_id)
        if not adapter:
            self.log_audit(platform_id, "EVENT_REJECTED", "ERROR", f"Unregistered adapter '{platform_id}'.")
            raise ValueError(f"Unregistered platform adapter: '{platform_id}'")

        item = self.get_integration(platform_id)
        granted = item.granted_permissions if item else []

        if not item or item.status not in [IntegrationStatus.AUTHORIZED_SIMULATION.value, IntegrationStatus.AUTHORIZED.value]:
            self.log_audit(platform_id, "EVENT_REJECTED", "DENIED", "Platform is not authorized or connected.")
            raise PermissionError(f"Permission Denied: Platform '{platform_id}' is not in AUTHORIZED status.")

        try:
            normalized = adapter.normalize_event(raw_payload, granted)
            self.log_audit(platform_id, "EVENT_RECEIVED", "SUCCESS", f"Normalized event {normalized.event_id}")
            return normalized
        except Exception as e:
            self.log_audit(platform_id, "EVENT_REJECTED", "ERROR", str(e))
            raise

    def get_summary(self) -> IntegrationOverviewSummary:
        integrations = self.get_all_integrations()
        auth_count = sum(1 for i in integrations if i.status in [IntegrationStatus.AUTHORIZED_SIMULATION.value, IntegrationStatus.AUTHORIZED.value])
        pending_count = sum(1 for i in integrations if i.status == IntegrationStatus.PENDING.value)
        disc_count = sum(1 for i in integrations if i.status in [IntegrationStatus.NOT_CONNECTED.value, IntegrationStatus.REVOKED.value, IntegrationStatus.DENIED.value])
        return IntegrationOverviewSummary(
            total_adapters=len(integrations),
            authorized_platforms=auth_count,
            pending_platforms=pending_count,
            disconnected_platforms=disc_count,
            active_integrations=integrations
        )

# Global Singleton Registry
integration_registry = IntegrationRegistry()
