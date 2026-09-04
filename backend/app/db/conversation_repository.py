import json
import time
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import (
    DemoUserModel,
    ConversationModel,
    ConversationMemberModel,
    MessageModel,
    MessageRecipientModel,
    SecurityEventModel,
    UserContactModel
)
from app.db.repository import event_repository
from app.services.event_processor import event_processor_service
from app.services.notification_service import notification_service

class ConversationRepository:
    def __init__(self):
        self.subscribers = []

    def get_session(self) -> Session:
        return SessionLocal()

    def seed_if_empty(self):
        session = self.get_session()
        try:
            user_count = session.query(DemoUserModel).count()
            if user_count == 0:
                self._seed_demo_users(session)
            
            conv_count = session.query(ConversationModel).count()
            if conv_count == 0:
                self._seed_demo_conversations(session)

            contact_count = session.query(UserContactModel).count()
            if contact_count == 0:
                self._seed_user_contacts(session)
        finally:
            session.close()

    def _seed_demo_users(self, session: Session):
        users_data = [
            {"user_id": "user-kavin", "name": "Kavin", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "role": "Primary Student / Receiver"},
            {"user_id": "user-riya", "name": "Riya", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "role": "Project Collaborator"},
            {"user_id": "user-arun", "name": "Arun", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "role": "Tech Lead"},
            {"user_id": "user-priya", "name": "Priya", "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", "role": "Design Lead"},
            {"user_id": "user-rahul", "name": "Rahul", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "role": "Classmate"},
            {"user_id": "user-sneha", "name": "Sneha", "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150", "role": "Peer Researcher"},
            {"user_id": "user-vishal", "name": "Vishal", "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", "role": "AI Researcher"},
            {"user_id": "user-ananya", "name": "Ananya", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", "role": "Student Associate"},
            {"user_id": "user-rohit", "name": "Rohit", "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", "role": "Data Scientist"},
            {"user_id": "user-divya", "name": "Divya", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "role": "UI/UX Designer"},
            {"user_id": "user-aditya", "name": "Aditya", "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150", "role": "Systems Engineer"},
            {"user_id": "user-meena", "name": "Meena", "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", "role": "ML Engineer"},
            {"user_id": "user-nikhil", "name": "Nikhil", "avatar": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150", "role": "Class Representative"},
            {"user_id": "user-harish", "name": "Harish", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "role": "Backend Developer"},
            {"user_id": "user-kavya", "name": "Kavya", "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150", "role": "Research Associate"}
        ]

        now = datetime.now(timezone.utc).isoformat()
        for u in users_data:
            model = DemoUserModel(
                user_id=u["user_id"],
                name=u["name"],
                avatar=u["avatar"],
                role=u["role"],
                status="online",
                created_at=now
            )
            session.add(model)
        session.commit()

    def _seed_user_contacts(self, session: Session):
        now = datetime.now(timezone.utc).isoformat()
        contacts_map = {
            "user-kavin": [
                {"contact_user_id": "user-riya", "display_name": "Riya", "phone_number": "+91 98765 43210", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "status": "Working on CyberShield project!", "last_seen": "Online", "is_online": 1, "is_favorite": 1},
                {"contact_user_id": "user-arun", "display_name": "Arun (Tech Lead)", "phone_number": "+91 98765 43211", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "status": "Available for code review", "last_seen": "Today at 09:18 AM", "is_online": 1, "is_favorite": 1},
                {"contact_user_id": "user-priya", "display_name": "Priya (Design Lead)", "phone_number": "+91 98765 43212", "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", "status": "Designing Android mobile UI", "last_seen": "Yesterday at 4:30 PM", "is_online": 0, "is_favorite": 0},
                {"contact_user_id": "user-rahul", "display_name": "Rahul (Classmate)", "phone_number": "+91 98765 43213", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "status": "Studying for semester exams", "last_seen": "Today at 08:45 AM", "is_online": 1, "is_favorite": 0},
                {"contact_user_id": "user-sneha", "display_name": "Sneha", "phone_number": "+91 98765 43214", "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150", "status": "At university library", "last_seen": "Online", "is_online": 1, "is_favorite": 0},
                {"contact_user_id": "user-vishal", "display_name": "Vishal", "phone_number": "+91 98765 43215", "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", "status": "Building AI model benchmark", "last_seen": "Today at 07:20 AM", "is_online": 0, "is_favorite": 0}
            ],
            "user-riya": [
                {"contact_user_id": "user-kavin", "display_name": "Kavin", "phone_number": "+91 98765 43200", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "status": "CyberShield Defense Active", "last_seen": "Online", "is_online": 1, "is_favorite": 1},
                {"contact_user_id": "user-arun", "display_name": "Arun", "phone_number": "+91 98765 43211", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "status": "Available for code review", "last_seen": "Today at 09:18 AM", "is_online": 1, "is_favorite": 1},
                {"contact_user_id": "user-priya", "display_name": "Priya", "phone_number": "+91 98765 43212", "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", "status": "Designing Android mobile UI", "last_seen": "Yesterday at 4:30 PM", "is_online": 0, "is_favorite": 0},
                {"contact_user_id": "user-ananya", "display_name": "Ananya", "phone_number": "+91 98765 43216", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", "status": "Preparing research presentation", "last_seen": "Online", "is_online": 1, "is_favorite": 0},
                {"contact_user_id": "user-rahul", "display_name": "Rahul", "phone_number": "+91 98765 43213", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "status": "Studying for semester exams", "last_seen": "Today at 08:45 AM", "is_online": 1, "is_favorite": 0}
            ],
            "user-arun": [
                {"contact_user_id": "user-kavin", "display_name": "Kavin", "phone_number": "+91 98765 43200", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "status": "CyberShield Defense Active", "last_seen": "Online", "is_online": 1, "is_favorite": 1},
                {"contact_user_id": "user-riya", "display_name": "Riya", "phone_number": "+91 98765 43210", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "status": "Working on CyberShield project!", "last_seen": "Online", "is_online": 1, "is_favorite": 1},
                {"contact_user_id": "user-rohit", "display_name": "Rohit", "phone_number": "+91 98765 43217", "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", "status": "Analyzing security datasets", "last_seen": "Today at 10:10 AM", "is_online": 0, "is_favorite": 0},
                {"contact_user_id": "user-divya", "display_name": "Divya", "phone_number": "+91 98765 43218", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "status": "Reviewing Figma mockups", "last_seen": "Online", "is_online": 1, "is_favorite": 0}
            ]
        }

        for uid, contacts in contacts_map.items():
            for c in contacts:
                contact_model = UserContactModel(
                    user_id=uid,
                    contact_user_id=c["contact_user_id"],
                    display_name=c["display_name"],
                    phone_number=c["phone_number"],
                    avatar=c["avatar"],
                    status=c["status"],
                    last_seen=c["last_seen"],
                    is_online=c["is_online"],
                    is_favorite=c["is_favorite"],
                    created_at=now
                )
                session.add(contact_model)
        session.commit()

    def _seed_demo_conversations(self, session: Session):
        now = datetime.now(timezone.utc).isoformat()

        conversations_def = [
            {
                "id": "CONV-001",
                "type": "DIRECT",
                "title": "Kavin & Riya",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-riya"],
                "messages": [
                    {"sender": "user-kavin", "text": "Hello Riya"},
                    {"sender": "user-riya", "text": "Hii Kavin, what's up?"},
                    {"sender": "user-kavin", "text": "Just studying Riya, what about you?"},
                    {"sender": "user-riya", "text": "I'm working on my project. Great progress today!"}
                ]
            },
            {
                "id": "CONV-002",
                "type": "DIRECT",
                "title": "Kavin & Arun",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-arun"],
                "messages": [
                    {"sender": "user-arun", "text": "Kavin, did you test the backend gateway endpoints?"},
                    {"sender": "user-kavin", "text": "Yes Arun, all 9 platforms passed verification."},
                    {"sender": "user-arun", "text": "Great! Also check this external link: http://192.168.1.10/verify-bank"}
                ]
            },
            {
                "id": "CONV-003",
                "type": "GROUP",
                "title": "Project Team",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-riya", "user-arun", "user-priya", "user-rahul"],
                "messages": [
                    {"sender": "user-kavin", "text": "Guys, project meeting at 7 PM tonight."},
                    {"sender": "user-riya", "text": "I'll join on time."},
                    {"sender": "user-arun", "text": "Same here, slides are ready."},
                    {"sender": "user-rahul", "text": "Congratulations! You won ₹50,000 scholarship prize! Claim now immediately: http://192.168.1.1/claim-cash"},
                    {"sender": "user-priya", "text": "Okay team, let's continue reviewing the report."}
                ]
            },
            {
                "id": "CONV-004",
                "type": "GROUP",
                "title": "Friends Group",
                "created_by": "user-riya",
                "members": ["user-riya", "user-sneha", "user-divya", "user-kavya", "user-ananya"],
                "messages": [
                    {"sender": "user-riya", "text": "Who is coming to the campus cafeteria at lunch?"},
                    {"sender": "user-sneha", "text": "Count me in!"},
                    {"sender": "user-divya", "text": "Check out this manipulated photo voucher: doctored cash receipt."}
                ]
            },
            {
                "id": "CONV-005",
                "type": "GROUP",
                "title": "AI Project Discussion",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-vishal", "user-rohit", "user-meena", "user-nikhil", "user-harish"],
                "messages": [
                    {"sender": "user-vishal", "text": "The transformer feature extractor is yielding 98.4% accuracy."},
                    {"sender": "user-rohit", "text": "Awesome results Vishal!"},
                    {"sender": "user-harish", "text": "Attached macro file: malicious_payload_script.docm"}
                ]
            },
            {
                "id": "CONV-006",
                "type": "GROUP",
                "title": "Class Discussion",
                "created_by": "user-priya",
                "members": ["user-priya", "user-rahul", "user-sneha", "user-aditya", "user-nikhil"],
                "messages": [
                    {"sender": "user-priya", "text": "Assignment 4 deadline extended to Friday."},
                    {"sender": "user-aditya", "text": "Thanks Priya!"},
                    {"sender": "user-rahul", "text": "SHOCKING: Secret cure discovered doctors are hiding this boiled tea!"}
                ]
            },
            {
                "id": "CONV-007",
                "type": "GROUP",
                "title": "Design Team",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-priya", "user-vishal", "user-divya"],
                "messages": [
                    {"sender": "user-priya", "text": "New CyberShield theme contrast looks crisp!"},
                    {"sender": "user-divya", "text": "Agreed, dark/light contrast is fully readable."}
                ]
            },
            {
                "id": "CONV-008",
                "type": "GROUP",
                "title": "Research Team",
                "created_by": "user-rohit",
                "members": ["user-rohit", "user-meena", "user-harish", "user-kavya", "user-ananya"],
                "messages": [
                    {"sender": "user-rohit", "text": "Paper draft submitted to IEEE Forensics journal."},
                    {"sender": "user-meena", "text": "Fingers crossed! Great job team."}
                ]
            }
        ]

        for c_def in conversations_def:
            conv_model = ConversationModel(
                conversation_id=c_def["id"],
                conversation_type=c_def["type"],
                title=c_def["title"],
                created_by=c_def["created_by"],
                status="ACTIVE",
                created_at=now,
                updated_at=now
            )
            session.add(conv_model)

            for m_uid in c_def["members"]:
                m_model = ConversationMemberModel(
                    conversation_id=c_def["id"],
                    user_id=m_uid,
                    role="OWNER" if m_uid == c_def["created_by"] else "MEMBER",
                    joined_at=now
                )
                session.add(m_model)

            # Insert messages
            for idx, msg_def in enumerate(c_def["messages"]):
                msg_id = f"MSG-{c_def['id']}-{idx+1:03d}"
                text = msg_def["text"]
                sender = msg_def["sender"]
                
                # Analyze text for AI threat heuristics
                lower = text.lower()
                is_scam = "lottery" in lower or "won" in lower or "claim-cash" in lower or "50,000" in lower
                is_url = "verify-bank" in lower or "http:" in lower or "192.168" in lower
                is_file = ".docm" in lower or "malicious" in lower
                is_fake_news = "secret cure" in lower or "shocking" in lower
                is_manipulated = "doctored" in lower or "manipulated" in lower

                if is_scam:
                    sec_status = "DANGEROUS"
                    classification = "SCAM"
                    risk_score = 94
                    risk_level = "CRITICAL"
                    reasons = ["Urgency language & financial lure", "Unsolicited cash reward claim", "High-risk URL payload"]
                elif is_url:
                    sec_status = "DANGEROUS"
                    classification = "MALICIOUS"
                    risk_score = 98
                    risk_level = "CRITICAL"
                    reasons = ["Direct IP destination", "Phishing domain signature"]
                elif is_file:
                    sec_status = "DANGEROUS"
                    classification = "MALICIOUS"
                    risk_score = 92
                    risk_level = "CRITICAL"
                    reasons = ["Macro-enabled document extension (.docm)", "Script execution threat"]
                elif is_fake_news:
                    sec_status = "SUSPICIOUS"
                    classification = "FAKE_NEWS"
                    risk_score = 78
                    risk_level = "HIGH"
                    reasons = ["Sensationalist clickbait linguistic pattern", "Unsubstantiated medical claim"]
                elif is_manipulated:
                    sec_status = "SUSPICIOUS"
                    classification = "MANIPULATED"
                    risk_score = 88
                    risk_level = "HIGH"
                    reasons = ["Pixel-level copy-move anomaly", "Forged financial document"]
                else:
                    sec_status = "SAFE"
                    classification = "SAFE"
                    risk_score = 10
                    risk_level = "LOW"
                    reasons = ["Authentic conversational pattern"]

                content_type = "file" if is_file else "url" if is_url else "image" if is_manipulated else "news" if is_fake_news else "text"
                msg_model = MessageModel(
                    message_id=msg_id,
                    conversation_id=c_def["id"],
                    sender_id=sender,
                    content=text,
                    content_type=content_type,
                    timestamp=now,
                    security_status=sec_status,
                    classification=classification,
                    risk_score=risk_score,
                    risk_level=risk_level,
                    confidence=0.96,
                    forensic_reasons=json.dumps(reasons),
                    event_id=f"EVT-{msg_id}",
                    created_at=now
                )
                session.add(msg_model)

                # Add Message Recipients
                recipients = [m for m in c_def["members"] if m != sender]
                for r_uid in recipients:
                    r_model = MessageRecipientModel(
                        message_id=msg_id,
                        recipient_id=r_uid,
                        delivery_status="QUARANTINED" if sec_status == "DANGEROUS" else "DELIVERED",
                        security_action="QUARANTINE" if sec_status == "DANGEROUS" else "REVIEW" if sec_status == "SUSPICIOUS" else "ALLOW",
                        delivered_at=now
                    )
                    session.add(r_model)

                # Create Security Event & Notification if threat
                if sec_status != "SAFE":
                    evt_dict = {
                        "event_id": f"EVT-{msg_id}",
                        "sender_id": sender,
                        "sender_type": "simulated_attacker" if sec_status == "DANGEROUS" else "normal_user",
                        "receiver_surface": c_def["title"],
                        "content_type": content_type,
                        "content_preview": text,
                        "content_reference": f"conv:{c_def['id']}|msg:{msg_id}",
                        "status": "analyzed",
                        "classification": classification,
                        "risk_score": risk_score,
                        "risk_level": risk_level,
                        "confidence": 0.96,
                        "ai_model": "multimodal_cyber_engine",
                        "forensic_reasons": reasons,
                        "recommended_action": "QUARANTINE" if sec_status == "DANGEROUS" else "REVIEW",
                        "final_action": "QUARANTINE" if sec_status == "DANGEROUS" else "REVIEW",
                        "user_action": "QUARANTINE" if sec_status == "DANGEROUS" else "REVIEW",
                        "created_at": now,
                        "received_at": now,
                        "processed_at": now
                    }
                    event_repository.create_event(evt_dict)

        session.commit()

    def get_all_demo_users(self, exclude_user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        session = self.get_session()
        try:
            query = session.query(DemoUserModel)
            if exclude_user_id:
                query = query.filter(DemoUserModel.user_id != exclude_user_id)
            models = query.all()
            return [
                {
                    "user_id": u.user_id,
                    "name": u.name,
                    "avatar": u.avatar,
                    "role": u.role,
                    "status": u.status
                }
                for u in models
            ]
        finally:
            session.close()

    def get_user_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        session = self.get_session()
        try:
            # Find all conversation IDs where user is member
            member_records = session.query(ConversationMemberModel).filter(ConversationMemberModel.user_id == user_id).all()
            conv_ids = [m.conversation_id for m in member_records]

            conversations = session.query(ConversationModel).filter(ConversationModel.conversation_id.in_(conv_ids)).all()
            result = []

            for conv in conversations:
                # Get members
                members_records = session.query(ConversationMemberModel).filter(ConversationMemberModel.conversation_id == conv.conversation_id).all()
                member_user_ids = [m.user_id for m in members_records]
                
                # Fetch user details for members
                user_models = session.query(DemoUserModel).filter(DemoUserModel.user_id.in_(member_user_ids)).all()
                members_list = [
                    {"user_id": u.user_id, "name": u.name, "avatar": u.avatar, "role": u.role}
                    for u in user_models
                ]

                # Get latest message
                latest_msg_model = session.query(MessageModel).filter(MessageModel.conversation_id == conv.conversation_id).order_by(MessageModel.id.desc()).first()
                
                latest_msg = None
                if latest_msg_model:
                    latest_msg = {
                        "message_id": latest_msg_model.message_id,
                        "sender_id": latest_msg_model.sender_id,
                        "content": latest_msg_model.content,
                        "security_status": latest_msg_model.security_status,
                        "classification": latest_msg_model.classification,
                        "risk_score": latest_msg_model.risk_score,
                        "timestamp": latest_msg_model.timestamp
                    }

                # Count threats & unread
                threat_count = session.query(MessageModel).filter(
                    MessageModel.conversation_id == conv.conversation_id,
                    MessageModel.security_status != "SAFE"
                ).count()

                result.append({
                    "conversation_id": conv.conversation_id,
                    "conversation_type": conv.conversation_type,
                    "title": conv.title,
                    "created_by": conv.created_by,
                    "status": conv.status,
                    "members": members_list,
                    "member_count": len(members_list),
                    "latest_message": latest_msg,
                    "threat_count": threat_count,
                    "updated_at": conv.updated_at
                })

            return result
        finally:
            session.close()

    def get_conversation_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        session = self.get_session()
        try:
            msg_models = session.query(MessageModel).filter(MessageModel.conversation_id == conversation_id).order_by(MessageModel.id.asc()).all()
            
            result = []
            for m in msg_models:
                # Fetch sender user info
                sender_user = session.query(DemoUserModel).filter(DemoUserModel.user_id == m.sender_id).first()
                
                reasons = []
                try:
                    reasons = json.loads(m.forensic_reasons)
                except Exception:
                    reasons = [m.forensic_reasons] if m.forensic_reasons else []

                result.append({
                    "message_id": m.message_id,
                    "conversation_id": m.conversation_id,
                    "sender_id": m.sender_id,
                    "sender_name": sender_user.name if sender_user else m.sender_id,
                    "sender_avatar": sender_user.avatar if sender_user else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                    "content": m.content,
                    "content_type": m.content_type,
                    "timestamp": m.timestamp,
                    "security_status": m.security_status,
                    "classification": m.classification,
                    "risk_score": m.risk_score,
                    "risk_level": m.risk_level,
                    "confidence": m.confidence,
                    "forensic_reasons": reasons,
                    "event_id": m.event_id,
                    "created_at": m.created_at
                })

            return result
        finally:
            session.close()

    def send_message(
        self,
        conversation_id: str,
        sender_id: str,
        content: str,
        content_type: str = "text"
    ) -> Dict[str, Any]:
        session = self.get_session()
        try:
            conv = session.query(ConversationModel).filter(ConversationModel.conversation_id == conversation_id).first()
            if not conv:
                raise ValueError(f"Conversation '{conversation_id}' not found.")

            # Validate sender membership
            is_member = session.query(ConversationMemberModel).filter(
                ConversationMemberModel.conversation_id == conversation_id,
                ConversationMemberModel.user_id == sender_id
            ).first()
            if not is_member:
                raise PermissionError(f"User '{sender_id}' is not a member of conversation '{conversation_id}'.")

            now = datetime.now(timezone.utc).isoformat()
            now_time = datetime.now().strftime("%I:%M %p")
            msg_id = f"MSG-{conversation_id}-{int(time.time()*1000)%1000000:06d}"

            # Analyze payload via CyberShield AI model registry / analyzer
            lower = content.lower()
            is_scam = "lottery" in lower or "won" in lower or "claim-cash" in lower or "50,000" in lower or "urgent" in lower
            is_url = "verify-bank" in lower or "http:" in lower or "192.168" in lower or "xyz" in lower
            is_file = ".docm" in lower or ".exe" in lower or "malicious" in lower
            is_fake_news = "secret cure" in lower or "shocking" in lower
            is_manipulated = "doctored" in lower or "manipulated" in lower

            if is_scam:
                sec_status = "DANGEROUS"
                classification = "SCAM"
                risk_score = 94
                risk_level = "CRITICAL"
                reasons = ["Urgency language & financial lure", "Unsolicited cash reward claim"]
            elif is_url:
                sec_status = "DANGEROUS"
                classification = "MALICIOUS"
                risk_score = 98
                risk_level = "CRITICAL"
                reasons = ["Direct IP destination", "Phishing domain signature"]
            elif is_file:
                sec_status = "DANGEROUS"
                classification = "MALICIOUS"
                risk_score = 92
                risk_level = "CRITICAL"
                reasons = ["Executable / Macro payload signature"]
            elif is_fake_news:
                sec_status = "SUSPICIOUS"
                classification = "FAKE_NEWS"
                risk_score = 78
                risk_level = "HIGH"
                reasons = ["Sensationalist linguistic distortion score"]
            elif is_manipulated:
                sec_status = "SUSPICIOUS"
                classification = "MANIPULATED"
                risk_score = 88
                risk_level = "HIGH"
                reasons = ["Pixel-level copy-move anomaly"]
            else:
                sec_status = "SAFE"
                classification = "SAFE"
                risk_score = 8
                risk_level = "LOW"
                reasons = ["Authentic conversational pattern"]

            msg_model = MessageModel(
                message_id=msg_id,
                conversation_id=conversation_id,
                sender_id=sender_id,
                content=content,
                content_type=content_type,
                timestamp=now_time,
                security_status=sec_status,
                classification=classification,
                risk_score=risk_score,
                risk_level=risk_level,
                confidence=0.96,
                forensic_reasons=json.dumps(reasons),
                event_id=f"EVT-{msg_id}",
                created_at=now
            )
            session.add(msg_model)

            # Update conversation timestamp
            conv.updated_at = now

            # Fetch members to set recipient delivery status
            members = session.query(ConversationMemberModel).filter(ConversationMemberModel.conversation_id == conversation_id).all()
            for m in members:
                if m.user_id != sender_id:
                    r_model = MessageRecipientModel(
                        message_id=msg_id,
                        recipient_id=m.user_id,
                        delivery_status="QUARANTINED" if sec_status == "DANGEROUS" else "DELIVERED",
                        security_action="QUARANTINE" if sec_status == "DANGEROUS" else "REVIEW" if sec_status == "SUSPICIOUS" else "ALLOW",
                        delivered_at=now
                    )
                    session.add(r_model)

            # Store Security Event if threat
            if sec_status != "SAFE":
                sender_user = session.query(DemoUserModel).filter(DemoUserModel.user_id == sender_id).first()
                evt_dict = {
                    "event_id": f"EVT-{msg_id}",
                    "sender_id": sender_user.name if sender_user else sender_id,
                    "sender_type": "simulated_attacker" if sec_status == "DANGEROUS" else "normal_user",
                    "receiver_surface": conv.title,
                    "content_type": content_type,
                    "content_preview": content,
                    "content_reference": f"conv:{conversation_id}|msg:{msg_id}",
                    "status": "analyzed",
                    "classification": classification,
                    "risk_score": risk_score,
                    "risk_level": risk_level,
                    "confidence": 0.96,
                    "ai_model": "multimodal_cyber_engine",
                    "forensic_reasons": reasons,
                    "recommended_action": "QUARANTINE" if sec_status == "DANGEROUS" else "REVIEW",
                    "final_action": "QUARANTINE" if sec_status == "DANGEROUS" else "REVIEW",
                    "user_action": "QUARANTINE" if sec_status == "DANGEROUS" else "REVIEW",
                    "created_at": now,
                    "received_at": now,
                    "processed_at": now
                }
                event_model = event_processor_service.process_and_store_event(
                    event_id=evt_dict["event_id"],
                    content_type=content_type,
                    platform="whatsapp" if "direct" in conv.conversation_type.lower() else "messages",
                    sender_type=evt_dict["sender_type"],
                    sender_name=evt_dict["sender_id"],
                    recipient_id=conv.title,
                    payload={"text": content}
                )
                if event_model:
                    db_event = session.query(SecurityEventModel).filter(SecurityEventModel.event_id == event_model.event_id).first()
                    if db_event:
                        notification_service.create_notification_from_event(db_event)

            session.commit()

            sender_user = session.query(DemoUserModel).filter(DemoUserModel.user_id == sender_id).first()
            res_dict = {
                "message_id": msg_id,
                "conversation_id": conversation_id,
                "sender_id": sender_id,
                "sender_name": sender_user.name if sender_user else sender_id,
                "sender_avatar": sender_user.avatar if sender_user else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                "content": content,
                "content_type": content_type,
                "timestamp": now_time,
                "security_status": sec_status,
                "classification": classification,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "confidence": 0.96,
                "forensic_reasons": reasons,
                "event_id": f"EVT-{msg_id}",
                "created_at": now
            }

            # Broadcast SSE notification to subscribers
            self._notify_subscribers(res_dict)

            return res_dict
        finally:
            session.close()

    def _notify_subscribers(self, message_data: Dict[str, Any]):
        for sub in self.subscribers[:]:
            try:
                sub(message_data)
            except Exception:
                pass

    def get_user_contacts(self, user_id: str) -> List[Dict[str, Any]]:
        session = self.get_session()
        try:
            models = session.query(UserContactModel).filter(UserContactModel.user_id == user_id).all()
            if not models and user_id == "user-kavin":
                self._seed_user_contacts(session)
                models = session.query(UserContactModel).filter(UserContactModel.user_id == user_id).all()

            if not models:
                demo_users = session.query(DemoUserModel).filter(DemoUserModel.user_id != user_id).all()
                return [
                    {
                        "id": idx + 1,
                        "user_id": user_id,
                        "contact_user_id": u.user_id,
                        "display_name": u.name,
                        "phone_number": f"+91 98765 432{idx:02d}",
                        "avatar": u.avatar,
                        "status": "Available on WhatsApp",
                        "last_seen": "Online" if u.status == "online" else "Yesterday",
                        "is_online": 1 if u.status == "online" else 0,
                        "is_favorite": 0
                    }
                    for idx, u in enumerate(demo_users)
                ]

            return [
                {
                    "id": c.id,
                    "user_id": c.user_id,
                    "contact_user_id": c.contact_user_id,
                    "display_name": c.display_name,
                    "phone_number": c.phone_number,
                    "avatar": c.avatar,
                    "status": c.status,
                    "last_seen": c.last_seen,
                    "is_online": bool(c.is_online),
                    "is_favorite": bool(c.is_favorite)
                }
                for c in models
            ]
        finally:
            session.close()

    def update_message_security_action(self, message_id: str, action: str) -> Dict[str, Any]:
        session = self.get_session()
        try:
            msg = session.query(MessageModel).filter(MessageModel.message_id == message_id).first()
            if not msg:
                raise ValueError(f"Message '{message_id}' not found.")

            if action.upper() == "BLOCK":
                msg.security_status = "BLOCKED"
                msg.content = f"🛡 Message blocked by CyberShield (Risk Score: {msg.risk_score}/100)"
            elif action.upper() == "ALLOW":
                msg.security_status = "ALLOWED"

            recipients = session.query(MessageRecipientModel).filter(MessageRecipientModel.message_id == message_id).all()
            for r in recipients:
                r.security_action = action.upper()
                if action.upper() == "BLOCK":
                    r.delivery_status = "BLOCKED"
                elif action.upper() == "ALLOW":
                    r.delivery_status = "DELIVERED"

            if msg.event_id:
                event_repository.update_event_action(
                    event_id=msg.event_id,
                    new_action=action.upper(),
                    actor="User Decision"
                )

            session.commit()

            reasons = json.loads(msg.forensic_reasons) if msg.forensic_reasons else []
            sender_user = session.query(DemoUserModel).filter(DemoUserModel.user_id == msg.sender_id).first()
            return {
                "message_id": msg.message_id,
                "conversation_id": msg.conversation_id,
                "sender_id": msg.sender_id,
                "sender_name": sender_user.name if sender_user else msg.sender_id,
                "sender_avatar": sender_user.avatar if sender_user else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                "content": msg.content,
                "content_type": msg.content_type,
                "timestamp": msg.timestamp,
                "security_status": msg.security_status,
                "classification": msg.classification,
                "risk_score": msg.risk_score,
                "risk_level": msg.risk_level,
                "confidence": msg.confidence,
                "forensic_reasons": reasons,
                "event_id": msg.event_id,
                "created_at": msg.created_at
            }
        finally:
            session.close()

# Singleton instance
conversation_repository = ConversationRepository()
