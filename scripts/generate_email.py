import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import (make_rng, sample_classification, risk_score_for, risk_level_for,
                     ground_truth_for, gen_id, random_timestamp, explanation_for,
                     INDICATOR_LIBRARY)

SAFE_SUBJECTS = [
    ("Project Architecture Review Meeting", "Hi team, please find attached the architecture review notes for our upcoming milestone."),
    ("Semester Assignment Guidelines", "Hello students, the guidelines for the final assignment have been published on the portal."),
    ("Library Book Return Confirmation", "Thank you for returning the requested textbook. Your account has no pending dues."),
    ("Campus Event Invitation: CyberShield Workshop", "You are invited to participate in our hands-on cybersecurity defense workshop this Friday."),
    ("Weekly Research Sync Notes", "Here is a quick summary of key takeaways from our weekly research group meeting."),
]
THREAT_SUBJECTS = [
    ("URGENT: Account Access Suspended — Action Required", "Your account shows suspicious activity. Re-verify your password immediately at security-demo.test/login"),
    ("Invoice Payment Overdue Notice", "Attached is the overdue invoice. Please process payment immediately at example.test/pay"),
    ("Unusual Login Attempt Detected", "A login from an unknown location was blocked. Confirm identity at cybershield.test/verify"),
    ("Important Tax Refund Document", "Download your official tax refund receipt attached to claim your refund."),
]
FOLDERS = ["inbox", "sent", "archive", "spam", "drafts"]
THREAT_TYPE_MAP = {
    "phishing": ["credential_harvesting", "fake_security_alert"],
    "malicious": ["malicious_attachment", "suspicious_redirect"],
    "suspicious": ["unverified_domain", "unusual_header"],
    "manipulated": ["spoofed_header"],
    "safe": ["none"],
}


def generate(users, seed, min_threads_per_user=52):
    from common import FIRST_NAMES, LAST_NAMES, NEWSLETTER_SENDERS, SERVICE_SENDERS
    records = []
    global_record_counter = 1

    for u_idx, u in enumerate(users):
        u_id = u["user_id"]
        user_rng = make_rng(seed, u_id, "email")
        u_suffix = u_id.lower().replace("_", "")[-4:]

        senders = []
        name_indices = list(range(len(FIRST_NAMES)))
        user_rng.shuffle(name_indices)

        for i in range(min_threads_per_user):
            cid = f"CNT-EMAIL-{u_id}-{i+1:03d}"
            kind = i % 4
            if kind == 0:
                s_name = user_rng.choice(NEWSLETTER_SENDERS)
                s_email = f"news-{u_suffix}@{s_name.lower().replace(' ', '')[:10]}.test"
            elif kind == 1:
                s_name = user_rng.choice(SERVICE_SENDERS)
                s_email = f"no-reply-{u_suffix}@{s_name.lower().replace(' ', '')[:10]}.com"
            else:
                fn = FIRST_NAMES[name_indices[i % len(FIRST_NAMES)]]
                ln = user_rng.choice(LAST_NAMES)
                s_name = f"{fn} {ln}"
                s_email = f"{fn.lower()}.{ln.lower()}.{u_suffix}@cybershield.local"
            senders.append((cid, s_name, s_email))

        for s_idx, (cid, s_name, s_email) in enumerate(senders):
            conv_id = f"CONV-EMAIL-{u_id}-{s_idx+1:03d}"
            n_msgs = user_rng.randint(4, 7) # ~200+ email messages per user

            for m_idx in range(n_msgs):
                rid = gen_id("EM", global_record_counter)
                global_record_counter += 1

                cls = sample_classification(user_rng)
                score = risk_score_for(cls, user_rng)
                level = risk_level_for(score)
                pool = INDICATOR_LIBRARY.get(cls, [])
                k_val = min(len(pool), user_rng.randint(0, 3))
                indicators = user_rng.sample(pool, k=k_val) if cls != "safe" else []
                threat_type = user_rng.choice(THREAT_TYPE_MAP.get(cls, ["none"]))
                subject, body = user_rng.choice(THREAT_SUBJECTS if cls in ("phishing", "malicious") else SAFE_SUBJECTS)
                folder = "spam" if cls in ("phishing", "malicious") and user_rng.random() < 0.6 else user_rng.choice(FOLDERS)
                has_attachment = user_rng.random() < (0.5 if cls in ("phishing", "malicious") else 0.15)
                att_name = f"attachment_{rid}.pdf" if has_attachment else None

                direction = "incoming" if m_idx % 2 == 0 else "outgoing"
                sender_id = cid if direction == "incoming" else u_id
                receiver_id = u_id if direction == "incoming" else cid
                user_email = u.get("email") or f"{u['name'].lower()}@cybershield.local"

                rec = {
                    "record_id": rid,
                    "user_id": u_id,
                    "platform": "email",
                    "content_type": "text",
                    "timestamp": random_timestamp(user_rng),
                    "sender_id": sender_id,
                    "sender_name": s_name if direction == "incoming" else u["name"],
                    "sender_email": s_email if direction == "incoming" else user_email,
                    "receiver_id": receiver_id,
                    "receiver_name": u["name"] if direction == "incoming" else s_name,
                    "receiver_email": user_email if direction == "incoming" else s_email,
                    "contact_id": cid,
                    "contact_name": s_name,
                    "contact_email": s_email,
                    "conversation_id": conv_id,
                    "subject": subject,
                    "body": body,
                    "content": f"Subject: {subject}\n\n{body}",
                    "folder": folder,
                    "has_attachment": has_attachment,
                    "attachment_name": att_name,
                    "direction": direction,
                    "classification": cls,
                    "risk_score": score,
                    "risk_level": level,
                    "threat_type": threat_type,
                    "threat_indicators": indicators,
                    "explanation": explanation_for(cls, indicators, "email"),
                    "recommended_action": "allow" if cls == "safe" else ("block" if level == "critical" else "warn"),
                    "ground_truth": ground_truth_for(cls),
                    "duplicate_group_id": None,
                    "attack_chain_id": None,
                }
                records.append(rec)
    return records
