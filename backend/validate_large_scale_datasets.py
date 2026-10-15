#!/usr/bin/env python3
"""
CyberShield AI — Large-Scale Dataset & User Isolation Verification Suite

Validates:
1. 50 synthetic users in datasets/users.json
2. Every user has >= 50 records / entities across all platforms
3. Strict Dual Isolation: User A's data != User B's data
4. SQLite Database Seeding & Repository Queries
"""
import json
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from app.db.conversation_repository import ConversationRepository, conversation_repository


def run_validation():
    print("=" * 70)
    print("CYBERSHIELD AI — LARGE-SCALE DATASET VERIFICATION")
    print("=" * 70)

    datasets_dir = BACKEND_DIR.parent / "datasets"
    users_file = datasets_dir / "users.json"
    
    assert users_file.exists(), f"users.json missing at {users_file}"
    with open(users_file, "r", encoding="utf-8") as f:
        users = json.load(f)

    print(f"[OK] Loaded users.json: {len(users)} synthetic users found.")
    assert len(users) >= 50, f"Expected >= 50 users, found {len(users)}"

    platforms = ["whatsapp", "sms", "email", "instagram", "news", "web", "photos", "youtube", "videos", "files"]
    platform_user_counts = {p: {u["user_id"]: 0 for u in users} for p in platforms}
    platform_user_entities = {p: {u["user_id"]: set() for u in users} for p in platforms}

    for p in platforms:
        jsonl_path = datasets_dir / p / "generated" / f"{p}.jsonl"
        assert jsonl_path.exists(), f"JSONL missing for platform {p}: {jsonl_path}"

        with open(jsonl_path, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                r = json.loads(line)
                uid = r.get("user_id")
                if uid in platform_user_counts[p]:
                    platform_user_counts[p][uid] += 1
                    
                    # Track distinct entities (contact, sender, URL, filename, title, etc.)
                    entity = (r.get("contact_id") or r.get("sender_id") or r.get("url") or 
                              r.get("path") or r.get("filename") or r.get("record_id"))
                    if entity:
                        platform_user_entities[p][uid].add(entity)

        # Check all users have >= 50 items
        counts = list(platform_user_counts[p].values())
        min_cnt = min(counts)
        avg_cnt = sum(counts) / len(counts)
        print(f"[OK] Platform [{p:10s}]: Total records = {sum(counts):6d} | Min/User = {min_cnt:3d} | Avg/User = {avg_cnt:.1f}")
        assert min_cnt >= 50, f"Platform {p} has user with only {min_cnt} records (< 50)"

    print("\n" + "-" * 70)
    print("USER ISOLATION COMPARISON: USER_000001 (Soorya) vs USER_000002 (John / Riya)")
    print("-" * 70)

    u1_id = users[0]["user_id"]
    u2_id = users[1]["user_id"]
    u1_name = users[0]["name"]
    u2_name = users[1]["name"]

    print(f"Comparing User 1 ({u1_id} / {u1_name}) vs User 2 ({u2_id} / {u2_name}):")

    for p in platforms:
        u1_ents = platform_user_entities[p][u1_id]
        u2_ents = platform_user_entities[p][u2_id]
        overlap = u1_ents.intersection(u2_ents)
        print(f"  • {p:10s}: User 1 distinct items = {len(u1_ents):3d} | User 2 distinct items = {len(u2_ents):3d} | Overlap = {len(overlap)}")
        assert len(overlap) == 0, f"User isolation breach on {p}! Overlap found: {overlap}"

    print("\n[OK] DUAL ISOLATION VERIFIED: 0% data overlap between User 1 and User 2.")

    # Validate SQLite Repository Integration
    print("\n" + "-" * 70)
    print("VALIDATING SQLITE DATABASE SEEDING & QUERIES")
    print("-" * 70)

    conversation_repository.seed_if_empty()

    u1_convs = conversation_repository.get_user_conversations(u1_id)
    u2_convs = conversation_repository.get_user_conversations(u2_id)

    print(f"[OK] User 1 ({u1_name}) SQLite conversations count: {len(u1_convs)}")
    print(f"[OK] User 2 ({u2_name}) SQLite conversations count: {len(u2_convs)}")
    assert len(u1_convs) > 0, "User 1 has 0 conversations in SQLite"
    assert len(u2_convs) > 0, "User 2 has 0 conversations in SQLite"

    u1_conv_ids = set(c["conversation_id"] for c in u1_convs)
    u2_conv_ids = set(c["conversation_id"] for c in u2_convs)
    db_overlap = u1_conv_ids.intersection(u2_conv_ids)
    print(f"[OK] SQLite Conversation Isolation: Overlap between {u1_name} & {u2_name} = {len(db_overlap)}")
    assert len(db_overlap) == 0, f"SQLite conversation overlap found: {db_overlap}"

    print("\n" + "=" * 70)
    print("ALL LARGE-SCALE DATASET & ISOLATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_validation()
