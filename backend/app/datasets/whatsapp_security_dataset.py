"""
CyberShield AI — Synthetic WhatsApp Security Dataset & Model Registry Metadata
================================================================================
This dataset contains synthetic, non-malicious security evaluation samples for WhatsApp
communication channels across text, links, photos, videos, and document attachments.

Model Integration Architecture:
--------------------------------
WhatsApp incoming payloads pass through CyberShield AI's unified multimodal model registry:
- Text Scams / SMS Fraud: `sms_scam_detection_ai`
- Phishing Links / Deceptive URLs: `url_threat_detection_ai`
- Spear-Phishing / Impersonation: `email_phishing_detection_ai` / `fake_profile_analyzer_ai`
- Manipulated Media / Receipts: `image_manipulation_ai`
- Deepfake Stream Verification: `deepfake_video_pipeline`
- Fake News / Disinformation Rumors: `fake_news_classifier_ai`
- Macro Documents / File Security: `file_security_pipeline`
"""

WHATSAPP_SECURITY_DATASET = [
    {
        "sample_id": "WA-DS-001",
        "category": "SAFE",
        "content_type": "text",
        "text": "Hey Kavin, are you available for the team project meeting at 4 PM?",
        "expected_classification": "SAFE",
        "expected_risk_score": 5,
        "reasoning": "Standard academic and project coordination text with no deceptive intent or urgency."
    },
    {
        "sample_id": "WA-DS-002",
        "category": "PHISHING",
        "content_type": "text",
        "text": "URGENT! Your bank debit card is suspended due to $850 fraud. Verify your PIN now at http://192.168.1.10/verify-bank",
        "expected_classification": "PHISHING",
        "expected_risk_score": 94,
        "reasoning": "Urgent credential request, suspicious IP link, account suspension threat."
    },
    {
        "sample_id": "WA-DS-003",
        "category": "SCAM",
        "content_type": "text",
        "text": "Congratulations! You won ₹50,000 lottery cash prize! Click here immediately to claim: http://192.168.1.1/claim-cash",
        "expected_classification": "SCAM",
        "expected_risk_score": 96,
        "reasoning": "Financial lottery lure, unverified reward link, artificial urgency."
    },
    {
        "sample_id": "WA-DS-004",
        "category": "SAFE",
        "content_type": "text",
        "text": "Can you please share the assignment notes for Chapter 4?",
        "expected_classification": "SAFE",
        "expected_risk_score": 8,
        "reasoning": "Benign peer study request."
    },
    {
        "sample_id": "WA-DS-005",
        "category": "SOCIAL_ENGINEERING",
        "content_type": "text",
        "text": "FREE CRYPTO AIRDROP: Double your BTC instantly! Send 0.1 BTC to receive 0.5 BTC back immediately at http://192.168.1.200/crypto-giveaway.php",
        "expected_classification": "SCAM",
        "expected_risk_score": 92,
        "reasoning": "Guaranteed financial return promise, high-risk URL, advance fee scam pattern."
    },
    {
        "sample_id": "WA-DS-006",
        "category": "MALICIOUS_DOCUMENT",
        "content_type": "file",
        "text": "Urgent_Invoice_March2026.docm",
        "expected_classification": "MALICIOUS",
        "expected_risk_score": 88,
        "reasoning": "Macro-enabled Word document script payload targeting automated execution."
    },
    {
        "sample_id": "WA-DS-007",
        "category": "SAFE_MEDIA",
        "content_type": "image",
        "text": "family_vacation_photo_dsc_0842.jpg",
        "expected_classification": "SAFE",
        "expected_risk_score": 10,
        "reasoning": "Camera photo with natural sensor noise distribution and continuous color gradients."
    },
    {
        "sample_id": "WA-DS-008",
        "category": "SUSPICIOUS_MEDIA",
        "content_type": "image",
        "text": "doctored_payment_receipt_spliced.png",
        "expected_classification": "MANIPULATED",
        "expected_risk_score": 88,
        "reasoning": "Copy-move pixel forgery and font alignment anomalies detected in transaction receipt."
    }
]

def get_dataset_metadata():
    return {
        "dataset_name": "CyberShield AI WhatsApp Synthetic Security Benchmark",
        "total_samples": len(WHATSAPP_SECURITY_DATASET),
        "categories": ["SAFE", "PHISHING", "SCAM", "SOCIAL_ENGINEERING", "MALICIOUS_DOCUMENT", "SUSPICIOUS_MEDIA"],
        "pipeline_reuse": "Reuses CyberShield AI Multimodal Model Registry (sms_scam_detection_ai, url_threat_detection_ai, file_security_pipeline, image_manipulation_ai).",
        "samples": WHATSAPP_SECURITY_DATASET
    }
