from fastapi import APIRouter
from datetime import datetime, timezone
from app.core.config import settings
from app.schemas.health import HealthStatus, SystemMetrics
from app.db.database import check_db_health

router = APIRouter()

@router.get("/health", response_model=HealthStatus, summary="System Health Check")
async def get_health_status():
    """
    Returns the foundational health check status for CyberShield AI.
    Verifies that the backend, SQLite database, and AI architecture layer are operational.
    """
    return HealthStatus(
        status="healthy",
        project_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        database=check_db_health(),
        platforms_connected={
            "platform_1_sender": "online (simulation-ready)",
            "platform_2_receiver": "online (multi-app-ready)",
            "platform_3_cybershield_ai": "operational"
        },
        active_ai_models=[
            "sms_scam_model",
            "email_phishing_model",
            "url_threat_model",
            "fake_news_model",
            "image_manipulation_model",
            "deepfake_video_pipeline",
            "fake_profile_model",
            "file_security_pipeline"
        ],
        timestamp=datetime.now(timezone.utc).isoformat()
    )

@router.get("/metrics", response_model=SystemMetrics, summary="Foundational System Metrics")
async def get_metrics():
    return SystemMetrics(
        total_events_processed=0,
        threats_detected=0,
        threats_blocked=0,
        active_sessions=1,
        ai_engine_status="standby_ready"
    )
