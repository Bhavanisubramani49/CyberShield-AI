"""
CyberShield AI Dataset Generator — shared core.

Everything here is deterministic given a seed: the same --seed always
produces the same users, records, and asset content.
"""
import hashlib
import json
import os
import random
import string
from datetime import datetime, timedelta

# ------------------------------------------------------------------
# Taxonomy (Section 35)
# ------------------------------------------------------------------
THREAT_TAXONOMY = [
    "PHISHING", "CREDENTIAL_THEFT", "SOCIAL_ENGINEERING", "SCAM",
    "MALICIOUS_URL", "IMPERSONATION", "ACCOUNT_TAKEOVER",
    "MALWARE_SIMULATION", "SUSPICIOUS_ATTACHMENT", "DEEPFAKE",
    "IMAGE_MANIPULATION", "VIDEO_MANIPULATION", "FAKE_NEWS",
    "MISINFORMATION", "DISINFORMATION", "DUPLICATE_CONTENT",
    "SUSPICIOUS_FILE", "BENIGN",
]

CLASS_WEIGHTS = {
    "safe": 0.45,
    "suspicious": 0.20,
    "malicious": 0.20,
    "phishing": 0.10,
    "manipulated": 0.05,
}

RISK_BANDS = {
    "safe": (2, 25),
    "suspicious": (26, 59),
    "malicious": (60, 90),
    "phishing": (70, 100),
    "manipulated": (55, 95),
}

RISK_LEVEL_BY_SCORE = [
    (0, 25, "low"),
    (26, 59, "medium"),
    (60, 84, "high"),
    (85, 101, "critical"),
]

SAFE_DOMAINS = ["example.test", "cybershield.test", "security-demo.test",
                "example.invalid", "campus-portal.test", "shopdemo.test"]

FIRST_NAMES = [
    # South Asia
    "Soorya", "Kavin", "Riya", "Arun", "Priya", "Vikram", "Anitha", "Karthik", "Divya", "Sanjay", "Meera", "Rahul", "Deepa",
    "Naveen", "Swathi", "Praveen", "Lakshmi", "Ashwin", "Nisha", "Ganesh", "Pooja", "Harish", "Kiruthika", "Vignesh", "Sneha",
    "Bala", "Ramya", "Suresh", "Aishwarya", "Manoj", "Keerthi", "Dinesh", "Varsha", "Yogesh", "Nithya", "Arjun", "Shalini",
    "Ravi", "Gayatri", "Mohan", "Preethi", "Siva", "Kavya", "Vasanth", "Anu", "Girish", "Deepika", "Kumar", "Malathi",
    "Senthil", "Sathya", "Tariq", "Fatima", "Zayn", "Ananya", "Aarav", "Ishaan", "Diya", "Reyansh", "Vihaan", "Aditi", "Zoya", "Yusuf",
    # East & Southeast Asia
    "Kenji", "Yuki", "Sakura", "Ren", "Hana", "Mei", "Wei", "Chen", "Jing", "Min", "Seung", "Ji-woo", "Jun", "Linh",
    "Minh", "Somchai", "Apinya", "Siti", "Nur", "Budi", "Dewi", "Leandro", "Marlon", "Chit", "Thant", "Nari", "Haruto",
    # Middle East & North Africa
    "Omar", "Layla", "Amir", "Noor", "Khaled", "Mariam", "Tariq", "Yasmin", "Hassan", "Salma", "Hamza", "Farida", "Zaid",
    # Africa
    "Kwame", "Zuri", "Jabari", "Amara", "Kofi", "Nia", "Tariro", "Tendai", "Obinna", "Chidimma", "Kipkorir", "Amina",
    # Europe
    "Alexander", "Elena", "Mateo", "Sofia", "Lucas", "Emma", "Liam", "Olivia", "Noah", "Chloe", "Maximilian", "Freja",
    "Lars", "Astrid", "Dimitri", "Svetlana", "Pavel", "Ingrid", "Antoine", "Camille", "Matteo", "Giulia", "Jan", "Katarzyna",
    # Americas & Oceania
    "Ethan", "Ava", "Jackson", "Mia", "Gabriel", "Isabella", "Diego", "Valentina", "Santiago", "Camila", "Mason", "Harper",
    "Kai", "Moana", "Caleb", "Zoe", "Logan", "Riley"
]

