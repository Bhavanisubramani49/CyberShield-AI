from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from app.integrations.schemas import NormalizedEventSchema

class BasePlatformAdapter(ABC):
    platform_id: str
    name: str
    category: str
    is_simulation: bool
    description: str
    auth_requirement_note: str

    @abstractmethod
    def get_required_permissions(self) -> List[str]:
        """Returns the list of PermissionScopes required for this adapter."""
        pass

    @abstractmethod
    def get_capabilities(self) -> List[str]:
        """Returns supported capabilities e.g. ['Real-Time Stream', 'Multimodal Payloads', 'Academic Sandbox']."""
        pass

    @abstractmethod
    def get_default_status(self) -> str:
        """Returns initial connection status (e.g. AUTHORIZED_SIMULATION or NOT_CONNECTED)."""
        pass

    @abstractmethod
    def get_default_health(self) -> str:
        """Returns connection health (e.g. ONLINE or NOT_CONFIGURED)."""
        pass

    @abstractmethod
    def can_process_event(self, granted_permissions: List[str]) -> bool:
        """Enforces permission checks before ingesting or analyzing event."""
        pass

    @abstractmethod
    def normalize_event(self, raw_payload: Dict[str, Any], granted_permissions: List[str]) -> NormalizedEventSchema:
        """Transforms raw incoming platform event into standard CyberShield AI format."""
        pass
