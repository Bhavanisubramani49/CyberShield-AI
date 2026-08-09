from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any

class PermissionDetailSchema(BaseModel):
    scope: str
    title: str
    description: str
    is_granted: bool

class PlatformIntegrationSchema(BaseModel):
    platform_id: str
    name: str
    category: str
    status: str
    is_simulation: bool
    required_permissions: List[str]
    granted_permissions: List[str]
    capabilities: List[str]
    connection_health: str
    last_connected_at: Optional[str] = None
    created_at: str
    updated_at: str
    description: Optional[str] = None
    auth_requirement_note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PermissionUpdateRequest(BaseModel):
    granted_permissions: List[str]

class ConnectPlatformRequest(BaseModel):
    grant_all_permissions: bool = True

class NormalizedEventSchema(BaseModel):
    event_id: str
    source_platform: str
    source_type: str
    sender_name: str
    content_type: str
    content: str
    content_reference: Optional[str] = None
    receiver_surface: str
    permissions_context: List[str]
    timestamp: str

class IntegrationAuditSchema(BaseModel):
    id: Optional[int] = None
    platform_id: str
    action: str
    result: str
    details: Optional[str] = None
    timestamp: str

    model_config = ConfigDict(from_attributes=True)

class IntegrationOverviewSummary(BaseModel):
    total_adapters: int
    authorized_platforms: int
    pending_platforms: int
    disconnected_platforms: int
    active_integrations: List[PlatformIntegrationSchema]
