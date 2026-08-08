import unittest
import asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from app.db.database import init_db

class TestSecurityHistoryAndAudit(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        init_db()

    async def test_search_and_filter_events(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Search Query
            res_search = await client.get("/api/v1/events?search=EVT")
            self.assertEqual(res_search.status_code, 200)
            self.assertIsInstance(res_search.json(), list)

            # 2. Modality Filter
            res_mod = await client.get("/api/v1/events?modality=message")
            self.assertEqual(res_mod.status_code, 200)

            # 3. Risk Level Filter
            res_risk = await client.get("/api/v1/events?risk_level=CRITICAL")
            self.assertEqual(res_risk.status_code, 200)

            # 4. Action Filter
            res_action = await client.get("/api/v1/events?action=QUARANTINE")
            self.assertEqual(res_action.status_code, 200)

            # 5. Classification Filter
            res_class = await client.get("/api/v1/events?classification=SCAM")
            self.assertEqual(res_class.status_code, 200)

            # 6. Sorting
            for s in ["newest", "oldest", "highest_risk", "lowest_risk"]:
                res_sort = await client.get(f"/api/v1/events?sort_by={s}")
                self.assertEqual(res_sort.status_code, 200)

            # 7. Pagination
            res_page = await client.get("/api/v1/events?page=1&limit=2")
            self.assertEqual(res_page.status_code, 200)
            self.assertLessEqual(len(res_page.json()), 2)

    async def test_create_and_delete_event(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Dispatch test event
            res_send = await client.post("/api/v1/events/send", json={
                "event_id": "EVT-99999",
                "content_type": "message",
                "sender_type": "simulated_attacker",
                "sender_name": "Temporary Test Attacker",
                "payload": {"text": "Test disposable scam"},
                "ai_result": {
                    "classification": "SCAM",
                    "confidence": 0.99,
                    "risk_score": 98,
                    "risk_level": "CRITICAL",
                    "reasons": ["Test deletion"],
                    "recommendation": "QUARANTINE",
                    "model": "sms_scam_detection_ai",
                    "timestamp": "2026-08-09T00:00:00Z",
                    "processing_time_ms": 15.0
                }
            })
            self.assertEqual(res_send.status_code, 200)

            # Inspect Detail
            res_detail = await client.get("/api/v1/events/EVT-99999")
            self.assertEqual(res_detail.status_code, 200)
            self.assertEqual(res_detail.json()["event_id"], "EVT-99999")

            # Delete
            res_del = await client.delete("/api/v1/events/EVT-99999")
            self.assertEqual(res_del.status_code, 200)

            # Confirm 404
            res_after = await client.get("/api/v1/events/EVT-99999")
            self.assertEqual(res_after.status_code, 404)

if __name__ == "__main__":
    unittest.main()
