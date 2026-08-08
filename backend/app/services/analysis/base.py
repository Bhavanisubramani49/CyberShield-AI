from abc import ABC, abstractmethod
from typing import Dict, Any, List
from pydantic import BaseModel, Field

class ThreatAnalysisResult(BaseModel):
    classification: str
    confidence: float
    risk_score: int
    risk_level: str
    indicators: List[str] = Field(default_factory=list)
    forensic_reasons: List[str] = Field(default_factory=list)
    recommended_action: str
    model_name: str
    model_version: str = "1.0.0-prototype"
    processing_time_ms: float = 0.0

class BaseThreatDetector(ABC):
    name: str = "base_detector"
    modality: str = "generic"
    version: str = "1.0.0-prototype"
    description: str = "Base threat detector interface"

    @abstractmethod
    def analyze(self, payload: Dict[str, Any], sender_type: str = "normal_user") -> ThreatAnalysisResult:
        """
        Processes modality-specific payload, extracts security features,
        calculates standardized risk score, and produces Explainable AI reasoning.
        """
        pass

    def compute_risk_tier(self, score: int) -> str:
        if score >= 85:
            return "CRITICAL"
        elif score >= 60:
            return "HIGH"
        elif score >= 30:
            return "MEDIUM"
        return "LOW"

    def compute_recommended_action(self, risk_level: str) -> str:
        if risk_level == "CRITICAL":
            return "QUARANTINE"
        elif risk_level == "HIGH":
            return "BLOCK"
        elif risk_level == "MEDIUM":
            return "REVIEW"
        return "ALLOW"
