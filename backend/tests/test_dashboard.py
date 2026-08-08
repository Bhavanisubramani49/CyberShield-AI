import unittest
import asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from app.db.database import init_db

class TestDashboardAnalytics(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        init_db()

    async def test_dashboard_summary_all(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/v1/dashboard/summary?period=all")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("total_events", data)
            self.assertIn("threats_detected", data)
            self.assertIn("threat_distribution", data)
            self.assertIn("risk_distribution", data)
            self.assertIn("action_distribution", data)
            self.assertIn("modality_analytics", data)
            self.assertIn("ai_model_performance", data)
            self.assertIn("quarantine_summary", data)
            self.assertEqual(data["protection_status"], "OPERATIONAL")
            self.assertGreaterEqual(len(data["modality_analytics"]), 8)

    async def test_dashboard_date_filters(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            for p in ["24h", "7d", "30d", "all"]:
                res = await client.get(f"/api/v1/dashboard/summary?period={p}")
                self.assertEqual(res.status_code, 200)
                data = res.json()
                self.assertEqual(data["period"], p)
                self.assertIsInstance(data["threats_detected"], int)

if __name__ == "__main__":
    unittest.main()
