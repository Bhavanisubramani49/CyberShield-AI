import unittest
import asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from app.db.database import init_db

class TestSecurityNotifications(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        init_db()

    async def test_notifications_crud_and_unread(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Dispatch a critical scam event
            res_send = await client.post("/api/v1/events/send", json={
                "event_id": "EVT-88888",
                "content_type": "message",
                "sender_type": "simulated_attacker",
                "sender_name": "Scam Bot +91 91234 56789",
                "payload": {"text": "Urgent lottery prize claim ₹50,000,000"},
                "ai_result": {
                    "classification": "SCAM",
                    "confidence": 0.99,
                    "risk_score": 96,
                    "risk_level": "CRITICAL",
                    "reasons": ["Urgent lottery claim"],
                    "recommendation": "QUARANTINE",
                    "model": "sms_scam_detection_ai",
                    "timestamp": "2026-08-09T00:00:00Z",
                    "processing_time_ms": 18.0
                }
            })
            self.assertEqual(res_send.status_code, 200)

            # 2. Get Notifications List
            res_notifs = await client.get("/api/v1/notifications")
            self.assertEqual(res_notifs.status_code, 200)
            notifs = res_notifs.json()
            self.assertGreaterEqual(len(notifs), 1)

            # Check that EVT-88888 generated a CRITICAL severity notification
            target_notif = next((n for n in notifs if n["event_id"] == "EVT-88888"), None)
            self.assertIsNotNone(target_notif)
            self.assertEqual(target_notif["severity"], "CRITICAL")
            self.assertIn("🚨", target_notif["title"])

            # 3. Duplicate Prevention: Dispatching the same event again must not create duplicate notifications
            res_send_dup = await client.post("/api/v1/events/send", json={
                "event_id": "EVT-88888",
                "content_type": "message",
                "sender_type": "simulated_attacker",
                "sender_name": "Scam Bot +91 91234 56789",
                "payload": {"text": "Urgent lottery prize claim ₹50,000,000"},
                "ai_result": {
                    "classification": "SCAM",
                    "confidence": 0.99,
                    "risk_score": 96,
                    "risk_level": "CRITICAL",
                    "reasons": ["Urgent lottery claim"],
                    "recommendation": "QUARANTINE",
                    "model": "sms_scam_detection_ai",
                    "timestamp": "2026-08-09T00:00:00Z",
                    "processing_time_ms": 18.0
                }
            })
            self.assertEqual(res_send_dup.status_code, 200)
            res_notifs_after = await client.get("/api/v1/notifications")
            matching = [n for n in res_notifs_after.json() if n["event_id"] == "EVT-88888"]
            self.assertEqual(len(matching), 1, "Duplicate notifications must be prevented")

            # 4. Unread Statistics
            res_unread = await client.get("/api/v1/notifications/unread")
            self.assertEqual(res_unread.status_code, 200)
            unread_data = res_unread.json()
            self.assertIn("unread_count", unread_data)
            self.assertIn("critical_count", unread_data)

            # 5. Mark as Read
            nid = target_notif["notification_id"]
            res_read = await client.post(f"/api/v1/notifications/{nid}/read?is_read=true")
            self.assertEqual(res_read.status_code, 200)
            self.assertTrue(res_read.json()["is_read"])

            # 6. Mark All Read
            res_all_read = await client.post("/api/v1/notifications/read-all")
            self.assertEqual(res_all_read.status_code, 200)

            # 7. Delete Notification
            res_del = await client.delete(f"/api/v1/notifications/{nid}")
            self.assertEqual(res_del.status_code, 200)

            # Cleanup event
            await client.delete("/api/v1/events/EVT-88888")

if __name__ == "__main__":
    unittest.main()
