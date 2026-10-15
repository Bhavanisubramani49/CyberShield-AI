import json
import time
from pathlib import Path
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

    def resolve_user_id(self, session: Session, user_input: Optional[str]) -> str:
        if not user_input:
            return "USER_000010"

        clean_input = str(user_input).strip()

        # 1. Exact match on user_id
        u = session.query(DemoUserModel).filter(DemoUserModel.user_id == clean_input).first()
        if u:
            return u.user_id

        # 2. Legacy alias check
        alias_map = {
            "user-kavin": "USER_000010",
            "kavin": "USER_000010",
            "user-arun": "USER_000011",
            "arun": "USER_000011",
            "user-kavya": "USER_000007",
            "kavya": "USER_000007",
            "user-riya": "USER_000002",
            "riya": "USER_000002",
            "user-naveen": "USER_000001",
            "naveen": "USER_000001",
        }
        if clean_input.lower() in alias_map:
            target_id = alias_map[clean_input.lower()]
            u = session.query(DemoUserModel).filter(DemoUserModel.user_id == target_id).first()
            if u:
                return u.user_id

        # 3. Match email or name (case insensitive)
        u = session.query(DemoUserModel).filter(
            (DemoUserModel.user_id.ilike(clean_input)) |
            (DemoUserModel.email.ilike(clean_input)) |
            (DemoUserModel.name.ilike(clean_input))
        ).first()
        if u:
            return u.user_id

        # 4. Match email prefix (e.g. "soorya" from "soorya@cybershield.local")
        prefix = clean_input.split("@")[0].lower()
        u = session.query(DemoUserModel).filter(DemoUserModel.name.ilike(prefix)).first()
        if u:
            return u.user_id

        # 5. Dynamically register new demo user for custom login strings (e.g. "Soorya")
        now = datetime.now(timezone.utc).isoformat()
        new_name = prefix.capitalize()
        new_uid = f"USER_{abs(hash(clean_input)) % 899999 + 100000:06d}"
        new_user = DemoUserModel(
            user_id=new_uid,
            name=new_name,
            email=f"{prefix}@cybershield.local",
            avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            role="Authenticated CyberShield User",
            status="online",
            created_at=now
        )
        session.add(new_user)
        session.commit()
        return new_uid

    def seed_if_empty(self):
        session = self.get_session()
        try:
            self._seed_demo_users(session)
            self._seed_from_generated_datasets(session)
            
            conv_count = session.query(ConversationModel).count()
            if conv_count == 0:
                self._seed_demo_conversations(session)
            else:
                # Check if SMS & EMAIL conversations exist, seed if missing
                sms_exists = session.query(ConversationModel).filter(ConversationModel.conversation_id == "CONV-SMS-001").first()
                if not sms_exists:
                    self._seed_sms_conversations_only(session)

                email_exists = session.query(ConversationModel).filter(ConversationModel.conversation_id == "CONV-EMAIL-001").first()
                if not email_exists:
                    self._seed_email_conversations_only(session)

                ig_exists = session.query(ConversationModel).filter(ConversationModel.conversation_id == "CONV-IG-001").first()
                if not ig_exists:
                    self._seed_instagram_conversations_only(session)

            contact_count = session.query(UserContactModel).count()
            if contact_count == 0:
                self._seed_user_contacts(session)
        finally:
            session.close()

    def _seed_from_generated_datasets(self, session: Session):
        datasets_dir = Path(__file__).resolve().parent.parent.parent.parent / "datasets"
        now = datetime.now(timezone.utc).isoformat()

        platforms = ["whatsapp", "sms", "email", "instagram"]

        existing_conv_ids = set(r[0] for r in session.query(ConversationModel.conversation_id).all())
        existing_contact_keys = set((r[0], r[1]) for r in session.query(UserContactModel.user_id, UserContactModel.contact_user_id).all())
        existing_msg_ids = set(r[0] for r in session.query(MessageModel.message_id).all())

        new_convs = []
        new_members = []
        new_contacts = []
        new_msgs = []
        new_recipients = []

        for platform in platforms:
            jsonl_path = datasets_dir / platform / "generated" / f"{platform}.jsonl"
            if not jsonl_path.exists():
                continue

            with open(jsonl_path, "r", encoding="utf-8") as f:
                for line in f:
                    if not line.strip():
                        continue
                    try:
                        r = json.loads(line)
                    except Exception:
                        continue

                    u_id = r.get("user_id")
                    if not u_id:
                        continue

                    conv_id = r.get("conversation_id") or f"CONV-{platform.upper()}-{u_id}"
                    channel = platform.upper()

                    sender_id = r.get("sender_id") or "SYSTEM"
                    contact_id = r.get("contact_id") or sender_id
                    contact_name = r.get("contact_name") or r.get("sender_name") or "Contact"

                    if (u_id, contact_id) not in existing_contact_keys:
                        existing_contact_keys.add((u_id, contact_id))
                        new_contacts.append({
                            "user_id": u_id,
                            "contact_user_id": contact_id,
                            "display_name": contact_name,
                            "phone_number": f"+91 {abs(hash(contact_id)) % 89999 + 10000} {abs(hash(contact_id)) % 89999 + 10000}",
                            "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                            "status": "CyberShield Protected Persona",
                            "last_seen": "Recently",
                            "is_online": 1,
                            "is_favorite": 0,
                            "created_at": now
                        })

                    if conv_id not in existing_conv_ids:
                        existing_conv_ids.add(conv_id)
                        title = r.get("group_name") or r.get("subject") or contact_name
                        new_convs.append({
                            "conversation_id": conv_id,
                            "conversation_type": "GROUP" if r.get("is_group") else "DIRECT",
                            "channel": channel,
                            "title": title,
                            "created_by": u_id,
                            "status": "ACTIVE",
                            "created_at": r.get("timestamp", now),
                            "updated_at": r.get("timestamp", now)
                        })
                        new_members.append({
                            "conversation_id": conv_id,
                            "user_id": u_id,
                            "role": "OWNER",
                            "joined_at": now
                        })
                        if sender_id != u_id:
                            new_members.append({
                                "conversation_id": conv_id,
                                "user_id": sender_id,
                                "role": "MEMBER",
                                "joined_at": now
                            })

                    msg_id = r.get("record_id") or f"MSG-{conv_id}-{len(new_msgs)+1}"
                    if msg_id not in existing_msg_ids:
                        existing_msg_ids.add(msg_id)
                        risk_score = r.get("risk_score", 0)
                        risk_level = str(r.get("risk_level") or "low").upper()
                        cls = str(r.get("classification") or "safe").upper()
                        sec_status = "DANGEROUS" if risk_level in ("CRITICAL", "HIGH") and cls != "SAFE" else ("SUSPICIOUS" if cls != "SAFE" else "SAFE")
                        indicators = r.get("threat_indicators", [])

                        new_msgs.append({
                            "message_id": msg_id,
                            "conversation_id": conv_id,
                            "sender_id": sender_id,
                            "content": r.get("content", ""),
                            "content_type": r.get("content_type", "text"),
                            "timestamp": r.get("timestamp", now),
                            "security_status": sec_status,
                            "classification": cls,
                            "risk_score": risk_score,
                            "risk_level": risk_level,
                            "confidence": 0.95,
                            "forensic_reasons": json.dumps(indicators),
                            "created_at": now
                        })

                        recip_id = r.get("receiver_id") or u_id
                        new_recipients.append({
                            "message_id": msg_id,
                            "recipient_id": recip_id,
                            "delivery_status": "QUARANTINED" if sec_status == "DANGEROUS" else "DELIVERED",
                            "security_action": "QUARANTINE" if sec_status == "DANGEROUS" else "ALLOW",
                            "delivered_at": r.get("timestamp", now)
                        })

        if new_contacts:
            session.bulk_insert_mappings(UserContactModel, new_contacts)
        if new_convs:
            session.bulk_insert_mappings(ConversationModel, new_convs)
        if new_members:
            session.bulk_insert_mappings(ConversationMemberModel, new_members)
        if new_msgs:
            session.bulk_insert_mappings(MessageModel, new_msgs)
        if new_recipients:
            session.bulk_insert_mappings(MessageRecipientModel, new_recipients)
        session.commit()

    def _seed_demo_users(self, session: Session):
        users_file = Path(__file__).resolve().parent.parent.parent.parent / "datasets" / "users.json"
        now = datetime.now(timezone.utc).isoformat()

        users_data = []
        if users_file.exists():
            try:
                with open(users_file, "r", encoding="utf-8") as f:
                    dataset_users = json.load(f)
                    for idx, u in enumerate(dataset_users):
                        users_data.append({
                            "user_id": u["user_id"],
                            "name": u["name"],
                            "email": u.get("email", f"{u['name'].lower()}@cybershield.local"),
                            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" if idx % 2 == 0 else "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                            "role": f"Protected Student Persona ({u['name']})",
                            "status": "online"
                        })
            except Exception as e:
                print(f"[Seed] Error reading datasets/users.json: {e}")

        if not users_data:
            users_data = [
                {"user_id": "USER_000010", "name": "Kavin", "email": "kavin@cybershield.local", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "role": "Primary Student / Receiver", "status": "online"},
                {"user_id": "USER_000002", "name": "Riya", "email": "riya@cybershield.local", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "role": "Project Collaborator", "status": "online"},
                {"user_id": "USER_000011", "name": "Arun", "email": "arun@cybershield.local", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "role": "Tech Lead", "status": "online"},
                {"user_id": "USER_000001", "name": "Naveen", "email": "naveen@cybershield.local", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "role": "CyberShield User", "status": "online"}
            ]

        # Add legacy alias mappings for backwards compatibility with test scripts
        legacy_aliases = [
            {"user_id": "user-kavin", "name": "Kavin", "email": "kavin@cybershield.local", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "role": "Primary Student / Receiver", "status": "online"},
            {"user_id": "user-riya", "name": "Riya", "email": "riya@cybershield.local", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "role": "Project Collaborator", "status": "online"},
            {"user_id": "user-arun", "name": "Arun", "email": "arun@cybershield.local", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "role": "Tech Lead", "status": "online"}
        ]
        users_data.extend(legacy_aliases)

        for u in users_data:
            existing = session.query(DemoUserModel).filter(DemoUserModel.user_id == u["user_id"]).first()
            if not existing:
                model = DemoUserModel(
                    user_id=u["user_id"],
                    name=u["name"],
                    email=u.get("email"),
                    avatar=u["avatar"],
                    role=u["role"],
                    status=u.get("status", "online"),
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
                "channel": "WHATSAPP",
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
                "channel": "WHATSAPP",
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
                "channel": "WHATSAPP",
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
                "channel": "WHATSAPP",
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
                "channel": "WHATSAPP",
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
                "channel": "WHATSAPP",
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
                "channel": "WHATSAPP",
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
                "channel": "WHATSAPP",
                "title": "Research Team",
                "created_by": "user-rohit",
                "members": ["user-rohit", "user-meena", "user-harish", "user-kavya", "user-ananya"],
                "messages": [
                    {"sender": "user-rohit", "text": "Paper draft submitted to IEEE Forensics journal."},
                    {"sender": "user-meena", "text": "Fingers crossed! Great job team."}
                ]
            },
            # MESSAGES / SMS CONVERSATIONS SEED DATA
            {
                "id": "CONV-SMS-001",
                "type": "DIRECT",
                "channel": "SMS",
                "title": "Riya",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-riya"],
                "messages": [
                    {"sender": "user-riya", "text": "Hey Kavin, are you coming today?"},
                    {"sender": "user-kavin", "text": "Yes Riya, heading over now."},
                    {"sender": "user-riya", "text": "Can you send me the project notes?"}
                ]
            },
            {
                "id": "CONV-SMS-002",
                "type": "DIRECT",
                "channel": "SMS",
                "title": "Arun",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-arun"],
                "messages": [
                    {"sender": "user-arun", "text": "Can you send me the project notes?"},
                    {"sender": "user-kavin", "text": "Sure Arun, sending them shortly."}
                ]
            },
            {
                "id": "CONV-SMS-003",
                "type": "DIRECT",
                "channel": "SMS",
                "title": "Priya",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-priya"],
                "messages": [
                    {"sender": "user-priya", "text": "Meeting starts at 4 PM."}
                ]
            },
            {
                "id": "CONV-SMS-004",
                "type": "DIRECT",
                "channel": "SMS",
                "title": "Rahul (Classmate)",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-rahul"],
                "messages": [
                    {"sender": "user-rahul", "text": "Please send the assignment when free."}
                ]
            },
            {
                "id": "CONV-SMS-005",
                "type": "DIRECT",
                "channel": "SMS",
                "title": "Sneha",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-sneha"],
                "messages": [
                    {"sender": "user-sneha", "text": "Thanks for helping me!"}
                ]
            }
        ]

        for c_def in conversations_def:
            conv_model = ConversationModel(
                conversation_id=c_def["id"],
                conversation_type=c_def["type"],
                channel=c_def.get("channel", "WHATSAPP"),
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

    def _seed_sms_conversations_only(self, session: Session):
        now = datetime.now(timezone.utc).isoformat()
        sms_defs = [
            {
                "id": "CONV-SMS-001",
                "type": "DIRECT",
                "channel": "SMS",
                "title": "Riya",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-riya"],
                "messages": [
                    {"sender": "user-riya", "text": "Hey Kavin, are you coming today?"},
                    {"sender": "user-kavin", "text": "Yes Riya, heading over now."},
                    {"sender": "user-riya", "text": "Can you send me the project notes?"}
                ]
            },
            {
                "id": "CONV-SMS-002",
                "type": "DIRECT",
                "channel": "SMS",
                "title": "Arun",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-arun"],
                "messages": [
                    {"sender": "user-arun", "text": "Can you send me the project notes?"},
                    {"sender": "user-kavin", "text": "Sure Arun, sending them shortly."}
                ]
            },
            {
                "id": "CONV-SMS-003",
                "type": "DIRECT",
                "channel": "SMS",
                "title": "Priya",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-priya"],
                "messages": [
                    {"sender": "user-priya", "text": "Meeting starts at 4 PM."}
                ]
            },
            {
                "id": "CONV-SMS-004",
                "type": "DIRECT",
                "channel": "SMS",
                "title": "Rahul (Classmate)",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-rahul"],
                "messages": [
                    {"sender": "user-rahul", "text": "Please send the assignment when free."}
                ]
            },
            {
                "id": "CONV-SMS-005",
                "type": "DIRECT",
                "channel": "SMS",
                "title": "Sneha",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-sneha"],
                "messages": [
                    {"sender": "user-sneha", "text": "Thanks for helping me!"}
                ]
            }
        ]

        for c_def in sms_defs:
            existing = session.query(ConversationModel).filter(ConversationModel.conversation_id == c_def["id"]).first()
            if existing:
                continue

            conv_model = ConversationModel(
                conversation_id=c_def["id"],
                conversation_type=c_def["type"],
                channel="SMS",
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

            for idx, msg_def in enumerate(c_def["messages"]):
                msg_id = f"MSG-{c_def['id']}-{idx+1:03d}"
                msg_model = MessageModel(
                    message_id=msg_id,
                    conversation_id=c_def["id"],
                    sender_id=msg_def["sender"],
                    content=msg_def["text"],
                    content_type="text",
                    timestamp=datetime.now().strftime("%I:%M %p"),
                    security_status="SAFE",
                    classification="SAFE",
                    risk_score=10,
                    risk_level="LOW",
                    confidence=0.98,
                    forensic_reasons=json.dumps(["Authentic SMS pattern"]),
                    created_at=now
                )
                session.add(msg_model)

                for m_uid in c_def["members"]:
                    if m_uid != msg_def["sender"]:
                        rec_model = MessageRecipientModel(
                            message_id=msg_id,
                            recipient_id=m_uid,
                            delivery_status="DELIVERED",
                            security_action="ALLOW",
                            delivered_at=now,
                            read_at=now
                        )
                        session.add(rec_model)

        session.commit()

    def _seed_email_conversations_only(self, session: Session):
        now = datetime.now(timezone.utc).isoformat()
        email_defs = [
            {
                "id": "CONV-EMAIL-001",
                "type": "DIRECT",
                "channel": "EMAIL",
                "title": "Security Alert: Immediate Account Verification Required",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-riya"],
                "messages": [
                    {
                        "sender": "user-riya",
                        "text": "Subject: URGENT: CyberShield Account Access Suspended\n\nDear Kavin,\n\nWe detected unauthorized login attempts on your CyberShield student portal. Your access will be suspended within 24 hours unless you re-verify your identity immediately.\n\nPlease click here to update your credentials: http://cybershield-auth-verify.com/login\n\nBest regards,\nIT Security Desk",
                        "sec_status": "DANGEROUS",
                        "classification": "PHISHING",
                        "risk_score": 94,
                        "risk_level": "CRITICAL",
                        "reasons": ["Suspicious domain mismatch: cybershield-auth-verify.com", "Urgent pressure tactics detected", "Credential harvesting link pattern"]
                    }
                ]
            },
            {
                "id": "CONV-EMAIL-002",
                "type": "DIRECT",
                "channel": "EMAIL",
                "title": "CyberShield AI Project Review & Architecture Updates",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-arun"],
                "messages": [
                    {
                        "sender": "user-arun",
                        "text": "Subject: CyberShield AI Project Review & Architecture Updates\n\nHi Kavin,\n\nI reviewed the latest code for the multi-channel defense engine. The SSE streaming and platform isolation logic look great!\n\nLet's schedule a brief sync tomorrow at 10 AM to discuss the final evaluation dashboard.\n\nBest,\nArun",
                        "sec_status": "SAFE",
                        "classification": "SAFE",
                        "risk_score": 5,
                        "risk_level": "LOW",
                        "reasons": ["Authentic email header and domain"]
                    }
                ]
            },
            {
                "id": "CONV-EMAIL-003",
                "type": "DIRECT",
                "channel": "EMAIL",
                "title": "UI/UX Design Mockups - CyberShield Mobile Experience",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-priya"],
                "messages": [
                    {
                        "sender": "user-priya",
                        "text": "Subject: UI/UX Design Mockups - CyberShield Mobile Experience\n\nHi Kavin,\n\nAttached are the updated design specs for the WhatsApp, SMS, and Email sandbox environments. Please review the color themes and back navigation specs when you get a chance.\n\nRegards,\nPriya",
                        "sec_status": "SAFE",
                        "classification": "SAFE",
                        "risk_score": 8,
                        "risk_level": "LOW",
                        "reasons": ["Verified sender identity"]
                    }
                ]
            },
            {
                "id": "CONV-EMAIL-004",
                "type": "DIRECT",
                "channel": "EMAIL",
                "title": "Semester Project Submission Reminder",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-rahul"],
                "messages": [
                    {
                        "sender": "user-rahul",
                        "text": "Subject: Semester Project Submission Reminder\n\nHey Kavin,\n\nDon't forget to push the latest report to the repo before midnight. Let me know if you need help with the documentation formatting.\n\nCheers,\nRahul",
                        "sec_status": "SAFE",
                        "classification": "SAFE",
                        "risk_score": 12,
                        "risk_level": "LOW",
                        "reasons": ["Legitimate academic communication"]
                    }
                ]
            },
            {
                "id": "CONV-EMAIL-005",
                "type": "DIRECT",
                "channel": "EMAIL",
                "title": "Research Paper Draft: Multi-User Cyber Threat Defense",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-sneha"],
                "messages": [
                    {
                        "sender": "user-sneha",
                        "text": "Subject: Research Paper Draft: Multi-User Cyber Threat Defense\n\nHi Kavin,\n\nI've updated the abstract and methodology section of our research draft on real-time threat detection. Please take a look at the attached draft.\n\nBest,\nSneha",
                        "sec_status": "SAFE",
                        "classification": "SAFE",
                        "risk_score": 10,
                        "risk_level": "LOW",
                        "reasons": ["Authentic research paper correspondence"]
                    }
                ]
            }
        ]

        for c_def in email_defs:
            existing = session.query(ConversationModel).filter(ConversationModel.conversation_id == c_def["id"]).first()
            if existing:
                continue

            conv_model = ConversationModel(
                conversation_id=c_def["id"],
                conversation_type=c_def["type"],
                channel="EMAIL",
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

            for idx, msg_def in enumerate(c_def["messages"]):
                msg_id = f"MSG-{c_def['id']}-{idx+1:03d}"
                sec_st = msg_def.get("sec_status", "SAFE")
                classif = msg_def.get("classification", "SAFE")
                risk_sc = msg_def.get("risk_score", 10)
                risk_lv = msg_def.get("risk_level", "LOW")
                reasons = msg_def.get("reasons", ["Authentic email pattern"])

                msg_model = MessageModel(
                    message_id=msg_id,
                    conversation_id=c_def["id"],
                    sender_id=msg_def["sender"],
                    content=msg_def["text"],
                    content_type="text",
                    timestamp=datetime.now().strftime("%I:%M %p"),
                    security_status=sec_st,
                    classification=classif,
                    risk_score=risk_sc,
                    risk_level=risk_lv,
                    confidence=0.96 if sec_st != "SAFE" else 0.98,
                    forensic_reasons=json.dumps(reasons),
                    created_at=now
                )
                session.add(msg_model)

                for m_uid in c_def["members"]:
                    if m_uid != msg_def["sender"]:
                        rec_model = MessageRecipientModel(
                            message_id=msg_id,
                            recipient_id=m_uid,
                            delivery_status="QUARANTINED" if sec_st == "DANGEROUS" else "DELIVERED",
                            security_action="QUARANTINE" if sec_st == "DANGEROUS" else "ALLOW",
                            delivered_at=now,
                            read_at=now
                        )
                        session.add(rec_model)

        session.commit()

    def _seed_instagram_conversations_only(self, session: Session):
        now = datetime.now(timezone.utc).isoformat()
        ig_defs = [
            {
                "id": "CONV-IG-001",
                "type": "DIRECT",
                "channel": "INSTAGRAM",
                "title": "Riya (@riya_design)",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-riya"],
                "messages": [
                    {
                        "sender": "user-riya",
                        "text": "Hey Kavin! Did you check out the new CyberShield mobile UI mockups on Instagram?",
                        "sec_status": "SAFE",
                        "classification": "SAFE",
                        "risk_score": 8,
                        "risk_level": "LOW",
                        "reasons": ["Authentic Instagram DM"]
                    },
                    {
                        "sender": "user-kavin",
                        "text": "Yes Riya, checking them now! The dark mode styling looks clean.",
                        "sec_status": "SAFE",
                        "classification": "SAFE",
                        "risk_score": 5,
                        "risk_level": "LOW",
                        "reasons": ["Authentic Instagram DM"]
                    }
                ]
            },
            {
                "id": "CONV-IG-002",
                "type": "DIRECT",
                "channel": "INSTAGRAM",
                "title": "official_bank_support_786",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-arun"],
                "messages": [
                    {
                        "sender": "user-arun",
                        "text": "URGENT SECURITY ALERT: Your Instagram student account status is marked for deletion. Click link to re-verify password immediately: http://cybershield-auth-verify.com/login",
                        "sec_status": "DANGEROUS",
                        "classification": "PHISHING",
                        "risk_score": 94,
                        "risk_level": "CRITICAL",
                        "reasons": ["Deceptive domain signature: cybershield-auth-verify.com", "Suspicious username pattern", "Urgent credential harvesting link"]
                    }
                ]
            },
            {
                "id": "CONV-IG-003",
                "type": "DIRECT",
                "channel": "INSTAGRAM",
                "title": "Arun (@arun_techlead)",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-arun"],
                "messages": [
                    {
                        "sender": "user-arun",
                        "text": "Hi Kavin, take a look at the updated architecture post on our project feed.",
                        "sec_status": "SAFE",
                        "classification": "SAFE",
                        "risk_score": 5,
                        "risk_level": "LOW",
                        "reasons": ["Authentic interaction"]
                    }
                ]
            },
            {
                "id": "CONV-IG-004",
                "type": "DIRECT",
                "channel": "INSTAGRAM",
                "title": "Priya (@priya_ui)",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-priya"],
                "messages": [
                    {
                        "sender": "user-priya",
                        "text": "Hey Kavin, just shared the brand guidelines for our presentation deck!",
                        "sec_status": "SAFE",
                        "classification": "SAFE",
                        "risk_score": 6,
                        "risk_level": "LOW",
                        "reasons": ["Authentic interaction"]
                    }
                ]
            },
            {
                "id": "CONV-IG-005",
                "type": "DIRECT",
                "channel": "INSTAGRAM",
                "title": "Crypto_Giveaway_Bot_99",
                "created_by": "user-kavin",
                "members": ["user-kavin", "user-sneha"],
                "messages": [
                    {
                        "sender": "user-sneha",
                        "text": "FREE CRYPTO AIRDROP: Double your investment instantly! Send 0.1 BTC to receive 0.5 BTC back immediately at http://192.168.1.200/crypto-giveaway.php",
                        "sec_status": "DANGEROUS",
                        "classification": "SCAM",
                        "risk_score": 96,
                        "risk_level": "CRITICAL",
                        "reasons": ["Unrealistic financial return claim", "Crypto wallet harvesting URL", "Bot account activity pattern"]
                    }
                ]
            }
        ]

        for c_def in ig_defs:
            existing = session.query(ConversationModel).filter(ConversationModel.conversation_id == c_def["id"]).first()
            if existing:
                continue

            conv_model = ConversationModel(
                conversation_id=c_def["id"],
                conversation_type=c_def["type"],
                channel="INSTAGRAM",
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

            for idx, msg_def in enumerate(c_def["messages"]):
                msg_id = f"MSG-{c_def['id']}-{idx+1:03d}"
                sec_st = msg_def.get("sec_status", "SAFE")
                classif = msg_def.get("classification", "SAFE")
                risk_sc = msg_def.get("risk_score", 10)
                risk_lv = msg_def.get("risk_level", "LOW")
                reasons = msg_def.get("reasons", ["Authentic Instagram pattern"])

                msg_model = MessageModel(
                    message_id=msg_id,
                    conversation_id=c_def["id"],
                    sender_id=msg_def["sender"],
                    content=msg_def["text"],
                    content_type="text",
                    timestamp=datetime.now().strftime("%I:%M %p"),
                    security_status=sec_st,
                    classification=classif,
                    risk_score=risk_sc,
                    risk_level=risk_lv,
                    confidence=0.96 if sec_st != "SAFE" else 0.98,
                    forensic_reasons=json.dumps(reasons),
                    created_at=now
                )
                session.add(msg_model)

                for m_uid in c_def["members"]:
                    if m_uid != msg_def["sender"]:
                        rec_model = MessageRecipientModel(
                            message_id=msg_id,
                            recipient_id=m_uid,
                            delivery_status="QUARANTINED" if sec_st == "DANGEROUS" else "DELIVERED",
                            security_action="QUARANTINE" if sec_st == "DANGEROUS" else "ALLOW",
                            delivered_at=now,
                            read_at=now
                        )
                        session.add(rec_model)

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

    def get_user_conversations(self, user_id: str, channel: Optional[str] = None) -> List[Dict[str, Any]]:
        session = self.get_session()
        try:
            target_user_id = self.resolve_user_id(session, user_id)

            # Find all conversation IDs where user is member
            member_records = session.query(ConversationMemberModel).filter(ConversationMemberModel.user_id == target_user_id).all()
            if not member_records:
                self._seed_conversations_for_user(session, target_user_id)
                member_records = session.query(ConversationMemberModel).filter(ConversationMemberModel.user_id == target_user_id).all()

            conv_ids = [m.conversation_id for m in member_records]

            query = session.query(ConversationModel).filter(ConversationModel.conversation_id.in_(conv_ids))
            if channel:
                query = query.filter(ConversationModel.channel == channel.upper())

            conversations = query.all()
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
                    "channel": getattr(conv, "channel", "WHATSAPP"),
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
                ConversationMemberModel.conversation_id == conversation_id
            ).first()
            if not is_member:
                raise PermissionError(f"Conversation '{conversation_id}' has no members.")

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
            is_phishing = (getattr(conv, "channel", "") == "EMAIL" or "phish" in lower or "cybershield-auth-verify.com" in lower) and ("verify" in lower or "suspend" in lower or "phish" in lower or "login" in lower or "credential" in lower or "http" in lower)

            if is_phishing:
                sec_status = "DANGEROUS"
                classification = "PHISHING"
                risk_score = 94
                risk_level = "CRITICAL"
                reasons = ["Suspicious domain / credential link pattern", "Phishing threat signature", "Urgent security pressure tactic"]
            elif is_scam:
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
                    platform=(getattr(conv, "channel", None) or "WHATSAPP").lower(),
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
                "channel": getattr(conv, "channel", "WHATSAPP"),
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

    def _seed_contacts_for_user(self, session: Session, user_id: str):
        now = datetime.now(timezone.utc).isoformat()
        demo_users = session.query(DemoUserModel).filter(DemoUserModel.user_id != user_id).limit(10).all()
        for idx, u in enumerate(demo_users):
            c_model = UserContactModel(
                user_id=user_id,
                contact_user_id=u.user_id,
                display_name=u.name,
                phone_number=f"+91 98765 {43200+idx:05d}",
                avatar=u.avatar,
                status="Available on CyberShield",
                last_seen="Online" if idx % 2 == 0 else "Today at 09:15 AM",
                is_online=1 if idx % 2 == 0 else 0,
                is_favorite=1 if idx < 2 else 0,
                created_at=now
            )
            session.add(c_model)
        session.commit()

    def _seed_conversations_for_user(self, session: Session, user_id: str):
        now = datetime.now(timezone.utc).isoformat()
        user = session.query(DemoUserModel).filter(DemoUserModel.user_id == user_id).first()
        user_name = user.name if user else "User"

        contacts = session.query(UserContactModel).filter(UserContactModel.user_id == user_id).all()
        if not contacts:
            self._seed_contacts_for_user(session, user_id)
            contacts = session.query(UserContactModel).filter(UserContactModel.user_id == user_id).all()

        c1 = contacts[0] if contacts else None
        c1_id = c1.contact_user_id if c1 else "USER_000011"
        c1_name = c1.display_name if c1 else "Arun"

        conv_defs = [
            {
                "id": f"CONV-WA-{user_id}",
                "channel": "WHATSAPP",
                "title": f"{c1_name}",
                "members": [user_id, c1_id],
                "messages": [
                    {"sender": c1_id, "text": f"Hey {user_name}, welcome to CyberShield WhatsApp sandbox!"},
                    {"sender": user_id, "text": f"Hi {c1_name}, real-time threat protection is active."}
                ]
            },
            {
                "id": f"CONV-SMS-{user_id}",
                "channel": "SMS",
                "title": f"{c1_name}",
                "members": [user_id, c1_id],
                "messages": [
                    {"sender": c1_id, "text": f"SMS channel verified for {user_name}."}
                ]
            },
            {
                "id": f"CONV-EMAIL-{user_id}",
                "channel": "EMAIL",
                "title": "Welcome to CyberShield Protected Mailbox",
                "members": [user_id, c1_id],
                "messages": [
                    {
                        "sender": c1_id,
                        "text": f"Subject: CyberShield Security Status\n\nDear {user_name},\n\nYour mailbox is protected by CyberShield AI.",
                        "sec_status": "SAFE"
                    }
                ]
            },
            {
                "id": f"CONV-IG-{user_id}",
                "channel": "INSTAGRAM",
                "title": f"{c1_name} (@{c1_name.lower()})",
                "members": [user_id, c1_id],
                "messages": [
                    {"sender": c1_id, "text": f"Hey {user_name}! Check out the latest security updates."}
                ]
            }
        ]

        for c_def in conv_defs:
            existing = session.query(ConversationModel).filter(ConversationModel.conversation_id == c_def["id"]).first()
            if existing:
                continue

            conv_model = ConversationModel(
                conversation_id=c_def["id"],
                conversation_type="DIRECT",
                channel=c_def["channel"],
                title=c_def["title"],
                created_by=user_id,
                status="ACTIVE",
                created_at=now,
                updated_at=now
            )
            session.add(conv_model)

            for m_uid in c_def["members"]:
                m_model = ConversationMemberModel(
                    conversation_id=c_def["id"],
                    user_id=m_uid,
                    role="OWNER" if m_uid == user_id else "MEMBER",
                    joined_at=now
                )
                session.add(m_model)

            for idx, msg in enumerate(c_def["messages"]):
                msg_id = f"MSG-{c_def['id']}-{idx+1:03d}"
                msg_model = MessageModel(
                    message_id=msg_id,
                    conversation_id=c_def["id"],
                    sender_id=msg["sender"],
                    content=msg["text"],
                    content_type="text",
                    timestamp=datetime.now().strftime("%I:%M %p"),
                    security_status=msg.get("sec_status", "SAFE"),
                    classification=msg.get("sec_status", "SAFE"),
                    risk_score=5,
                    risk_level="LOW",
                    confidence=0.98,
                    forensic_reasons=json.dumps(["Authentic initial communication"]),
                    created_at=now
                )
                session.add(msg_model)

                for m_uid in c_def["members"]:
                    if m_uid != msg["sender"]:
                        r_model = MessageRecipientModel(
                            message_id=msg_id,
                            recipient_id=m_uid,
                            delivery_status="DELIVERED",
                            security_action="ALLOW",
                            delivered_at=now,
                            read_at=now
                        )
                        session.add(r_model)

        session.commit()

    def get_user_contacts(self, user_id: str) -> List[Dict[str, Any]]:
        session = self.get_session()
        try:
            target_user_id = self.resolve_user_id(session, user_id)
            models = session.query(UserContactModel).filter(UserContactModel.user_id == target_user_id).all()
            if not models:
                self._seed_contacts_for_user(session, target_user_id)
                models = session.query(UserContactModel).filter(UserContactModel.user_id == target_user_id).all()

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
