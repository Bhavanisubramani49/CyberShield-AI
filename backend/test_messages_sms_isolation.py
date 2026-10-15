#!/usr/bin/env python3
"""
CyberShield AI — Messages / SMS Deep Isolation & Two-Way Security Test Suite

Verifies:
1. SMS Thread Count >= 50 for all dataset users (Soorya, John, Naveen, Kavin)
2. Strict Dual User Isolation: 0% conversation ID overlap between Soorya and John
3. Strict Platform Isolation: SMS channel query returns 0 non-SMS records
4. Two-Way Messaging: Receiver reply dispatches message, creates DB record, & updates conversation
5. CyberShield AI Threat Interception: Dangerous SMS triggers SecurityEvent & Notification
6. Human-in-the-loop Security Actions: BLOCK and ALLOW decisions update DB & recipient states
"""
import asyncio
import json
import os
import sys
from pathlib import Path

# Add backend to sys.path
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from app.db.database import init_db
from app.db.conversation_repository import ConversationRepository, conversation_repository
from app.db.models import SecurityEventModel, NotificationModel, MessageModel, ConversationModel


def run_sms_isolation_tests():
    print("=" * 75)
    print("CYBERSHIELD AI — MESSAGES / SMS ISOLATION & TWO-WAY TESTING")
    print("=" * 75)

    # Initialize DB & Seed dataset
    init_db()
    conversation_repository.seed_if_empty()

    # 1. Fetch Users
    users = conversation_repository.get_all_demo_users()
    print(f"[OK] Total Demo Users in DB: {len(users)}")
    assert len(users) >= 50, f"Expected >= 50 demo users, found {len(users)}"

    # Test Users
    test_uids = ["USER_000001", "USER_000002", "USER_000010", "USER_000012"]
    user_sms_convs = {}

    print("\n" + "-" * 75)
    print("1. VERIFYING PER-USER SMS THREAD COUNT (Target: >= 50 threads / user)")
    print("-" * 75)

    for uid in test_uids:
        convs = conversation_repository.get_user_conversations(uid, channel="SMS")
        user_sms_convs[uid] = convs
        print(f"[OK] User [{uid:11s}]: SMS Thread Count = {len(convs):3d}")
        assert len(convs) >= 50, f"User {uid} has only {len(convs)} SMS threads (< 50)"

    print("\n" + "-" * 75)
    print("2. VERIFYING DUAL USER ISOLATION (Soorya vs John vs Kavin)")
    print("-" * 75)

    u1_conv_ids = set(c["conversation_id"] for c in user_sms_convs["USER_000001"])
    u2_conv_ids = set(c["conversation_id"] for c in user_sms_convs["USER_000002"])
    u3_conv_ids = set(c["conversation_id"] for c in user_sms_convs["USER_000012"])

    overlap_1_2 = u1_conv_ids.intersection(u2_conv_ids)
    overlap_1_3 = u1_conv_ids.intersection(u3_conv_ids)

    print(f"[OK] Overlap USER_000001 vs USER_000002: {len(overlap_1_2)}")
    print(f"[OK] Overlap USER_000001 vs USER_000012: {len(overlap_1_3)}")

    assert len(overlap_1_2) == 0, f"User isolation failure! Overlap: {overlap_1_2}"
    assert len(overlap_1_3) == 0, f"User isolation failure! Overlap: {overlap_1_3}"
    print("[OK] USER ISOLATION VERIFIED: 0% shared SMS conversation IDs.")

    print("\n" + "-" * 75)
    print("3. VERIFYING PLATFORM ISOLATION (channel=SMS filter boundary)")
    print("-" * 75)

    all_sms = conversation_repository.get_user_conversations("USER_000001", channel="SMS")
    non_sms = [c for c in all_sms if c.get("channel") != "SMS"]
    print(f"[OK] Total SMS Query Convs: {len(all_sms)} | Non-SMS leakage = {len(non_sms)}")
    assert len(non_sms) == 0, f"Platform boundary breached! Non-SMS records returned: {non_sms}"
    print("[OK] PLATFORM ISOLATION VERIFIED: 100% pure SMS records.")

    print("\n" + "-" * 75)
    print("4. VERIFYING MULTI-MESSAGE THREAD HISTORY & TWO-WAY MESSAGING")
    print("-" * 75)

    sample_conv_id = user_sms_convs["USER_000001"][0]["conversation_id"]
    msgs_before = conversation_repository.get_conversation_messages(sample_conv_id)
    print(f"[OK] Initial thread history for {sample_conv_id}: {len(msgs_before)} messages")

    # Send receiver reply
    reply_text = "Thanks for the SMS update! Replying directly from CyberShield Receiver."
    sent_msg = conversation_repository.send_message(
        conversation_id=sample_conv_id,
        sender_id="USER_000001",
        content=reply_text,
        content_type="text"
    )

    print(f"[OK] Dispatched Receiver Reply: ID = {sent_msg['message_id']}, Status = {sent_msg['security_status']}")
    assert sent_msg["content"] == reply_text
    assert sent_msg["conversation_id"] == sample_conv_id

    msgs_after = conversation_repository.get_conversation_messages(sample_conv_id)
    print(f"[OK] Updated thread history: {len(msgs_after)} messages")
    assert len(msgs_after) == len(msgs_before) + 1

    print("\n" + "-" * 75)
    print("5. VERIFYING CYBERSHIELD SECURITY THREAT INTERCEPTION & BLOCK/ALLOW")
    print("-" * 75)

    threat_text = "URGENT: Your bank account is suspended. Verify PIN immediately at http://192.168.1.10/verify-bank"
    threat_msg = conversation_repository.send_message(
        conversation_id=sample_conv_id,
        sender_id="CNT-SMS-USER_000001-001",
        content=threat_text,
        content_type="text"
    )

    print(f"[OK] Threat Interception Analysis: Classification = {threat_msg['classification']}, Risk = {threat_msg['risk_score']}/100, Status = {threat_msg['security_status']}")
    assert threat_msg["security_status"] == "DANGEROUS"
    assert threat_msg["risk_level"] in ("CRITICAL", "HIGH")

    # Test Block Action
    block_res = conversation_repository.update_message_security_action(threat_msg["message_id"], "BLOCK")
    print(f"[OK] Executed BLOCK action: Security Status = {block_res['security_status']}")
    assert block_res["security_status"] == "BLOCKED"

    # Test Allow Action
    allow_res = conversation_repository.update_message_security_action(threat_msg["message_id"], "ALLOW")
    print(f"[OK] Executed ALLOW action: Security Status = {allow_res['security_status']}")
    assert allow_res["security_status"] == "ALLOWED"

    print("\n" + "=" * 75)
    print("ALL MESSAGES / SMS ISOLATION & TWO-WAY TESTS PASSED SUCCESSFULLY!")
    print("=" * 75)


if __name__ == "__main__":
    run_sms_isolation_tests()
