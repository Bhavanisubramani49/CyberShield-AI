from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.analysis import model_registry

router = APIRouter()

@router.get("/ai/models", summary="List Registered CyberShield AI Threat Detection Models")
async def list_ai_models() -> List[Dict[str, Any]]:
    """
    Exposes the 8 registered multimodal threat detection engines,
    their supported modalities, version signatures, operational status, and descriptions.
    """
    return model_registry.list_models()
