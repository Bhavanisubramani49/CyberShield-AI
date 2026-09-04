import unittest
import json
from app.db.database import init_db
from app.db.conversation_repository import conversation_repository
from app.datasets.messages_security_dataset import get_messages_dataset_metadata

class TestMessagesConversations(unittest.TestCase):
    def setUp(self):
        init_db()

    def test_sms_channel_isolation(self):
        # Fetch SMS channel conversations for Kavin
        sms_convs = conversation_repository.get_user_conversations(user_id="user-kavin", channel="SMS")
        self.assertTrue(len(sms_convs) > 0, "Should return at least 1 SMS conversation")
        for c in sms_convs:
            self.assertEqual(c["channel"], "SMS", "Every conversation in SMS channel list must have channel='SMS'")

        # Fetch WhatsApp channel conversations for Kavin
        wa_convs = conversation_repository.get_user_conversations(user_id="user-kavin", channel="WHATSAPP")
        self.assertTrue(len(wa_convs) > 0, "Should return WhatsApp conversations")
        for c in wa_convs:
            self.assertEqual(c["channel"], "WHATSAPP", "Every conversation in WhatsApp list must have channel='WHATSAPP'")

    def test_user_contact_phone_numbers(self):
        contacts = conversation_repository.get_user_contacts(user_id="user-kavin")
        self.assertTrue(len(contacts) > 0, "Kavin should have user contacts")
        for c in contacts:
            self.assertIn("phone_number", c, "Contact must contain phone_number field")
            self.assertTrue(c["phone_number"].startswith("+91"), "Phone numbers should start with +91 format")

    def test_sms_messages_retrieval(self):
        msgs = conversation_repository.get_conversation_messages(conversation_id="CONV-SMS-001")
        self.assertTrue(len(msgs) > 0, "CONV-SMS-001 should return messages thread")
        self.assertEqual(msgs[0]["conversation_id"], "CONV-SMS-001")

    def test_send_sms_message(self):
        res = conversation_repository.send_message(
            conversation_id="CONV-SMS-001",
            sender_id="user-riya",
            content="Hey Kavin, project sync meeting at 4 PM."
        )
        self.assertEqual(res["conversation_id"], "CONV-SMS-001")
        self.assertEqual(res["security_status"], "SAFE")

    def test_send_dangerous_sms_message(self):
        res = conversation_repository.send_message(
            conversation_id="CONV-SMS-001",
            sender_id="user-riya",
            content="URGENT! Your bank account is locked. Verify PIN immediately at http://192.168.1.10/verify-bank"
        )
        self.assertEqual(res["conversation_id"], "CONV-SMS-001")
        self.assertEqual(res["security_status"], "DANGEROUS")
        self.assertGreaterEqual(res["risk_score"], 90)

    def test_sms_dataset_metadata(self):
        meta = get_messages_dataset_metadata()
        self.assertIn("total_samples", meta)
        self.assertGreaterEqual(meta["total_samples"], 5)
        self.assertIn("samples", meta)

if __name__ == "__main__":
    unittest.main()