LAST_NAMES = [
    "Sharma", "Patel", "Rao", "Nair", "Reddy", "Iyer", "Khan", "Singh", "Gupta", "Deshmukh", "Chowdhury",
    "Tanaka", "Sato", "Takahashi", "Kim", "Lee", "Park", "Zhang", "Wang", "Li", "Nguyen", "Tran",
    "Al-Mansoor", "El-Sayed", "Hassan", "Khoury", "Benali", "Osei", "Mensa", "Adeleke", "Okonkwo", "Kamau",
    "Mueller", "Schmidt", "Dubois", "Lefebvre", "Rossi", "Ferrari", "Garcia", "Rodriguez", "Hernandez",
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Taylor", "Anderson"
]

BANK_SENDERS = [
    "HDFC Bank Alerts", "ICICI Bank Security", "State Bank Notice", "Axis Bank OTP", "Citibank Alert",
    "Barclays Security Desk", "HSBC Fraud Protection", "Chase Mobile Alert", "Bank of America Alert", "Wells Fargo Safe"
]

SERVICE_SENDERS = [
    "JioCare", "Airtel Support", "Amazon Logistics", "Flipkart Delivery", "Swiggy Express",
    "Zomato Order Tracker", "Uber Trip Notice", "Ola Ride Alert", "Netflix Account Desk", "Spotify Support"
]

OTP_SENDERS = [
    "VerifyOTP Direct", "AuthKey Service", "SecurePass OTP", "CyberShield Auth", "TwoFactor Express"
]

NEWSLETTER_SENDERS = [
    "TechCrunch Daily Digest", "CyberSecurity Weekly Brief", "Hacker News Digest", "AI Research Quarterly",
    "IEEE Spectrum Newsletter", "MIT Tech Review Insights", "DevOps Weekly Update", "Cloud Security Pulse"
]

TOPICS_SAFE_TEXT = [
    "Can you check the assignment when you get time?",
    "Meeting moved to 4pm tomorrow, see you there.",
    "Happy birthday! Hope you have a great day.",
    "Don't forget to bring the project report.",
    "Lunch at the usual place today?",
    "The lecture notes are uploaded to the portal.",
    "Great match yesterday, did you watch it?",
    "Reminder: submit the feedback form by Friday.",
    "Thanks for helping with the presentation slides.",
    "Let's plan the college fest committee meeting.",
    "Your order has been shipped and will arrive soon.",
    "Family dinner this weekend, are you free?",
    "The internship interview went really well today.",
    "Can we reschedule our call to Thursday?",
    "New semester timetable has been released.",
]

TOPICS_PHISHING_TEXT = [
    "Your account needs urgent verification. Visit the secure verification page to avoid suspension.",
    "We noticed unusual activity on your account. Confirm your identity immediately at the link below.",
    "Your parcel could not be delivered. Pay a small customs fee to release it.",
    "Congratulations! You have won a lottery prize. Claim it now before it expires.",
    "Your bank account will be locked in 24 hours unless you verify your details.",
    "Urgent: your subscription payment failed. Update your payment info now to avoid cancellation.",
    "This is HR. Please review the updated salary document and enter your login to view it.",
    "Limited time offer: invest now and double your money in 7 days, guaranteed returns.",
    "Your KYC is incomplete. Update it now or your SIM will be deactivated.",
    "We are hiring for remote roles with high pay. Register with your bank details to proceed.",
    "Your verification code was requested. Reply with the OTP to confirm it wasn't you.",
    "Someone tried to log into your account from a new device. Click here to secure it now.",
]

TOPICS_SUSPICIOUS_TEXT = [
    "Hey, long time no talk! Can you send me some money, I'm in a tight spot.",
    "Is this still your number? I have an important business proposal for you.",
    "Click this link to see who viewed your profile recently.",
    "I'm stuck abroad and lost my wallet, can you wire some cash quickly?",
    "Special discount just for you, limited stock, buy now before it's gone.",
    "Forwarded: share this message with 10 people or bad luck will follow.",
]

