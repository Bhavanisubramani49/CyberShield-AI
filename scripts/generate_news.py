import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import (make_rng, sample_classification, risk_score_for, risk_level_for,
                     ground_truth_for, gen_id, random_timestamp, explanation_for,
                     INDICATOR_LIBRARY)

CATEGORIES = ["technology", "education", "science", "sports", "weather", "entertainment", "business"]
SAFE_HEADLINES = [
    "Local university launches new AI research lab",
    "City council approves new public park funding",
    "Regional cricket team advances to finals",
    "Weather department forecasts mild showers this week",
    "New startup incubator opens for student founders",
    "Annual science fair draws record participation",
]
FAKE_HEADLINES = [
    "BREAKING: Miracle device claims to cure all illness overnight",
    "Government to give free phones to everyone, claims viral post",
    "Scientists 'confirm' the earth will stop rotating next week",
    "Celebrity 'announces' shocking retirement in leaked fake statement",
    "Bank 'to shut down' all accounts, unverified rumor spreads",
]
THREAT_TYPE_MAP = {
    "phishing": ["impersonated_source"],
    "malicious": ["fabricated_news", "synthetic_article"],
    "suspicious": ["manipulated_quote", "false_claim"],
    "manipulated": ["misleading_headline", "manipulated_image"],
    "safe": ["none"],
}
BODY_SAFE = ("Officials confirmed the initiative during a press briefing on {d}. "
             "The program is expected to roll out in phases over the coming months, "
             "with community feedback sessions planned throughout the region.")
BODY_FAKE = ("The claim has spread widely on social media, though no credible official "
             "source has confirmed the story. Fact-checkers note the article uses "
             "unverifiable quotes and an unattributed source to support its claims.")


def generate(users, seed, min_records_per_user=52):
    records = []
    global_record_counter = 1

    for u_idx, u in enumerate(users):
        u_id = u["user_id"]
        user_rng = make_rng(seed, u_id, "news")

        for i in range(min_records_per_user):
            rid = gen_id("NEWS", global_record_counter)
            global_record_counter += 1

            cls = sample_classification(user_rng)
            score = risk_score_for(cls, user_rng)
            level = risk_level_for(score)
            indicators = user_rng.sample(INDICATOR_LIBRARY.get(cls, []), k=min(len(INDICATOR_LIBRARY.get(cls, [])), user_rng.randint(0, 3))) if cls != "safe" else []
            threat_type = user_rng.choice(THREAT_TYPE_MAP.get(cls, ["none"]))
            is_fake = cls in ("phishing", "malicious", "manipulated")
            headline = user_rng.choice(FAKE_HEADLINES if is_fake else SAFE_HEADLINES)
            body = (BODY_FAKE if is_fake else BODY_SAFE).format(d="2026-09-%02d" % user_rng.randint(1, 28))

            rec = {
                "record_id": rid,
                "user_id": u_id,
                "platform": "news",
                "content_type": "article",
                "headline": headline,
                "content": headline + ". " + body,
                "author": f"Reporter-{user_rng.randint(100, 999)}",
                "publication_date": random_timestamp(user_rng),
                "source": "CyberShield Times" if not is_fake else user_rng.choice(["dailybuzz.test", "viralnow.test"]),
                "category": user_rng.choice(CATEGORIES),
                "url": f"https://{'cybershieldtimes.test' if not is_fake else user_rng.choice(['dailybuzz.test','viralnow.test'])}/article/{rid.lower()}",
                "claims": [headline],
                "entities": [user_rng.choice(["Local University", "City Council", "Regional Team", "Ministry"])],
                "classification": cls,
                "risk_score": score,
                "risk_level": level,
                "threat_type": threat_type,
                "threat_indicators": indicators,
                "explanation": explanation_for(cls, indicators, "news"),
                "recommended_action": "block" if level == "critical" else ("warn" if level in ("high", "medium") else "allow"),
                "ground_truth": ground_truth_for(cls),
                "duplicate_group_id": None,
                "attack_chain_id": None,
                "source_template_id": f"news_tpl_{hash(headline) % 500}",
            }
            records.append(rec)
    return records
