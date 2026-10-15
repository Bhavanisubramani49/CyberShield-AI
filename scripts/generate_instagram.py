import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import (make_rng, sample_classification, risk_score_for, risk_level_for,
                     ground_truth_for, gen_id, random_timestamp, explanation_for,
                     INDICATOR_LIBRARY)

CONTENT_TYPES = ["dm_message", "feed_post", "reel_caption", "story_reply"]
SAFE_CAPTIONS = [
    "Exploring the new campus library spaces! #CampusLife #StudyVibes",
    "Weekend coding marathon complete! Excited for the upcoming demo. #Developer #Python",
    "Beautiful sunset view from the terrace today. #Photography #Nature",
    "Quick coffee break before evening lectures. #CollegeLife #Coffee",
]
THREAT_CAPTIONS = [
    "CLAIM FREE IPHONE NOW: Click link in bio or visit security-demo.test/gift immediately! #FreeGift #Winner",
    "INSTAGRAM AUDIT NOTICE: Your account violates copyright. Verify identity at example.test/audit #Alert",
    "UNCLAIMED REWARD: You have ₹10,000 pending cash refund. Claim at example.invalid/refund #CashPrize",
]
THREAT_TYPE_MAP = {
    "phishing": ["fake_copyright_notice", "link_in_bio_phishing"],
    "malicious": ["scam_giveaway", "fake_brand_voucher"],
    "suspicious": ["suspicious_handle", "unverified_contest"],
    "manipulated": ["doctored_screenshot"],
    "safe": ["none"],
}


def generate(users, seed, min_entities_per_user=52):
    from common import FIRST_NAMES, LAST_NAMES
    records = []
    global_record_counter = 1

    for u_idx, u in enumerate(users):
        u_id = u["user_id"]
        user_rng = make_rng(seed, u_id, "instagram")
        u_suffix = u_id.lower().replace("_", "")[-4:]

        entities = []
        name_indices = list(range(len(FIRST_NAMES)))
        user_rng.shuffle(name_indices)

        for i in range(min_entities_per_user):
            fn = FIRST_NAMES[name_indices[i % len(FIRST_NAMES)]]
            ln = user_rng.choice(LAST_NAMES)
            cid = f"CNT-IG-{u_id}-{i+1:03d}"
            handle = f"{fn.lower()}_{ln.lower()}_{u_suffix}"
            display_name = f"{fn} {ln}"
            entities.append((cid, handle, display_name))

        for e_idx, (cid, handle, display_name) in enumerate(entities):
            conv_id = f"CONV-IG-{u_id}-{e_idx+1:03d}"
            rid = gen_id("IG", global_record_counter)
            global_record_counter += 1

            ctype = user_rng.choice(CONTENT_TYPES)
            cls = sample_classification(user_rng)
            score = risk_score_for(cls, user_rng)
            level = risk_level_for(score)
            pool = INDICATOR_LIBRARY.get(cls, [])
            k_val = min(len(pool), user_rng.randint(0, 3))
            indicators = user_rng.sample(pool, k=k_val) if cls != "safe" else []
            threat_type = user_rng.choice(THREAT_TYPE_MAP.get(cls, ["none"]))
            caption = user_rng.choice(THREAT_CAPTIONS if cls in ("phishing", "malicious") else SAFE_CAPTIONS if cls == "safe" else SAFE_CAPTIONS + THREAT_CAPTIONS)
            hashtags = ["#" + w.strip("#") for w in caption.split() if w.startswith("#")]

            rec = {
                "record_id": rid,
                "user_id": u_id,
                "platform": "instagram",
                "content_type": ctype,
                "timestamp": random_timestamp(user_rng),
                "author_id": cid,
                "author_handle": handle,
                "author_name": display_name,
                "contact_id": cid,
                "contact_name": display_name,
                "sender_id": cid,
                "sender_name": display_name,
                "conversation_id": conv_id,
                "caption": caption,
                "content": caption,
                "hashtags": hashtags,
                "likes_count": user_rng.randint(10, 1500),
                "comments_count": user_rng.randint(2, 85),
                "media_path": f"photos/ig_{rid}.jpg",
                "classification": cls,
                "risk_score": score,
                "risk_level": level,
                "threat_type": threat_type,
                "threat_indicators": indicators,
                "explanation": explanation_for(cls, indicators, "instagram"),
                "recommended_action": "allow" if cls == "safe" else ("block" if level == "critical" else "warn"),
                "ground_truth": ground_truth_for(cls),
                "duplicate_group_id": None,
                "attack_chain_id": None,
            }
            records.append(rec)
    return records
