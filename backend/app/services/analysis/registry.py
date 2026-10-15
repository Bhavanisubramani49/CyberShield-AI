import json
from pathlib import Path
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
from ml.inference.engine import ml_engine

MODELS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "ml" / "models"

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
        res = []
        for detector in unique_detectors.values():
            meta = ml_engine.get_model_info(detector.modality)
            has_meta = bool(meta)

            status = meta.get("status", "TRAINED") if has_meta else "MODEL_NOT_TRAINED"
            algorithm = meta.get("algorithm", "ML Detection Engine") if has_meta else "Pipeline Structure Ready (Awaiting Model Training)"
            metrics = meta.get("metrics", None) if has_meta else None

            res.append({
                "name": detector.name,
                "modality": detector.modality,
                "version": meta.get("version", detector.version) if has_meta else detector.version,
                "status": status,
                "type": algorithm,
                "description": detector.description,
                "accuracy": metrics.get("accuracy") if metrics else None,
                "precision": metrics.get("precision") if metrics else None,
                "recall": metrics.get("recall") if metrics else None,
                "f1_score": metrics.get("macro_f1") if metrics else None
            })
        return res

    def route_and_analyze(
        self, 
        content_type: str, 
        payload: Dict[str, Any], 
        sender_type: str = "normal_user"
    ) -> ThreatAnalysisResult:
        c_type = content_type.lower().strip()

        # ML inference for message / SMS modality
        if c_type in ["message", "sms"]:
            text = str(payload.get("text", ""))
            return ml_engine.predict_message(text, sender_type=sender_type)

        # Specialized detector for other modalities
        detector = self.get_detector(c_type)
        if not detector:
            detector = SMSScamDetector()

        return detector.analyze(payload, sender_type=sender_type)

# Global singleton model registry instance
model_registry = ModelRegistry()
