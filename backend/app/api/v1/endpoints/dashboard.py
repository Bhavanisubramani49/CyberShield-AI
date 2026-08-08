from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
from app.db.repository import event_repository
from app.services.analysis import model_registry

router = APIRouter()

@router.get("/dashboard/summary", summary="Consolidated Real-Time CyberShield Security Dashboard Analytics")
async def get_dashboard_summary(
    period: Optional[str] = Query("all", description="Period filter: 24h, 7d, 30d, all")
) -> Dict[str, Any]:
    """
    Returns consolidated aggregate metrics calculated directly from persistent SQLite database:
    - Total Events Inspected, Threats Detected, Blocked, Quarantined, Under Review, Safe
    - Threat Distribution (%) and Counts by Classification
    - Risk Tier Breakdown (Low, Med, High, Crit)
    - Action Distribution (Allow, Review, Block, Quarantine)
    - Modality Analytics for all 8 supported channels
    - AI Model Performance Metrics (Accuracy, Precision, Recall, F1, Latency)
    - Top Threat Types and Risk Sources
    - Quarantine Summary and Real-Time Protection Status
    """
    summary = event_repository.get_dashboard_summary(period=period or "all")
    # Attach model registry information
    summary["ai_model_performance"] = model_registry.list_models()
    return summary