INDICATOR_LIBRARY = {
    "phishing": ["urgency_language", "credential_request", "brand_impersonation",
                 "suspicious_domain", "generic_greeting", "mismatched_sender"],
    "malicious": ["suspicious_attachment", "executable_disguised", "malformed_url",
                  "obfuscated_link", "known_bad_pattern_simulation"],
    "suspicious": ["unusual_request", "unknown_sender", "unverified_claim",
                   "mild_urgency", "off_platform_redirect"],
    "manipulated": ["metadata_mismatch", "compression_artifact_inconsistency",
                    "duplicate_detected", "edit_history_anomaly", "ai_generation_signature"],
    "safe": [],
}


def make_rng(seed, *namespace):
    """Deterministic per-namespace RNG derived from a global seed."""
    h = hashlib.sha256(f"{seed}:{':'.join(str(n) for n in namespace)}".encode()).hexdigest()
    return random.Random(int(h[:16], 16))


def risk_level_for(score):
    for lo, hi, level in RISK_LEVEL_BY_SCORE:
        if lo <= score < hi:
            return level
    return "critical"


def sample_classification(rng):
    r = rng.random()
    acc = 0
    for cls, w in CLASS_WEIGHTS.items():
        acc += w
        if r <= acc:
            return cls
    return "safe"


def risk_score_for(cls, rng):
    lo, hi = RISK_BANDS[cls]
    # allow slight boundary overlap
    lo = max(1, lo - rng.randint(0, 3))
    hi = min(100, hi + rng.randint(0, 3))
    return rng.randint(lo, hi)


def ground_truth_for(cls):
    return "benign" if cls == "safe" else ("suspicious" if cls == "suspicious" else "malicious")


def gen_id(prefix, n):
    return f"{prefix}_{n:06d}"


def random_timestamp(rng, start_days_ago=180):
    base = datetime(2026, 9, 6)
    delta = timedelta(days=rng.randint(0, start_days_ago),
                       hours=rng.randint(0, 23), minutes=rng.randint(0, 59))
    return (base - delta).isoformat() + "Z"


def sha256_of_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        h.update(f.read())
    return h.hexdigest()


def shannon_entropy(data: bytes):
    import math
    if not data:
        return 0.0
    freq = {}
    for b in data:
        freq[b] = freq.get(b, 0) + 1
    n = len(data)
    return -sum((c / n) * math.log2(c / n) for c in freq.values())


def build_users(seed, n_users=50):
    rng = make_rng(seed, "users")
    users = []
    names = FIRST_NAMES[:]
    rng.shuffle(names)
    for i in range(1, n_users + 1):
        name = names[(i - 1) % len(names)]
        # disambiguate repeats when n_users > len(FIRST_NAMES)
        suffix = "" if i <= len(names) else str(i)
        uid = gen_id("USER", i)
        handle_base = f"{name.lower()}{suffix}"
        users.append({
            "user_id": uid,
            "name": name + (f" {suffix}" if suffix else ""),
            "email": f"{handle_base}@cybershield.local",
            "phone": f"+91{rng.randint(7000000000, 9999999999)}",
            "whatsapp_handle": handle_base,
            "instagram_handle": f"{handle_base}_official" if rng.random() < 0.3 else handle_base,
            "split_group": "train" if i <= int(n_users * 0.8) else "holdout_test",
        })
    return users


def write_jsonl(path, records):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def explanation_for(cls, indicators, platform):
    if cls == "safe":
        return "No security indicators found. Content is consistent with routine, benign activity on this platform."
    ind_txt = ", ".join(i.replace("_", " ") for i in indicators) if indicators else "general risk pattern"
    templates = {
        "phishing": f"High-risk phishing pattern detected on {platform}. Indicators: {ind_txt}.",
        "malicious": f"Malicious-pattern simulation detected on {platform}. Indicators: {ind_txt}.",
        "suspicious": f"Suspicious activity detected on {platform} that does not meet the threshold for a confirmed threat. Indicators: {ind_txt}.",
        "manipulated": f"Content manipulation indicators detected on {platform}. Indicators: {ind_txt}.",
    }
    return templates.get(cls, f"Indicators detected on {platform}: {ind_txt}.")


def split_bucket(rng, group_key_val, ratios=(0.70, 0.15, 0.15)):
    """Deterministic split by hashing a grouping key so duplicate/attack-chain
    groups always land together (no train/test leakage)."""
    h = int(hashlib.sha256(str(group_key_val).encode()).hexdigest()[:8], 16) / 0xFFFFFFFF
    if h < ratios[0]:
        return "train"
    elif h < ratios[0] + ratios[1]:
        return "validation"
    return "test"
