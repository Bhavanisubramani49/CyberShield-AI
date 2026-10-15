import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import (make_rng, gen_id, random_timestamp, explanation_for,
                     INDICATOR_LIBRARY, risk_level_for)

CLASSES = ["SAFE", "SUSPICIOUS", "PHISHING", "MALWARE_SIMULATION", "SCAM", "IMPERSONATION"]
CLASS_WEIGHTS_WEB = [0.45, 0.20, 0.15, 0.08, 0.07, 0.05]
SAFE_PAGES = [
    ("shopdemo.test", "/products", "Demo Shopping — Products"),
    ("campus-portal.test", "/dashboard", "Campus Portal — Student Dashboard"),
    ("cybershield.test", "/news", "CyberShield Community News Demo"),
]
UNSAFE_PAGES = [
    ("security-demo.test", "/verify", "Account Verification Required (Simulation)"),
    ("example.test", "/bank-login", "Secure Bank Login (Simulation)"),
    ("example.invalid", "/social-login", "Confirm Your Social Login (Simulation)"),
]

HTML_SAFE_TEMPLATE = """<!DOCTYPE html>
<html><head><title>{title}</title></head>
<body style="font-family:sans-serif;max-width:640px;margin:40px auto;">
<h1>{title}</h1>
<p>This is a non-functional CyberShield demo page used for training data only.</p>
<p>Domain: {domain}{path}</p>
<nav><a href="#">Home</a> | <a href="#">About</a> | <a href="#">Contact</a></nav>
<hr><p style="color:#888;font-size:12px;">Synthetic demonstration content. No real data collected.</p>
</body></html>"""

HTML_UNSAFE_TEMPLATE = """<!DOCTYPE html>
<html><head><title>{title}</title></head>
<body style="font-family:sans-serif;max-width:640px;margin:40px auto;background:#fafafa;">
<h1 style="color:#b00;">{title}</h1>
<p><strong>NON-FUNCTIONAL SIMULATION</strong> — this page intentionally mimics a phishing
page layout for CyberShield model training. It does not collect or transmit any data;
there is no working form submission.</p>
<div style="border:1px solid #ccc;padding:16px;">
<p>Username: <input disabled placeholder="disabled - demo only"></p>
<p>Password: <input disabled type="password" placeholder="disabled - demo only"></p>
<button disabled>Verify (disabled)</button>
</div>
<p style="color:#888;font-size:12px;">Domain: {domain}{path} — synthetic phishing-pattern demo, safe simulation.</p>
</body></html>"""


def _weighted_choice(rng, items, weights):
    r = rng.random()
    acc = 0
    for it, w in zip(items, weights):
        acc += w
        if r <= acc:
            return it
    return items[-1]


def generate(users, seed, min_records_per_user=52, html_dir=None):
    records = []
    global_record_counter = 1

    for u_idx, u in enumerate(users):
        u_id = u["user_id"]
        user_rng = make_rng(seed, u_id, "web")

        for i in range(min_records_per_user):
            rid = gen_id("URL", global_record_counter)
            global_record_counter += 1

            cls = _weighted_choice(user_rng, CLASSES, CLASS_WEIGHTS_WEB)
            is_safe = (cls == "SAFE")
            domain, path, title = user_rng.choice(SAFE_PAGES if is_safe else UNSAFE_PAGES)
            full_url = f"https://{domain}{path}?user={u_id}&ref={user_rng.randint(1000, 9999)}"

            score = user_rng.randint(2, 25) if is_safe else user_rng.randint(45, 98)
            level = risk_level_for(score)
            pool = INDICATOR_LIBRARY.get(cls.lower(), ["suspicious_domain"])
            k_val = min(len(pool), user_rng.randint(1, 2))
            indicators = user_rng.sample(pool, k=k_val) if not is_safe else []

            rec = {
                "record_id": rid,
                "user_id": u_id,
                "platform": "web",
                "content_type": "url",
                "url": full_url,
                "domain": domain,
                "page_title": title,
                "timestamp": random_timestamp(user_rng),
                "classification": cls.lower(),
                "risk_score": score,
                "risk_level": level,
                "threat_type": "none" if is_safe else "phishing_url",
                "threat_indicators": indicators,
                "explanation": explanation_for(cls.lower(), indicators, "web"),
                "recommended_action": "allow" if is_safe else "block"
            }
            records.append(rec)
    return records
