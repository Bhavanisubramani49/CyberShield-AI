from typing import Dict, List, Any, Optional
from app.services.analysis.base import BaseThreatDetector, ThreatAnalysisResult
from app.services.analysis.message_detector import SMSScamDetector
from app.services.analysis.email_detector import EmailPhishingDetector
from app.services.analysis.url_detector import URLThreatDetector
from app.services.analysis.news_detector import FakeNewsDetector
from app.services.analysis.image_detector import ImageManipulationDetector
from app.services.analysis.video_detector import DeepfakeVideoDetector
from app.services.analysis.profile_detector import FakeProfileDetector
from app.services.analysis.file_detector import FileSecurityDetector

class ModelRegistry:
    def __init__(self):
        self._detectors: Dict[str, BaseThreatDetector] = {
            "message": SMSScamDetector(),
            "sms": SMSScamDetector(),
            "email": EmailPhishingDetector(),
            "url": URLThreatDetector(),
            "news": FakeNewsDetector(),
            "image": ImageManipulationDetector(),
            "video": DeepfakeVideoDetector(),
            "profile": FakeProfileDetector(),
            "file": FileSecurityDetector()
        }

    def get_detector(self, modality: str) -> Optional[BaseThreatDetector]:
        return self._detectors.get(modality.lower().strip())

    def list_models(self) -> List[Dict[str, Any]]:
        unique_detectors = {d.name: d for d in self._detectors.values()}
        return [
            {
                "name": detector.name,
                "modality": detector.modality,
                "version": detector.version,
                "status": "operational",
                "description": detector.description
            }
            for detector in unique_detectors.values()
        ]

    def route_and_analyze(
        self, 
        content_type: str, 
        payload: Dict[str, Any], 
        sender_type: str = "normal_user"
    ) -> ThreatAnalysisResult:
        detector = self.get_detector(content_type)
        if not detector:
            # Safe generic fallback detector
            detector = SMSScamDetector()

        return detector.analyze(payload, sender_type=sender_type)

# Global singleton model registry instance
model_registry = ModelRegistry()
