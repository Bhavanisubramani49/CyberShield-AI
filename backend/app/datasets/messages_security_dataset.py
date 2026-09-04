"""
CyberShield AI — Synthetic Messages / SMS Security Dataset
=========================================================

This module provides a synthetic benchmark dataset for Android Messages / SMS security testing.
It integrates with existing CyberShield AI threat detection models:
- sms_scam_detection_ai
- url_threat_detection_ai
- file_security_pipeline
- social_engineering_detector
"""

from typing import List, Dict, Any

MESSAGES_SECURITY_DATASET: List[Dict[str, Any]] = [
    {
        "id": "SMS-DS-001",
        "category": "SAFE_PERSONAL",
        "sender": "+91 98765 43210",
        "sender_name": "Riya",
        "content": "Hey Kavin, are you coming to class today?",
        "expected_classification": "SAFE",
        "expected_risk_score": 5,
        "reasons": ["Normal interpersonal greeting", "No urgent financial request or suspicious link"]
    },
    {
        "id": "SMS-DS-002",
        "category": "SAFE_PERSONAL",
        "sender": "+91 98765 43211",
        "sender_name": "Arun",
        "content": "Can you send me the project notes when free?",
        "expected_classification": "SAFE",
        "expected_risk_score": 8,
        "reasons": ["Legitimate academic request", "Known contact relationship"]
    },
    {
        "id": "SMS-DS-003",
        "category": "OTP_SAFE",
        "sender": "VK-HDFCBK",
        "sender_name": "HDFC Bank Alert",
        "content": "Your OTP for transaction of Rs. 1,500 at Amazon is 483921. Do not share it with anyone.",
        "expected_classification": "SAFE",
        "expected_risk_score": 12,
        "reasons": ["Standard bank 2FA notification", "Clear security disclaimers"]
    },
    {
        "id": "SMS-DS-004",
        "category": "PHISHING_BANK",
        "sender": "+91 98765 43299",
        "sender_name": "Unknown",
        "content": "URGENT! Your bank debit card is locked due to unauthorized $850 charge. Verify PIN immediately at http://192.168.1.10/verify-bank",
        "expected_classification": "PHISHING",
        "expected_risk_score": 96,
        "reasons": ["Direct IP host phishing URL", "High-urgency fear-inducing language", "Unauthorized PIN verification prompt"]
    },
    {
        "id": "SMS-DS-005",
        "category": "SMS_SCAM_LOTTERY",
        "sender": "+91 98765 43298",
        "sender_name": "Lottery Win",
        "content": "Congratulations! You won ₹50,000 scholarship prize! Claim now immediately at http://192.168.1.1/claim-cash",
        "expected_classification": "SCAM",
        "expected_risk_score": 94,
        "reasons": ["Unsolicited financial prize claim", "Suspicious claim link", "Phishing scam pattern"]
    },
    {
        "id": "SMS-DS-006",
        "category": "SOCIAL_ENGINEERING_KYC",
        "sender": "+91 98765 43297",
        "sender_name": "SIM Verification",
        "content": "Your SIM card will be deactivated today within 2 hours. Complete mandatory KYC verification immediately at http://192.168.1.20/kyc-update",
        "expected_classification": "SOCIAL_ENGINEERING",
        "expected_risk_score": 90,
        "reasons": ["Artificially manufactured time pressure", "KYC deactivation threat", "Unverified external link"]
    },
    {
        "id": "SMS-DS-007",
        "category": "PARCEL_SCAM",
        "sender": "+91 98765 43296",
        "sender_name": "Courier Express",
        "content": "Your package could not be delivered due to invalid address. Pay ₹25 redelivery fee here: http://192.168.1.30/pay-courier",
        "expected_classification": "SCAM",
        "expected_risk_score": 88,
        "reasons": ["Smishing parcel scam signature", "Low nominal fee lure", "Phishing payment capture"]
    },
    {
        "id": "SMS-DS-008",
        "category": "SUSPICIOUS_ATTACHMENT",
        "sender": "+91 98765 43211",
        "sender_name": "Arun",
        "content": "Please review this urgent invoice document: Urgent_Invoice_March2026.docm",
        "expected_classification": "MALICIOUS",
        "expected_risk_score": 92,
        "reasons": ["Macro-enabled Word document (.docm)", "High risk of VBA script execution"]
    }
]

def get_messages_dataset_metadata() -> Dict[str, Any]:
    """Returns synthetic SMS dataset metadata, sample count, and model attribution."""
    categories = list(set(d["category"] for d in MESSAGES_SECURITY_DATASET))
    safe_count = sum(1 for d in MESSAGES_SECURITY_DATASET if d["expected_classification"] == "SAFE")
    threat_count = sum(1 for d in MESSAGES_SECURITY_DATASET if d["expected_classification"] != "SAFE")

    return {
        "dataset_name": "CyberShield Synthetic Messages / SMS Security Dataset v1.0",
        "total_samples": len(MESSAGES_SECURITY_DATASET),
        "safe_samples": safe_count,
        "threat_samples": threat_count,
        "categories": categories,
        "reused_detectors": [
            "sms_scam_detection_ai",
            "url_threat_detection_ai",
            "file_security_pipeline"
        ],
        "samples": MESSAGES_SECURITY_DATASET
    }
