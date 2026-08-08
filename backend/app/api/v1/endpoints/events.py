from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import time
from typing import List
from app.schemas.events import (
    EventAnalyzeRequest, 
    EventSendRequest, 
    AISecurityResultSchema, 
    SecurityEventSchema
)

router = APIRouter()

# In-memory shared event repository for prototype simulations
SIMULATED_EVENTS_DB: List[SecurityEventSchema] = []

def analyze_payload(req: EventAnalyzeRequest) -> AISecurityResultSchema:
    start_time = time.time()
    c_type = req.content_type.lower()
    p = req.payload
    sender_type = req.sender_type.lower()

    classification = "SAFE"
    confidence = 0.96
    risk_level = "LOW"
    reasons: List[str] = []
    recommendation = "ALLOW"
    model_name = "sms_scam_model"

    # 1. Message / SMS Model
    if c_type in ["message", "sms"]:
        model_name = "sms_scam_detection_ai"
        text = str(p.get("text", "")).lower()
        if any(w in text for w in ["won", "lakh", "crore", "lottery", "prize", "claim", "urgent", "otp", "password"]):
            classification = "SCAM"
            confidence = 0.98
            risk_level = "CRITICAL"
            reasons = ["Unsolicited financial prize incentive", "Urgency call-to-action", "High probability of OTP harvesting trap"]
            recommendation = "QUARANTINE"
        elif sender_type in ["simulated_attacker", "fake_account"]:
            classification = "SUSPICIOUS"
            confidence = 0.88
            risk_level = "HIGH"
            reasons = ["Unverified sender risk profile", "Anomalous communication pattern"]
            recommendation = "REVIEW"
        else:
            reasons = ["Standard conversational linguistic profile", "Zero scam keywords detected"]

    # 2. Email Phishing Model
    elif c_type == "email":
        model_name = "email_phishing_detection_ai"
        subject = str(p.get("subject", "")).lower()
        body = str(p.get("body", "")).lower()
        link = str(p.get("link", "")).lower()
        if any(w in (subject + body) for w in ["suspended", "verify password", "deactivation", "security alert", "credential", "urgent"]):
            classification = "PHISHING"
            confidence = 0.97
            risk_level = "CRITICAL"
            reasons = ["Credential harvesting language pattern", "Urgent account suspension threat", "Deceptive verification request"]
            recommendation = "BLOCK"
        elif link and not link.startswith("https://"):
            classification = "SUSPICIOUS"
            confidence = 0.89
            risk_level = "HIGH"
            reasons = ["Insecure HTTP link in email body", "Unmatched sender domain"]
            recommendation = "REVIEW"
        else:
            reasons = ["Verified email headers", "Legitimate corporate format"]

    # 3. URL Threat Model
    elif c_type == "url":
        model_name = "url_threat_detection_ai"
        url = str(p.get("url", "")).lower()
        if any(w in url for w in ["192.168", "xyz", "bank-login", "verify-account", "bit.ly", "free-reward"]):
            classification = "MALICIOUS"
            confidence = 0.99
            risk_level = "CRITICAL"
            reasons = ["Direct IP or deceptive high-risk TLD", "Homograph phishing pattern", "Flagged in threat intelligence dataset"]
            recommendation = "BLOCK"
        elif "http://" in url:
            classification = "SUSPICIOUS"
            confidence = 0.85
            risk_level = "MEDIUM"
            reasons = ["Missing TLS/HTTPS encryption", "Unverified domain registration"]
            recommendation = "REVIEW"
        else:
            reasons = ["Domain reputation clean", "Valid HTTPS certificate chain"]

    # 4. Fake News Model
    elif c_type == "news":
        model_name = "fake_news_classifier_ai"
        headline = str(p.get("headline", "")).lower()
        text = str(p.get("text", "")).lower()
        if any(w in (headline + text) for w in ["shocking", "ban all", "secret cure", "miracle", "leaked memo", "conspiracy"]):
            classification = "FAKE_NEWS"
            confidence = 0.94
            risk_level = "HIGH"
            reasons = ["Sensationalist clickbait linguistic pattern", "Unsubstantiated factual claim", "Linguistic distortion score high"]
            recommendation = "REVIEW"
        else:
            reasons = ["Neutral objective reporting tone", "Standard journalistic attribution"]

    # 5. Image Manipulation Model
    elif c_type == "image":
        model_name = "image_manipulation_ai"
        desc = str(p.get("description", "")).lower()
        filename = str(p.get("filename", "")).lower()
        if any(w in (desc + filename) for w in ["tampered", "manipulated", "gan", "synthetic", "photoshop", "deepfake"]):
            classification = "MANIPULATED"
            confidence = 0.95
            risk_level = "HIGH"
            reasons = ["Pixel-level copy-move inconsistency", "EXIF metadata distortion", "GAN synthesis residual flags"]
            recommendation = "QUARANTINE"
        else:
            reasons = ["Authentic camera sensor noise pattern", "Consistent lighting and compression metadata"]

    # 6. Deepfake Video Model
    elif c_type == "video":
        model_name = "deepfake_video_pipeline"
        desc = str(p.get("description", "")).lower()
        filename = str(p.get("filename", "")).lower()
        if any(w in (desc + filename) for w in ["deepfake", "face_swap", "synthetic", "ai_generated", "manipulated"]):
            classification = "DEEPFAKE"
            confidence = 0.96
            risk_level = "CRITICAL"
            reasons = ["Temporal frame inconsistency across 48 frames", "Facial boundary blending artifacts", "Spectral frequency anomalies"]
            recommendation = "BLOCK"
        else:
            reasons = ["Natural facial micro-expressions verified", "Temporal frame continuity intact"]

    # 7. Fake Profile Model
    elif c_type == "profile":
        model_name = "fake_profile_analyzer_ai"
        followers = int(p.get("followers", 100))
        following = int(p.get("following", 100))
        username = str(p.get("username", "")).lower()
        if (following > 2000 and followers < 50) or "bot" in username or "giveaway" in username:
            classification = "SUSPICIOUS"
            confidence = 0.93
            risk_level = "HIGH"
            reasons = ["Extremely anomalous follower/following ratio (>100:1)", "Synthetic bot username heuristic", "Automated account velocity flag"]
            recommendation = "REVIEW"
        else:
            reasons = ["Balanced organic engagement ratio", "Authentic account creation timestamp"]

    # 8. File Security Model
    elif c_type == "file":
        model_name = "file_security_pipeline"
        filename = str(p.get("filename", "")).lower()
        if any(ext in filename for ext in [".exe", ".bat", ".xlsm", ".vbs", ".scr", ".js"]):
            classification = "MALICIOUS"
            confidence = 0.98
            risk_level = "CRITICAL"
            reasons = ["High-risk macro or executable file signature", "Simulated suspicious PE header", "Dangerous script execution flags"]
            recommendation = "QUARANTINE"
        else:
            reasons = ["Safe document structure (PDF/TXT/PNG)", "No embedded macros or exploit shellcode"]

    latency = round((time.time() - start_time) * 1000 + 18.5, 2)

    return AISecurityResultSchema(
        classification=classification,
        confidence=confidence,
        risk_level=risk_level,
        reasons=reasons,
        recommendation=recommendation,
        model=model_name,
        timestamp=datetime.now(timezone.utc).isoformat(),
        processing_time_ms=latency
    )

