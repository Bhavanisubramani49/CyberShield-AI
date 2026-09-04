import unittest
import asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from app.db.database import init_db

class TestConversationsEcosystem(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        init_db()

    async def test_get_demo_users(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/v1/conversations/users")
            self.assertEqual(res.status_code, 200)
            users = res.json()
            self.assertEqual(len(users), 15)
            kavin = next((u for u in users if u["user_id"] == "user-kavin"), None)
            self.assertIsNotNone(kavin)
            self.assertEqual(kavin["name"], "Kavin")

    async def test_get_user_conversations(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/v1/conversations?user_id=user-kavin")
            self.assertEqual(res.status_code, 200)
            convs = res.json()
            self.assertGreaterEqual(len(convs), 5)
            
            # Verify Project Team group conversation
            proj_team = next((c for c in convs if c["conversation_id"] == "CONV-003"), None)
            self.assertIsNotNone(proj_team)
            self.assertEqual(proj_team["title"], "Project Team")
            self.assertEqual(proj_team["conversation_type"], "GROUP")
            self.assertEqual(proj_team["member_count"], 5)

    async def test_get_conversation_messages_and_send_safe_message(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Fetch messages for CONV-001 (Kavin & Riya)
            res = await client.get("/api/v1/conversations/CONV-001/messages")
            self.assertEqual(res.status_code, 200)
            msgs = res.json()
            initial_count = len(msgs)
            self.assertGreaterEqual(initial_count, 4)

            # 2. Send safe reply from Kavin
            res_send = await client.post(
                "/api/v1/conversations/CONV-001/messages",
                json={
                    "sender_id": "user-kavin",
                    "content": "Sure Riya, let us submit the assignment today at 5 PM.",
                    "content_type": "text"
                }
            )
            self.assertEqual(res_send.status_code, 200)
            sent_msg = res_send.json()
            self.assertEqual(sent_msg["security_status"], "SAFE")
            self.assertEqual(sent_msg["classification"], "SAFE")
            self.assertEqual(sent_msg["risk_level"], "LOW")

            # 3. Verify message persisted in thread
            res_after = await client.get("/api/v1/conversations/CONV-001/messages")
            msgs_after = res_after.json()
            self.assertEqual(len(msgs_after), initial_count + 1)
            last = msgs_after[-1]
            self.assertEqual(last["content"], "Sure Riya, let us submit the assignment today at 5 PM.")

    async def test_send_scam_threat_message_to_group(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Send phishing scam to Project Team group (CONV-003)
            res_send = await client.post(
                "/api/v1/conversations/CONV-003/messages",
                json={
                    "sender_id": "user-rahul",
                    "content": "URGENT: Claim ₹50,000 lottery cash prize immediately at http://192.168.1.1/claim-cash",
                    "content_type": "text"
                }
            )
            self.assertEqual(res_send.status_code, 200)
            sent_msg = res_send.json()
            self.assertEqual(sent_msg["security_status"], "DANGEROUS")
            self.assertEqual(sent_msg["classification"], "SCAM")
            self.assertEqual(sent_msg["risk_level"], "CRITICAL")
            self.assertGreaterEqual(sent_msg["risk_score"], 90)

    async def test_exclude_user_and_non_member_rejection(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Test exclude_user_id=user-kavin (14 external users returned)
            res_ext = await client.get("/api/v1/conversations/users?exclude_user_id=user-kavin")
            self.assertEqual(res_ext.status_code, 200)
            ext_users = res_ext.json()
            self.assertEqual(len(ext_users), 14)
            has_kavin = any(u["user_id"] == "user-kavin" for u in ext_users)
            self.assertFalse(has_kavin)

            # 2. Test non-member rejection (user-sneha is NOT a member of CONV-001 Kavin & Riya)
            res_reject = await client.post(
                "/api/v1/conversations/CONV-001/messages",
                json={
                    "sender_id": "user-sneha",
                    "content": "Trying to post to unjoined chat",
                    "content_type": "text"
                }
            )
            self.assertEqual(res_reject.status_code, 403)

    async def test_user_contacts_and_message_actions(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Fetch contacts for Kavin
            res_contacts = await client.get("/api/v1/conversations/contacts?user_id=user-kavin")
            self.assertEqual(res_contacts.status_code, 200)
            contacts = res_contacts.json()
            self.assertGreaterEqual(len(contacts), 4)

            # 2. Fetch dataset info
            res_ds = await client.get("/api/v1/conversations/dataset/info")
            self.assertEqual(res_ds.status_code, 200)
            ds_data = res_ds.json()
            self.assertIn("total_samples", ds_data)

            # 3. Test Block Action on threat message
            res_send = await client.post(
                "/api/v1/conversations/CONV-003/messages",
                json={
                    "sender_id": "user-rahul",
                    "content": "URGENT: Verify your bank PIN immediately at http://192.168.1.10/verify-bank",
                    "content_type": "text"
                }
            )
            msg = res_send.json()
            msg_id = msg["message_id"]

            res_block = await client.post(
                f"/api/v1/conversations/messages/{msg_id}/action",
                json={"action": "BLOCK"}
            )
            self.assertEqual(res_block.status_code, 200)
            blocked_msg = res_block.json()
            self.assertEqual(blocked_msg["security_status"], "BLOCKED")
            self.assertIn("Message blocked by CyberShield", blocked_msg["content"])

if __name__ == "__main__":
    unittest.main()
