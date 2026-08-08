from pydantic import BaseModel
from typing import Dict, Any, List

class HealthStatus(BaseModel):
    status: str
    project_name: str
    version: str
    environment: str
    platforms_connected: Dict[str, str]
    active_ai_models: List[str]
    timestamp: str

class SystemMetrics(BaseModel):
    total_events_processed: int
    threats_detected: int
    threats_blocked: int
    active_sessions: int
    ai_engine_status: str
