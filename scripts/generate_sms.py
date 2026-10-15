import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import (make_rng, sample_classification, risk_score_for, risk_level_for,
                     ground_truth_for, gen_id, random_timestamp, explanation_for,
                     INDICATOR_LIBRARY)

SAFE_TEMPLATES = [
    "Your order #{n} has been shipped and will arrive by {d}.",
    "Reminder: appointment with Dr. {name} on {d} at 10:00 AM.",
    "School notice: PTA meeting scheduled for {d}.",
    "Your OTP for login is {otp}. Valid for 10 minutes. Do not share.",
    "Bill payment of Rs.{amt} received successfully. Thank you.",
    "Your lab result for test #{n} is now available in your portal.",
    "Class schedule updated for tomorrow. Please check student portal.",
    "Library book return reminder: Due date is {d}.",
]
MALICIOUS_TEMPLATES = [
    "URGENT: Your bank account is suspended. Verify now at security-demo.test/verify",
    "Your KYC has expired. Update immediately at cybershield.test/kyc or lose access.",
    "You have won Rs.{amt} in a lucky draw! Claim at example.test/claim",
    "Your parcel is held at customs. Pay Rs.{fee} at example.test/pay to release it.",
    "Your SIM will be deactivated tonight. Confirm details at security-demo.test/sim",
]
THREAT_TYPE_MAP = {
    "phishing": ["fake_bank_alert", "fake_kyc_request", "fake_lottery_message"],
    "malicious": ["malicious_link", "fake_parcel_scam"],
    "suspicious": ["impersonation", "unverified_offer"],
    "manipulated": ["spoofed_sender_id"],
    "safe": ["none"],
}


def generate(users, seed, min_threads_per_user=52):
    from common import FIRST_NAMES, LAST_NAMES, BANK_SENDERS, SERVICE_SENDERS, OTP_SENDERS
    records = []
    global_record_counter = 1

    for u_idx, u in enumerate(users):
        u_id = u["user_id"]
        user_rng = make_rng(seed, u_id, "sms")

        senders = []
        name_indices = list(range(len(FIRST_NAMES)))
        user_rng.shuffle(name_indices)

        u_suffix = u_id.lower().replace("_", "")[-4:]

        for i in range(min_threads_per_user):
            kind = i % 5
            cid = f"CNT-SMS-{u_id}-{i+1:03d}"
            if kind == 0:
                s_name = user_rng.choice(BANK_SENDERS)
                s_num = f"AD-{s_name[:3].upper()}{u_suffix}"
            elif kind == 1:
                s_name = user_rng.choice(SERVICE_SENDERS)
                s_num = f"VM-{s_name[:3].upper()}{u_suffix}"
            elif kind == 2:
                s_name = user_rng.choice(OTP_SENDERS)
                s_num = f"VK-{s_name[:3].upper()}{u_suffix}"
            else:
                fn = FIRST_NAMES[name_indices[i % len(FIRST_NAMES)]]
                ln = user_rng.choice(LAST_NAMES)
                s_name = f"{fn} {ln}"
                s_num = f"+91{user_rng.randint(7000000000, 9999999999)}"
            senders.append((cid, s_name, s_num))

        for s_idx, (cid, s_name, s_num) in enumerate(senders):
            conv_id = f"CONV-SMS-{u_id}-{s_idx+1:03d}"
            n_msgs = user_rng.randint(3, 5)

            for m_i in range(n_msgs):
                rid = gen_id("SMS", global_record_counter)
                global_record_counter += 1

                cls = sample_classification(user_rng)
                score = risk_score_for(cls, user_rng)
                level = risk_level_for(score)

                if cls != "safe":
                    tmpl = user_rng.choice(MALICIOUS_TEMPLATES)
                    text = tmpl.format(n=user_rng.randint(1000, 9999), d="tomorrow",
                                        name=s_name, otp=user_rng.randint(100000, 999999),
                                        amt=user_rng.randint(5000, 50000), fee=user_rng.randint(100, 500))
                else:
                    tmpl = user_rng.choice(SAFE_TEMPLATES)
                    text = tmpl.format(n=user_rng.randint(1000, 9999), d="tomorrow",
                                        name=s_name, otp=user_rng.randint(100000, 999999),
                                        amt=user_rng.randint(100, 2000))

                pool = INDICATOR_LIBRARY.get(cls, [])
                k_val = min(len(pool), user_rng.randint(0, 3))
                indicators = user_rng.sample(pool, k=k_val) if cls != "safe" else []
                threat = user_rng.choice(THREAT_TYPE_MAP.get(cls, ["none"]))

                direction = "incoming" if m_i % 2 == 0 else "outgoing"
                sender_id = cid if direction == "incoming" else u_id
                receiver_id = u_id if direction == "incoming" else cid

                rec = {
                    "record_id": rid,
                    "user_id": u_id,
                    "platform": "sms",
                    "content_type": "text",
                    "timestamp": random_timestamp(user_rng),
                    "sender_id": sender_id,
                    "sender_name": s_name if direction == "incoming" else u["name"],
                    "sender_number": s_num if direction == "incoming" else "+91 98765 43210",
                    "receiver_id": receiver_id,
                    "receiver_name": u["name"] if direction == "incoming" else s_name,
                    "contact_id": cid,
                    "contact_name": s_name,
                    "contact_number": s_num,
                    "conversation_id": conv_id,
                    "content": text,
                    "direction": direction,
                    "classification": cls,
                    "risk_score": score,
                    "risk_level": level,
                    "threat_type": threat,
                    "threat_indicators": indicators,
                    "explanation": explanation_for(cls, indicators, "sms"),
                    "recommended_action": "allow" if cls == "safe" else ("block" if level == "critical" else "warn"),
                    "ground_truth": ground_truth_for(cls),
                    "duplicate_group_id": None,
                    "attack_chain_id": None,
                }
                records.append(rec)
    return records
