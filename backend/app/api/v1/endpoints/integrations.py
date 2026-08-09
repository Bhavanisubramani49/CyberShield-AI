from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Dict, Any, Optional
from app.integrations.schemas import (
    PlatformIntegrationSchema,
    PermissionDetailSchema,
    PermissionUpdateRequest,
    ConnectPlatformRequest,
    NormalizedEventSchema,
    IntegrationOverviewSummary
)
from app.integrations.registry import integration_registry

router = APIRouter()

@router.get("/integrations", response_model=List[PlatformIntegrationSchema], summary="List All Platform Adapters & Integration Status")
async def list_integrations():
    """
    Returns registered communication adapters (CyberShield Simulation, WhatsApp, Instagram, Facebook, Gmail, Generic Email, Generic Social).
    Clearly identifies real vs simulation integration boundaries.
    """
    return integration_registry.get_all_integrations()

@router.get("/integrations/summary", response_model=IntegrationOverviewSummary, summary="Get Integration & Adapter Health Summary")
async def get_integration_summary():
    """
    Returns high-level adapter metrics for Dashboard, Settings, and Profile integrations.
    """
    return integration_registry.get_summary()

@router.get("/integrations/{platform_id}", response_model=PlatformIntegrationSchema, summary="Get Platform Adapter Detail")
async def get_integration_detail(platform_id: str):
    """
    Retrieves detail and authorization requirement for a specific platform adapter.
    """
    item = integration_registry.get_integration(platform_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Integration platform '{platform_id}' not found")
    return item

@router.get("/integrations/{platform_id}/permissions", response_model=List[PermissionDetailSchema], summary="Get Permissions for Platform")
async def get_platform_permissions(platform_id: str):
    """
    Returns required permissions and their granted state for the specified platform.
    """
    item = integration_registry.get_integration(platform_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Integration platform '{platform_id}' not found")
    return integration_registry.get_permissions(platform_id)

@router.post("/integrations/{platform_id}/connect", response_model=PlatformIntegrationSchema, summary="Connect / Authorize Platform Adapter")
async def connect_platform(platform_id: str, req: ConnectPlatformRequest = Body(...)):
    """
    Authorizes the local CyberShield Simulation platform or explains official API requirement for third-party platforms.
    """
    try:
        return integration_registry.connect_platform(platform_id, grant_all=req.grant_all_permissions)
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.post("/integrations/{platform_id}/disconnect", response_model=PlatformIntegrationSchema, summary="Disconnect Platform Adapter")
async def disconnect_platform(platform_id: str):
    """
    Revokes platform authorization and disconnects adapter.
    """
    try:
        return integration_registry.disconnect_platform(platform_id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.post("/integrations/{platform_id}/permissions", response_model=PlatformIntegrationSchema, summary="Update Platform Permissions")
async def update_platform_permissions(platform_id: str, req: PermissionUpdateRequest = Body(...)):
    """
    Updates granted permission scopes for the target platform adapter in SQLite.
    """
    try:
        return integration_registry.update_permissions(platform_id, req.granted_permissions)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.post("/integrations/normalize-event", response_model=NormalizedEventSchema, summary="Normalize Incoming Platform Event with Permission Check")
async def normalize_event(
    platform_id: str = Query(..., description="Source platform identifier"),
    payload: Dict[str, Any] = Body(...)
):
    """
    Validates permissions and transforms raw incoming payload into standard CyberShield AI normalized event schema.
    """
    try:
        return integration_registry.normalize_and_validate(platform_id, payload)
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
