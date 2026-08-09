import unittest
import asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from app.core.config import settings
from app.db.database import init_db

class TestCoreSecurityGateway(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        init_db()
        self.valid_key = settings.GATEWAY_API_KEY

    async def test_gateway_health(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/v1/gateway/health")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["status"], "HEALTHY")
            self.assertEqual(data["ai_detectors_active"], 8)

    async def test_gateway_auth_failures(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Missing API Key
            res_missing = await client.post("/api/v1/gateway/send", json={
                "sender_id": "Test Sender",
                "content_type": "message",
                "payload": {"text": "Hello"}
            })
            self.assertEqual(res_missing.status_code, 401)

            # 2. Invalid API Key
            res_invalid = await client.post(
                "/api/v1/gateway/send",
                headers={"X-CyberShield-API-Key": "wrong-key-123"},
                json={
                    "sender_id": "Test Sender",
                    "content_type": "message",
                    "payload": {"text": "Hello"}
                }
            )
            self.assertEqual(res_invalid.status_code, 403)

    async def test_safe_message_end_to_end(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Send safe communication
            res = await client.post(
                "/api/v1/gateway/send",
                headers={"X-CyberShield-API-Key": self.valid_key},
                json={
                    "sender_id": "Colleague Sarah (+1 555 019 2834)",
                    "recipient_id": "Receiver Mobile Device (+1 555 019 9999)",
                    "content_type": "message",
                    "payload": {
                        "text": "Hi team, see you in the conference room at 10 AM for our weekly sync."
                    }
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["decision"], "ALLOW")
            self.assertTrue(data["delivered_to_receiver"])
            self.assertEqual(data["receiver_status"], "DELIVERED_NORMAL")
            self.assertEqual(data["risk_level"], "LOW")
            self.assertIn("EVT-GTW-", data["event_id"])

    async def test_lottery_scam_quarantine_end_to_end(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Send malicious lottery scam
            res = await client.post(
                "/api/v1/gateway/send",
                headers={"X-CyberShield-API-Key": self.valid_key},
                json={
                    "sender_id": "Lottery Reward Bot (+91 91234 56789)",
                    "recipient_id": "Receiver Mobile Device (+1 555 019 9999)",
                    "content_type": "message",
                    "payload": {
                        "text": "CONGRATULATIONS! You won ₹25,00,000 cash reward. Call 1800-999-FREE immediately to claim!"
                    }
                }
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["decision"], "QUARANTINE")
            self.assertFalse(data["delivered_to_receiver"])
            self.assertEqual(data["receiver_status"], "INTERCEPTED_AND_QUARANTINED")
            self.assertEqual(data["risk_level"], "CRITICAL")
            self.assertGreaterEqual(data["risk_score"], 85)
            self.assertGreater(len(data["reasons"]), 0)

            # Verify it appears in Receiver Mobile Inbox with Interception Warning
            res_inbox = await client.get("/api/v1/gateway/receiver/inbox?limit=5")
            self.assertEqual(res_inbox.status_code, 200)
            inbox = res_inbox.json()
            found = next((i for i in inbox if i["event_id"] == data["event_id"]), None)
            self.assertIsNotNone(found)
            self.assertEqual(found["delivery_state"], "CYBERSHIELD_SECURITY_WARNING")
            self.assertTrue(found["is_quarantined"])

if __name__ == "__main__":
    unittest.main()
