import sys
import json
import time
import asyncio
from httpx import AsyncClient, ASGITransport
from main import app

async def run_all_verifications():
    transport = ASGITransport(app=app)
    results = []
    
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res_health = await client.get("/api/v1/gateway/health")
        assert res_health.status_code == 200, f"Gateway health check failed: {res_health.text}"
        health_data = res_health.json()
        print(f"[HEALTH] Gateway Status: {health_data['status']}, Active Detectors: {health_data['ai_detectors_active']}")

        api_key = "cs-sim-key-prod-2026"
        headers = {"X-CyberShield-API-Key": api_key}

        # 2. Test scenarios for all 9 platforms
        scenarios = [
            {
                "platform": "whatsapp",
                "name": "WhatsApp",
                "sender": "Marcus Reynolds (SND-WA-001)",
                "receiver": "Receiver Mobile User (RCV-WA-001)",
                "content_type": "message",
                "safe": {
                    "payload": {"text": "Hi, are you available for the meeting at 10 AM?"},
                    "expected_decision": "ALLOW",
                    "expected_class": "SAFE"
                },
                "threat": {
                    "payload": {"text": "Congratulations! You won ₹50,000 lottery cash prize! Click here immediately to claim: http://192.168.1.1/claim-cash"},
                    "expected_decision": "QUARANTINE",
                    "expected_class": "SCAM"
                }
            },
            {
                "platform": "instagram",
                "name": "Instagram",
                "sender": "Marcus Reynolds (SND-IG-001)",
                "receiver": "Receiver Social User (RCV-IG-001)",
                "content_type": "message",
                "safe": {
                    "payload": {"text": "Loved your new design portfolio post! Let us collaborate on the next project."},
                    "expected_decision": "ALLOW",
                    "expected_class": "SAFE"
                },
                "threat": {
                    "payload": {
                        "text": "FREE CRYPTO AIRDROP: Double your investment instantly! Send 0.1 BTC to receive 0.5 BTC back immediately at http://192.168.1.200/crypto-giveaway.php",
                        "followers": 10,
                        "following": 4000,
                        "username": "crypto_giveaway_bot_99",
                        "bio": "FREE CRYPTO REWARDS • 500% GUARANTEED RETURN • CLICK LINK"
                    },
                    "expected_decision": "QUARANTINE",
                    "expected_class": "FAKE_PROFILE"
                }
            },
            {
                "platform": "messages",
                "name": "Messages / SMS",
                "sender": "Marcus Reynolds (SND-SMS-001)",
                "receiver": "Receiver Mobile User (RCV-SMS-001)",
                "content_type": "message",
                "safe": {
                    "payload": {"text": "Flight DL-482 boarding at Gate B12 at 14:30. Thank you for flying Delta."},
                    "expected_decision": "ALLOW",
                    "expected_class": "SAFE"
                },
                "threat": {
                    "payload": {"text": "URGENT: Your bank debit card is locked due to unauthorized $850 charge. Call 1800-555-0199 or verify PIN now at http://192.168.1.10/verify-bank"},
                    "expected_decision": "QUARANTINE",
                    "expected_class": "SCAM"
                }
            },
            {
                "platform": "email",
                "name": "Email / Gmail",
                "sender": "Marcus Reynolds (SND-EMAIL-001)",
                "receiver": "Receiver Mail User (RCV-EMAIL-001)",
                "content_type": "email",
                "safe": {
                    "payload": {
                        "subject": "Q3 Financial Performance Report & Meeting Minutes",
                        "body": "Please find attached the summary minutes and quarterly revenue metrics discussed in our executive sync."
                    },
                    "expected_decision": "ALLOW",
                    "expected_class": "SAFE"
                },
                "threat": {
                    "payload": {
                        "subject": "Urgent: Immediate Account Suspension - Security Action Required",
                        "body": "Your enterprise cloud account will be deactivated within 1 hour due to unauthorized access. Click below to verify password and confirm identity immediately.",
                        "link": "http://192.168.1.50/update-login.php?user=alex"
                    },
                    "expected_decision": "QUARANTINE",
                    "expected_class": "PHISHING"
                }
            },
            {
                "platform": "web",
                "name": "Web & URLs",
                "sender": "Marcus Reynolds (SND-WEB-001)",
                "receiver": "Receiver Browser User (RCV-WEB-001)",
                "content_type": "url",
                "safe": {
                    "payload": {"url": "https://developer.mozilla.org/en-US"},
                    "expected_decision": "ALLOW",
                    "expected_class": "SAFE"
                },
                "threat": {
                    "payload": {"url": "http://192.168.1.10/update-login.php?token=xyz998273"},
                    "expected_decision": "QUARANTINE",
                    "expected_class": "MALICIOUS"
                }
            },
            {
                "platform": "photos",
                "name": "Photos & Gallery",
                "sender": "Marcus Reynolds (SND-PHOTO-001)",
                "receiver": "Receiver Gallery User (RCV-PHOTO-001)",
                "content_type": "image",
                "safe": {
                    "payload": {"filename": "family_vacation_photo_dsc_0842.jpg", "description": "Authentic camera capture with consistent Bayer sensor noise."},
                    "expected_decision": "ALLOW",
                    "expected_class": "SAFE"
                },
                "threat": {
                    "payload": {"filename": "doctored_payment_receipt_spliced.png", "description": "Manipulated payment transaction receipt with GAN pixel synthesis and copy-move artifacts."},
                    "expected_decision": "QUARANTINE",
                    "expected_class": "MANIPULATED"
                }
            },
            {
                "platform": "videos",
                "name": "Videos & Streams",
                "sender": "Marcus Reynolds (SND-VIDEO-001)",
                "receiver": "Receiver Video User (RCV-VIDEO-001)",
                "content_type": "video",
                "safe": {
                    "payload": {"filename": "team_standup_recording_2026.mp4", "description": "Natural lighting, continuous frame timestamps, and synchronized audio lip tracking."},
                    "expected_decision": "ALLOW",
                    "expected_class": "SAFE"
                },
                "threat": {
                    "payload": {"filename": "executive_face_swap_deepfake.mp4", "description": "AI face_swap deepfake with facial boundary warping anomalies and synthetic blinking frequency."},
                    "expected_decision": "QUARANTINE",
                    "expected_class": "DEEPFAKE"
                }
            },
            {
                "platform": "news",
                "name": "News & Articles",
                "sender": "Marcus Reynolds (SND-NEWS-001)",
                "receiver": "Receiver News User (RCV-NEWS-001)",
                "content_type": "news",
                "safe": {
                    "payload": {
                        "headline": "NASA Rover Discovers Ancient Sedimentary Formations on Mars Surface",
                        "text": "Scientists at the Jet Propulsion Laboratory confirmed that rover telemetry indicates preserved mineral strata consistent with ancient riverbed deposition."
                    },
                    "expected_decision": "ALLOW",
                    "expected_class": "SAFE"
                },
                "threat": {
                    "payload": {
                        "headline": "SHOCKING: Secret Miracle Cure Doctors Won’t Tell You About Cures All Viruses in 2 Hours!",
                        "text": "Leaked government memo confirms secret boiled garlic remedy destroys all viral infections instantly. Big pharma trying to ban all reporting!"
                    },
                    "expected_decision": "QUARANTINE",
                    "expected_class": "FAKE_NEWS"
                }
            },
            {
                "platform": "files",
                "name": "Files & Storage",
                "sender": "Marcus Reynolds (SND-FILE-001)",
                "receiver": "Receiver Storage User (RCV-FILE-001)",
                "content_type": "file",
                "safe": {
                    "payload": {"filename": "Annual_CyberSecurity_Report_2026.pdf", "file_type": "application/pdf"},
                    "expected_decision": "ALLOW",
                    "expected_class": "SAFE"
                },
                "threat": {
                    "payload": {"filename": "Urgent_Invoice_March2026.docm", "file_type": "application/vnd.ms-word.document.macroEnabled.12"},
                    "expected_decision": "QUARANTINE",
                    "expected_class": "MALICIOUS"
                }
            }
        ]

        print("\n" + "="*80)
        print("CYBERSHIELD AI — END-TO-END MULTI-PLATFORM VERIFICATION")
        print("="*80)

        for s in scenarios:
            p = s["platform"]
            p_name = s["name"]
            
            # 1. Test SAFE
            res_safe = await client.post(
                "/api/v1/gateway/send",
                headers=headers,
                json={
                    "platform": p,
                    "sender_id": s["sender"],
                    "recipient_id": s["receiver"],
                    "content_type": s["content_type"],
                    "payload": s["safe"]["payload"]
                }
            )
            assert res_safe.status_code == 200, f"[{p_name} Safe] Request failed: {res_safe.text}"
            safe_d = res_safe.json()
            safe_pass = (safe_d["decision"] == s["safe"]["expected_decision"] and 
                         safe_d["classification"] == s["safe"]["expected_class"] and
                         safe_d["delivered_to_receiver"] is True)

            # 2. Test THREAT
            res_threat = await client.post(
                "/api/v1/gateway/send",
                headers=headers,
                json={
                    "platform": p,
                    "sender_id": s["sender"],
                    "recipient_id": s["receiver"],
                    "content_type": s["content_type"],
                    "payload": s["threat"]["payload"]
                }
            )
            assert res_threat.status_code == 200, f"[{p_name} Threat] Request failed: {res_threat.text}"
            threat_d = res_threat.json()
            threat_pass = (threat_d["decision"] == s["threat"]["expected_decision"] and 
                           threat_d["classification"] == s["threat"]["expected_class"] and
                           threat_d["delivered_to_receiver"] is False)

            status_str = "PASS" if (safe_pass and threat_pass) else "FAIL"
            results.append({
                "platform": p_name,
                "status": status_str,
                "safe_decision": safe_d["decision"],
                "safe_class": safe_d["classification"],
                "safe_risk": safe_d["risk_score"],
                "threat_decision": threat_d["decision"],
                "threat_class": threat_d["classification"],
                "threat_risk": threat_d["risk_score"],
                "ai_model": threat_d["model"],
                "event_id": threat_d["event_id"]
            })
            print(f"[{status_str}] {p_name:20s} | Safe: {safe_d['decision']} ({safe_d['risk_score']}/100) | Threat: {threat_d['decision']} ({threat_d['risk_score']}/100 - {threat_d['classification']}) | Model: {threat_d['model']}")

        # 3. Verify Database Events
        res_events = await client.get("/api/v1/events?limit=50")
        assert res_events.status_code == 200
        events = res_events.json()
        print(f"\n[PERSISTENCE] Successfully queried {len(events)} events from SQLite Database.")

        # 4. Verify Notifications
        res_notifs = await client.get("/api/v1/notifications?limit=20")
        assert res_notifs.status_code == 200
        notifs = res_notifs.json()
        # 6. Verify Two-Way Exact Sender Reply Flow
        res_reply = await client.post(
            "/api/v1/events/send",
            json={
                "event_id": f"EVT-RPLY-{int(time.time() * 1000) % 1000000:06d}",
                "content_type": "message",
                "sender_type": "normal_user",
                "sender_name": "Receiver Mobile User (RCV-WA-001)",
                "receiver_id": "Marcus Reynolds (SND-WA-001)",
                "platform": "whatsapp",
                "content_preview": "Yes, confirmed meeting at 10 AM!",
                "payload": {"text": "Yes, confirmed meeting at 10 AM!"}
            }
        )
        assert res_reply.status_code == 200, f"Reply dispatch failed: {res_reply.text}"
        reply_data = res_reply.json()
        assert reply_data["sender_id"] == "Receiver Mobile User (RCV-WA-001)"
        assert "SND-WA-001" in reply_data["receiver_id"]
        assert reply_data["final_action"] == "ALLOW"
        print(f"[TWO-WAY REPLY] Successfully persisted reply from {reply_data['sender_id']} to {reply_data['receiver_id']} (Decision: {reply_data['final_action']})")

        # 7. Verify Auth & Error Handling
        res_bad_auth = await client.post(
            "/api/v1/gateway/send",
            headers={"X-CyberShield-API-Key": "invalid-key"},
            json={"platform": "whatsapp", "payload": {"text": "test"}}
        )
        assert res_bad_auth.status_code == 403, f"Expected 403 on invalid key, got {res_bad_auth.status_code}"
        print(f"[AUTH SECURITY] Correctly rejected unauthorized gateway request with HTTP {res_bad_auth.status_code}.")

        res_empty_payload = await client.post(
            "/api/v1/gateway/send",
            headers=headers,
            json={
                "platform": "whatsapp",
                "sender_id": "SND-WA-001",
                "recipient_id": "RCV-WA-001",
                "content_type": "message",
                "source_app": "test",
                "payload": {}
            }
        )
        assert res_empty_payload.status_code == 400, f"Expected 400 on empty payload, got {res_empty_payload.status_code}"
        print(f"[VALIDATION] Correctly rejected empty payload with HTTP {res_empty_payload.status_code}.")

        return results

if __name__ == "__main__":
    res = asyncio.run(run_all_verifications())
    all_passed = all(r["status"] == "PASS" for r in res)
    print("\n" + "="*80)
    print(f"FINAL RESULT: {'ALL 9 PLATFORMS & TWO-WAY PIPELINE PASSED (100%)' if all_passed else 'SOME PLATFORMS FAILED'}")
    print("="*80)
    sys.exit(0 if all_passed else 1)
