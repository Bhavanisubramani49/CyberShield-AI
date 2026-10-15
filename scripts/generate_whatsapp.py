import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from common import (make_rng, sample_classification, risk_score_for, risk_level_for,
                     ground_truth_for, gen_id, random_timestamp, explanation_for,
                     INDICATOR_LIBRARY, TOPICS_SAFE_TEXT, TOPICS_PHISHING_TEXT,
                     TOPICS_SUSPICIOUS_TEXT, write_jsonl)

CONTENT_TYPES = ["text", "text", "text", "image", "video", "document", "voice_note", "link"]
THREAT_TYPE_MAP = {
    "phishing": ["credential_phishing", "otp_scam", "fake_bank_alert", "lottery_scam"],
    "malicious": ["malicious_url", "suspicious_attachment", "account_takeover_attempt"],
    "suspicious": ["social_engineering", "unknown_sender_request", "urgency_manipulation"],
    "manipulated": ["forwarded_manipulated_media"],
    "safe": ["none"],
}
GROUP_NAMES = ["College Friends", "Family Group", "Project Team", "Hostel Block C",
               "Cricket Club", "Office Colleagues", "Weekend Trip Planning"]


def _content_for(cls, ctype, rng):
    if ctype == "text":
        pool = {"safe": TOPICS_SAFE_TEXT, "phishing": TOPICS_PHISHING_TEXT,
                "suspicious": TOPICS_SUSPICIOUS_TEXT}.get(cls, TOPICS_SUSPICIOUS_TEXT)
        return rng.choice(pool)
    if ctype == "link":
        domain = rng.choice(["example.test", "cybershield.test", "security-demo.test"])
        path = rng.choice(["verify", "account/confirm", "offer", "news/update", "portal/login"])
        return f"https://{domain}/{path}?ref={rng.randint(1000,9999)}"
    if ctype == "image":
        return "[image attachment]"
    if ctype == "video":
        return "[video attachment]"
    if ctype == "document":
        return rng.choice(["invoice.pdf", "assignment.docx", "report.xlsx", "Update_Document.pdf"])
    if ctype == "voice_note":
        return "[voice note, 0:%02d]" % rng.randint(5, 59)
    return ""


def generate(users, seed, min_contacts_per_user=52):
    from common import FIRST_NAMES, LAST_NAMES
    records = []
    global_record_counter = 1

    for u_idx, u in enumerate(users):
        u_id = u["user_id"]
        user_rng = make_rng(seed, u_id, "whatsapp")

        # Select 50+ distinct contact names deterministically for this user
        contact_names = []
        name_indices = list(range(len(FIRST_NAMES)))
        user_rng.shuffle(name_indices)
        
        for i in range(min_contacts_per_user):
            fn = FIRST_NAMES[name_indices[i % len(FIRST_NAMES)]]
            ln = user_rng.choice(LAST_NAMES)
            contact_names.append(f"{fn} {ln}")

        for c_idx, c_name in enumerate(contact_names):
            is_group = user_rng.random() < 0.20
            group_name = user_rng.choice(GROUP_NAMES) if is_group else None
            conv_id = f"CONV-WA-{u_id}-{c_idx+1:03d}"
            contact_id = f"CNT-WA-{u_id}-{c_idx+1:03d}"

            # 4 to 8 messages per conversation thread
            n_msgs = user_rng.randint(4, 8)
            for m_idx in range(n_msgs):
                rid = gen_id("WA", global_record_counter)
                global_record_counter += 1

                ctype = user_rng.choice(CONTENT_TYPES)
                cls = sample_classification(user_rng)
                if ctype in ("document", "link") and cls == "safe" and user_rng.random() < 0.15:
                    cls = "suspicious"
                score = risk_score_for(cls, user_rng)
                level = risk_level_for(score)
                indicators = user_rng.sample(INDICATOR_LIBRARY.get(cls, []), k=min(len(INDICATOR_LIBRARY.get(cls, [])), user_rng.randint(0, 3))) if cls != "safe" else []
                threat_type = user_rng.choice(THREAT_TYPE_MAP.get(cls, ["none"]))
                content = _content_for(cls, ctype, user_rng)
                is_incoming = user_rng.random() < 0.6

                rec = {
                    "record_id": rid,
                    "user_id": u_id,
                    "platform": "whatsapp",
                    "content_type": ctype,
                    "timestamp": random_timestamp(user_rng),
                    "sender_id": contact_id if is_incoming else u_id,
                    "sender_name": c_name if is_incoming else u["name"],
                    "receiver_id": u_id if is_incoming else contact_id,
                    "receiver_name": u["name"] if is_incoming else c_name,
                    "contact_id": contact_id,
                    "contact_name": c_name,
                    "conversation_id": conv_id,
                    "is_group": is_group,
                    "group_name": group_name,
                    "content": content,
                    "direction": "incoming" if is_incoming else "outgoing",
                    "is_forwarded": user_rng.random() < 0.08,
                    "read_state": user_rng.choice(["read", "delivered", "sent"]),
                    "reactions": user_rng.choice([[], [], ["👍"], ["❤️"], ["😂"]]),
                    "classification": cls,
                    "risk_score": score,
                    "risk_level": level,
                    "threat_type": threat_type,
                    "threat_indicators": indicators,
                    "explanation": explanation_for(cls, indicators, "whatsapp"),
                    "recommended_action": "block" if level == "critical" else ("warn" if level in ("high", "medium") else "allow"),
                    "ground_truth": ground_truth_for(cls),
                    "duplicate_group_id": None,
                    "attack_chain_id": None,
                    "source_template_id": f"wa_tpl_{hash(content) % 500}",
                }
                records.append(rec)
    return records


if __name__ == "__main__":
    print("Run via generate_all.py")
