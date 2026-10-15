import time
from typing import Dict, Any, List
from app.services.analysis.base import BaseThreatDetector, ThreatAnalysisResult
from app.services.video_service import video_security_service

class DeepfakeVideoDetector(BaseThreatDetector):
    name = "deepfake_video_pipeline"
    modality = "video"
    version = "1.0.0-untrained"
    description = "Inspects temporal frame consistency, facial boundary warping artifacts, and spectral frequency anomalies across sampled frames."

    def analyze(self, payload: Dict[str, Any], sender_type: str = "normal_user") -> ThreatAnalysisResult:
        # Include sender_type in payload context
        p = dict(payload)
        if "sender_type" not in p:
            p["sender_type"] = sender_type

        pipeline_res = video_security_service.run_pipeline(p)
        return video_security_service.to_threat_analysis_result(pipeline_res)
