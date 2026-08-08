from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.analysis import model_registry
from ml.datasets_service import get_datasets_manifest

router = APIRouter()

@router.get("/ai/models", summary="List Registered CyberShield AI Threat Detection Models & Status")
async def list_ai_models() -> List[Dict[str, Any]]:
    """
    Exposes the 8 registered multimodal threat detection engines,
    their supported modalities, version signatures, operational/trained status, ML algorithms, and evaluation metrics.
    """
    return model_registry.list_models()

@router.get("/ai/datasets", summary="List Synthetic Threat Datasets & Validation Manifest")
async def list_datasets() -> List[Dict[str, Any]]:
    """
    Returns the synthetic dataset validation summary, total rows, target classes,
    and associated model evaluation metrics.
    """
    return get_datasets_manifest()
