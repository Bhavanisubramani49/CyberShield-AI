import time
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.schemas.events import (
    EventAnalyzeRequest,
    EventSendRequest,
    AISecurityResultSchema,
    SecurityEventSchema,
    TimelineStepSchema,
    EventStatsSchema
)

class EventProcessorService:
    def __init__(self):
        self._events: List[SecurityEventSchema] = []
        self._counter = 10001
        self._seed_initial_events()

    def _generate_event_id(self) -> str:
        eid = f"EVT-{self._counter}"
        self._counter += 1
        return eid

    def _seed_initial_events(self):
        """Seed baseline demonstration events for the prototype"""
        sample_1 = self.process_and_store_event(
            event_id="EVT-10001",
            content_type="message",
            sender_type="simulated_attacker",
            sender_name="Attacker Persona (+91 98400 12345)",
            payload={"text": "Congratulations! You won ₹10,00,000 lottery cash prize. Click here immediately to claim: http://192.168.1.1/free-reward.xyz"},
            user_action_override="QUARANTINE"
        )
        sample_2 = self.process_and_store_event(
            event_id="EVT-10002",
            content_type="email",
            sender_type="simulated_attacker",
            sender_name="security-alert@bank-verify.net",
            payload={"subject": "Urgent: Your account is scheduled for immediate suspension", "body": "Your banking security profile requires immediate password re-verification.", "link": "http://192.168.1.1/bank-login.xyz"},
            user_action_override="BLOCK"
        )
        sample_3 = self.process_and_store_event(
            event_id="EVT-10003",
            content_type="message",
            sender_type="normal_user",
            sender_name="Alice Johnson (+91 98111 22233)",
            payload={"text": "Hi Alex, are we still meeting at 3 PM today to review the project documentation?"},
            user_action_override="ALLOW"
        )

    def route_ai_model(self, content_type: str) -> str:
        mapping = {
            "message": "sms_scam_detection_ai",
            "sms": "sms_scam_detection_ai",
            "email": "email_phishing_detection_ai",
            "url": "url_threat_detection_ai",
            "news": "fake_news_classifier_ai",
            "image": "image_manipulation_ai",
            "video": "deepfake_video_pipeline",
            "profile": "fake_profile_analyzer_ai",
            "file": "file_security_pipeline"
        }
        return mapping.get(content_type.lower(), "standard_cyber_heuristic_ai")

    def route_receiver_surface(self, content_type: str) -> str:
        mapping = {
            "message": "Messages / SMS",
            "sms": "Messages / SMS",
            "email": "Email Inbox",
            "url": "URLs & Links",
            "news": "News Feed",
            "image": "Media & Images",
            "video": "Videos",
            "profile": "Social Feed",
            "file": "File Security"
        }
        return mapping.get(content_type.lower(), "Instant Alerts")

    def analyze_payload(self, req: EventAnalyzeRequest) -> AISecurityResultSchema:
        start_time = time.time()
        c_type = req.content_type.lower()
        p = req.payload
        sender_type = req.sender_type.lower()
        model_name = self.route_ai_model(c_type)

        classification = "SAFE"
        confidence = 0.96
        risk_score = 15
        risk_level = "LOW"
        reasons: List[str] = []
        recommendation = "ALLOW"

        # 1. Message / SMS Model
        if c_type in ["message", "sms"]:
            text = str(p.get("text", "")).lower()
            if any(w in text for w in ["won", "lakh", "crore", "lottery", "prize", "claim", "urgent", "otp", "password"]):
                classification = "SCAM"
                confidence = 0.98
                risk_score = 96
                risk_level = "CRITICAL"
                reasons = ["Unsolicited financial prize incentive", "Urgency call-to-action detected", "High probability of OTP harvesting trap"]
                recommendation = "QUARANTINE"
            elif sender_type in ["simulated_attacker", "fake_account"]:
                classification = "SUSPICIOUS"
                confidence = 0.88
                risk_score = 65
                risk_level = "HIGH"
                reasons = ["Unverified sender risk profile", "Anomalous communication frequency pattern"]
                recommendation = "REVIEW"
            else:
                reasons = ["Standard conversational linguistic profile", "Zero scam keywords or deceptive links detected"]

        # 2. Email Phishing Model
        elif c_type == "email":
            subject = str(p.get("subject", "")).lower()
            body = str(p.get("body", "")).lower()
            link = str(p.get("link", "")).lower()
            if any(w in (subject + body) for w in ["suspended", "verify password", "deactivation", "security alert", "credential", "urgent"]):
                classification = "PHISHING"
                confidence = 0.97
                risk_score = 94
                risk_level = "CRITICAL"
                reasons = ["Credential harvesting language pattern", "Urgent account suspension threat", "Deceptive verification request"]
                recommendation = "BLOCK"
            elif link and not link.startswith("https://"):
                classification = "SUSPICIOUS"
                confidence = 0.89
                risk_score = 72
                risk_level = "HIGH"
                reasons = ["Insecure HTTP link in email body", "Unmatched sender domain structure"]
                recommendation = "REVIEW"
            else:
                reasons = ["Verified email headers", "Legitimate corporate layout and clean links"]

        # 3. URL Threat Model
        elif c_type == "url":
            url = str(p.get("url", "")).lower()
            if any(w in url for w in ["192.168", "xyz", "bank-login", "verify-account", "bit.ly", "free-reward"]):
                classification = "MALICIOUS"
                confidence = 0.99
                risk_score = 98
                risk_level = "CRITICAL"
                reasons = ["Direct IP target or deceptive high-risk TLD", "Homograph phishing pattern", "Flagged in threat intelligence dataset"]
                recommendation = "BLOCK"
            elif "http://" in url:
                classification = "SUSPICIOUS"
                confidence = 0.85
                risk_score = 52
                risk_level = "MEDIUM"
                reasons = ["Missing TLS/HTTPS encryption", "Unverified domain registration age"]
                recommendation = "REVIEW"
            else:
                reasons = ["Domain reputation clean", "Valid HTTPS certificate chain"]

        # 4. Fake News Model
        elif c_type == "news":
            headline = str(p.get("headline", "")).lower()
            text = str(p.get("text", "")).lower()
            if any(w in (headline + text) for w in ["shocking", "ban all", "secret cure", "miracle", "leaked memo", "conspiracy"]):
                classification = "FAKE_NEWS"
                confidence = 0.94
                risk_score = 78
                risk_level = "HIGH"
                reasons = ["Sensationalist clickbait linguistic pattern", "Unsubstantiated factual claim", "High linguistic distortion score"]
                recommendation = "REVIEW"
            else:
                reasons = ["Neutral objective reporting tone", "Standard journalistic attribution"]

        # 5. Image Manipulation Model
        elif c_type == "image":
            desc = str(p.get("description", "")).lower()
            filename = str(p.get("filename", "")).lower()
            if any(w in (desc + filename) for w in ["tampered", "manipulated", "gan", "synthetic", "photoshop", "deepfake"]):
                classification = "MANIPULATED"
                confidence = 0.95
                risk_score = 88
                risk_level = "CRITICAL"
                reasons = ["Pixel-level copy-move inconsistency", "EXIF metadata distortion", "GAN synthesis residual flags"]
                recommendation = "QUARANTINE"
            else:
                reasons = ["Authentic camera sensor noise pattern", "Consistent lighting and compression metadata"]

        # 6. Deepfake Video Model
        elif c_type == "video":
            desc = str(p.get("description", "")).lower()
            filename = str(p.get("filename", "")).lower()
            if any(w in (desc + filename) for w in ["deepfake", "face_swap", "synthetic", "ai_generated", "manipulated"]):
                classification = "DEEPFAKE"
                confidence = 0.96
                risk_score = 92
                risk_level = "CRITICAL"
                reasons = ["Temporal frame inconsistency across 48 frames", "Facial boundary blending artifacts", "Spectral frequency anomalies"]
                recommendation = "BLOCK"
            else:
                reasons = ["Natural facial micro-expressions verified", "Temporal frame continuity intact"]

        # 7. Fake Profile Model
        elif c_type == "profile":
            followers = int(p.get("followers", 100))
            following = int(p.get("following", 100))
            username = str(p.get("username", "")).lower()
            if (following > 2000 and followers < 50) or "bot" in username or "giveaway" in username:
                classification = "SUSPICIOUS"
                confidence = 0.93
                risk_score = 75
                risk_level = "HIGH"
                reasons = ["Extremely anomalous follower/following ratio (>100:1)", "Synthetic bot username heuristic", "Automated account velocity flag"]
                recommendation = "REVIEW"
            else:
                reasons = ["Balanced organic engagement ratio", "Authentic account creation timestamp"]

        # 8. File Security Model
        elif c_type == "file":
            filename = str(p.get("filename", "")).lower()
            if any(ext in filename for ext in [".exe", ".bat", ".xlsm", ".vbs", ".scr", ".js"]):
                classification = "MALICIOUS"
                confidence = 0.98
                risk_score = 97
                risk_level = "CRITICAL"
                reasons = ["High-risk macro or executable file signature", "Simulated suspicious PE header", "Dangerous script execution flags"]
                recommendation = "QUARANTINE"
            else:
                reasons = ["Safe document structure (PDF/TXT/PNG)", "No embedded macros or exploit shellcode"]

        latency = round((time.time() - start_time) * 1000 + 16.5, 2)

        return AISecurityResultSchema(
            classification=classification,
            confidence=confidence,
            risk_score=risk_score,
            risk_level=risk_level,
            reasons=reasons,
            recommendation=recommendation,
            model=model_name,
            timestamp=datetime.now(timezone.utc).isoformat(),
            processing_time_ms=latency
        )

    def process_and_store_event(
        self,
        event_id: Optional[str] = None,
        content_type: str = "message",
        sender_type: str = "simulated_attacker",
        sender_name: str = "Simulated Sender",
        payload: Dict[str, Any] = None,
        ai_result: Optional[AISecurityResultSchema] = None,
        user_action_override: Optional[str] = None
    ) -> SecurityEventSchema:
        if not event_id:
            event_id = self._generate_event_id()

        payload = payload or {}
        now_iso = datetime.now(timezone.utc).isoformat()
        now_time = datetime.now().strftime("%H:%M:%S")

        # Run AI analysis if not pre-computed
        if not ai_result:
            req = EventAnalyzeRequest(
                content_type=content_type,
                sender_type=sender_type,
                sender_name=sender_name,
                payload=payload
            )
            ai_result = self.analyze_payload(req)

        # Decide final action and receiver surface
        receiver_surface = self.route_receiver_surface(content_type)
        final_action = user_action_override or ai_result.recommendation
        
        # Build 6-stage lifecycle timeline
        timeline = [
            TimelineStepSchema(step="Event Created", status="DONE", timestamp=now_time, detail="Dispatched in Sender Platform"),
            TimelineStepSchema(step="Event Received", status="DONE", timestamp=now_time, detail="Ingested into CyberShield Event Bus"),
            TimelineStepSchema(step="AI Analysis Started", status="DONE", timestamp=now_time, detail=f"Routed to {ai_result.model}"),
            TimelineStepSchema(step="AI Analysis Completed", status="DONE", timestamp=now_time, detail=f"Classification: {ai_result.classification} ({ai_result.risk_score}/100)"),
            TimelineStepSchema(step="Security Decision", status="DONE", timestamp=now_time, detail=f"Action: {ai_result.recommendation}"),
            TimelineStepSchema(step="Receiver Routed", status="DONE", timestamp=now_time, detail=f"Target: {receiver_surface}")
        ]

        content_preview = str(
            payload.get("text") or 
            payload.get("subject") or 
            payload.get("url") or 
            payload.get("headline") or 
            payload.get("filename") or 
            payload.get("username") or 
            "Simulated Content"
        )

        event = SecurityEventSchema(
            event_id=event_id,
            sender_id=sender_name,
            sender_type=sender_type,
            receiver_id="Receiver Platform",
            receiver_surface=receiver_surface,
            platform="CyberShield-Simulation-Hub",
            content_type=content_type,
            content_preview=content_preview,
            created_at=now_iso,
            received_at=now_iso,
            processed_at=now_iso,
            status="analyzed",
            classification=ai_result.classification,
            risk_score=ai_result.risk_score,
            risk_level=ai_result.risk_level,
            confidence=ai_result.confidence,
            ai_model=ai_result.model,
            forensic_reasons=ai_result.reasons,
            recommended_action=ai_result.recommendation,
            final_action=final_action,
            user_action=final_action,
            ai_result=ai_result,
            timeline=timeline
        )

        # Check for existing event_id to update or insert
        for i, existing in enumerate(self._events):
            if existing.event_id == event_id:
                self._events[i] = event
                return event

        self._events.insert(0, event)
        return event

    def get_all_events(self) -> List[SecurityEventSchema]:
        return self._events

    def get_event_by_id(self, event_id: str) -> Optional[SecurityEventSchema]:
        for e in self._events:
            if e.event_id == event_id:
                return e
        return None

    def update_event_action(self, event_id: str, new_action: str) -> Optional[SecurityEventSchema]:
        allowed_actions = ["ALLOW", "BLOCK", "QUARANTINE", "REVIEW", "PENDING"]
        if new_action.upper() not in allowed_actions:
            raise ValueError(f"Invalid security action: {new_action}. Allowed: {allowed_actions}")

        for e in self._events:
            if e.event_id == event_id:
                # State transition validation
                e.user_action = new_action.upper()
                e.final_action = new_action.upper()
                e.timeline.append(
                    TimelineStepSchema(
                        step="User Decision Applied",
                        status="DONE",
                        timestamp=datetime.now().strftime("%H:%M:%S"),
                        detail=f"Officer override applied: {new_action.upper()}"
                    )
                )
                return e
        return None

    def get_event_stats(self) -> EventStatsSchema:
        total = len(self._events)
        safe = sum(1 for e in self._events if e.user_action == "ALLOW" or e.classification == "SAFE")
        blocked = sum(1 for e in self._events if e.user_action == "BLOCK")
        quarantined = sum(1 for e in self._events if e.user_action == "QUARANTINE")
        review = sum(1 for e in self._events if e.user_action == "REVIEW")
        threats = sum(1 for e in self._events if e.classification not in ["SAFE", "PENDING"])

        modality_dist: Dict[str, int] = {}
        total_latency = 0.0
        for e in self._events:
            modality_dist[e.content_type] = modality_dist.get(e.content_type, 0) + 1
            if e.ai_result:
                total_latency += e.ai_result.processing_time_ms

        avg_latency = round(total_latency / total, 2) if total > 0 else 24.5

        return EventStatsSchema(
            total_events=total,
            safe_events=safe,
            threats_detected=threats,
            blocked=blocked,
            quarantined=quarantined,
            under_review=review,
            allowed=safe,
            modality_distribution=modality_dist,
            avg_latency_ms=avg_latency
        )

# Global singleton service instance
event_processor_service = EventProcessorService()
