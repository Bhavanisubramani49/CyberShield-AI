import re
from typing import List, Dict, Any, Tuple

def extract_urgency_indicators(text: str) -> List[str]:
    indicators = []
    text_lower = text.lower()
    urgent_keywords = ["urgent", "immediately", "immediate", "suspended", "action required", "within 24 hours", "freeze", "deactivation", "expires today"]
    for kw in urgent_keywords:
        if kw in text_lower:
            indicators.append(f"Urgent pressure phrase detected: '{kw}'")
    return indicators

def extract_financial_incentives(text: str) -> List[str]:
    indicators = []
    text_lower = text.lower()
    prize_keywords = ["won", "lottery", "lakh", "crore", "prize", "claim now", "cash bonus", "free reward", "reward points", "deposit"]
    for kw in prize_keywords:
        if kw in text_lower:
            indicators.append(f"Unsolicited financial lure: '{kw}'")
    return indicators

def extract_url_lexical_features(url: str) -> Dict[str, Any]:
    url_lower = url.lower().strip()
    is_ip = bool(re.search(r"http://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", url_lower))
    has_https = url_lower.startswith("https://")
    suspicious_tld = any(url_lower.endswith(tld) or f"{tld}/" in url_lower for tld in [".xyz", ".top", ".club", ".click", ".stream", ".bank-verify.net"])
    suspicious_keywords = [w for w in ["login", "verify", "secure", "update", "banking", "free-reward", "account"] if w in url_lower]
    subdomain_count = url_lower.split("?")[0].count(".")
    
    return {
        "url": url,
        "is_ip_host": is_ip,
        "has_https": has_https,
        "suspicious_tld": suspicious_tld,
        "suspicious_keywords": suspicious_keywords,
        "subdomain_count": subdomain_count,
        "length": len(url_lower)
    }

def extract_profile_anomaly_metrics(followers: int, following: int, username: str, bio: str) -> Dict[str, Any]:
    username_lower = username.lower()
    bio_lower = bio.lower()
    
    ratio = (following / max(1, followers))
    is_bot_pattern = any(w in username_lower for w in ["bot", "giveaway", "crypto_reward", "earn_fast", "lottery"])
    has_spam_bio = any(w in bio_lower for w in ["instant bonus", "claim cash", "dm to earn", "crypto giveaway", "free money"])
    
    return {
        "follower_ratio": round(ratio, 2),
        "is_bot_pattern": is_bot_pattern,
        "has_spam_bio": has_spam_bio,
        "low_follower_high_following": following > 1500 and followers < 50
    }

def extract_file_signature_risks(filename: str, file_type: str) -> Dict[str, Any]:
    fn_lower = filename.lower().strip()
    dangerous_exts = [".exe", ".bat", ".xlsm", ".vbs", ".scr", ".js", ".ps1", ".hta", ".cmd"]
    is_dangerous_ext = any(fn_lower.endswith(ext) for ext in dangerous_exts)
    has_double_ext = bool(re.search(r"\.[a-z0-9]+\.(exe|bat|vbs|js|scr|xlsm)$", fn_lower))
    
    return {
        "filename": filename,
        "is_dangerous_ext": is_dangerous_ext,
        "has_double_ext": has_double_ext,
        "macro_risk": ".xlsm" in fn_lower or "macro" in file_type.lower()
    }
