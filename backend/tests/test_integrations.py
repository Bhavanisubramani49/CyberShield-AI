import unittest
import asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from app.db.database import init_db

class TestPlatformIntegrations(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        init_db()

    async def test_integrations_list_and_summary(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. List all integrations
            res_list = await client.get("/api/v1/integrations")
            self.assertEqual(res_list.status_code, 200)
            items = res_list.json()
            self.assertEqual(len(items), 7)
            platform_ids = [i["platform_id"] for i in items]
            self.assertIn("simulation", platform_ids)
            self.assertIn("whatsapp", platform_ids)
            self.assertIn("gmail", platform_ids)

            # 2. Get Summary
            res_sum = await client.get("/api/v1/integrations/summary")
            self.assertEqual(res_sum.status_code, 200)
            sum_data = res_sum.json()
            self.assertEqual(sum_data["total_adapters"], 7)
            self.assertGreaterEqual(sum_data["authorized_platforms"], 1)

    async def test_simulation_adapter_lifecycle(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Inspect Simulation Platform
            res_sim = await client.get("/api/v1/integrations/simulation")
            self.assertEqual(res_sim.status_code, 200)
            sim_data = res_sim.json()
            self.assertTrue(sim_data["is_simulation"])

            # 2. Permissions endpoint
            res_perms = await client.get("/api/v1/integrations/simulation/permissions")
            self.assertEqual(res_perms.status_code, 200)
            perms = res_perms.json()
            self.assertEqual(len(perms), 10)

            # 3. Update permissions
            res_update = await client.post("/api/v1/integrations/simulation/permissions", json={
                "granted_permissions": ["RECEIVE_EVENTS", "ANALYZE_CONTENT", "READ_MESSAGES"]
            })
            self.assertEqual(res_update.status_code, 200)
            self.assertEqual(len(res_update.json()["granted_permissions"]), 3)

            # 4. Normalize event through simulation adapter
            res_norm = await client.post("/api/v1/integrations/normalize-event?platform_id=simulation", json={
                "event_id": "EVT-NORM-01",
                "content_type": "message",
                "sender_name": "Test Simulation Persona",
                "payload": {"text": "Test normalized message payload"}
            })
            self.assertEqual(res_norm.status_code, 200)
            norm_data = res_norm.json()
            self.assertEqual(norm_data["source_platform"], "CyberShield Simulation Platform")
            self.assertEqual(norm_data["content"], "Test normalized message payload")

            # 5. Disconnect simulation
            res_disc = await client.post("/api/v1/integrations/simulation/disconnect")
            self.assertEqual(res_disc.status_code, 200)

            # 6. Normalize should fail when disconnected
            res_norm_fail = await client.post("/api/v1/integrations/normalize-event?platform_id=simulation", json={
                "event_id": "EVT-NORM-02",
                "content_type": "message",
                "sender_name": "Test Persona",
                "payload": {"text": "Unauthorized event"}
            })
            self.assertEqual(res_norm_fail.status_code, 403)

            # 7. Re-connect simulation
            res_conn = await client.post("/api/v1/integrations/simulation/connect", json={
                "grant_all_permissions": True
            })
            self.assertEqual(res_conn.status_code, 200)
            self.assertEqual(res_conn.json()["status"], "AUTHORIZED_SIMULATION")

    async def test_third_party_security_boundary(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # WhatsApp cannot be connected without real OAuth credentials
            res_conn = await client.post("/api/v1/integrations/whatsapp/connect", json={
                "grant_all_permissions": True
            })
            self.assertEqual(res_conn.status_code, 403)
            self.assertIn("Official platform API credentials and explicit user authorization are required", res_conn.json()["detail"])

            # Ingesting from unauthorized WhatsApp adapter must be rejected
            res_norm = await client.post("/api/v1/integrations/normalize-event?platform_id=whatsapp", json={
                "event_id": "EVT-WA-01",
                "content_type": "message",
                "sender_name": "Unknown",
                "payload": {"text": "Scam payload"}
            })
            self.assertEqual(res_norm.status_code, 403)

if __name__ == "__main__":
    unittest.main()