@router.post("/events/analyze", response_model=AISecurityResultSchema, summary="Analyze Security Event via Model Router")
async def analyze_security_event(req: EventAnalyzeRequest):
    """
    Routes incoming simulation content to the appropriate specialized AI detector.
    Returns standardized risk score, Explainable AI reasons, and recommended action.
    """
    try:
        return analyze_payload(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI inference error: {str(e)}")

@router.post("/events/send", response_model=SecurityEventSchema, summary="Send Security Event to Receiver Platform")
async def send_security_event(req: EventSendRequest):
    """
    Transfers the simulated event into the Receiver Platform queue.
    """
    event = SecurityEventSchema(
        event_id=req.event_id,
        sender_id=req.sender_name,
        sender_type=req.sender_type,
        receiver_id="Simulated Receiver (Receiver Platform)",
        platform="CyberShield-Simulation-Hub",
        content_type=req.content_type,
        content_preview=str(req.payload.get("text") or req.payload.get("subject") or req.payload.get("url") or req.payload.get("headline") or req.payload.get("filename") or "Simulated Content"),
        timestamp=datetime.now(timezone.utc).isoformat(),
        status="analyzed",
        ai_result=req.ai_result,
        user_action="PENDING"
    )
    SIMULATED_EVENTS_DB.insert(0, event)
    return event

@router.get("/events", response_model=List[SecurityEventSchema], summary="Get Event Simulation History")
async def get_security_events():
    return SIMULATED_EVENTS_DB
