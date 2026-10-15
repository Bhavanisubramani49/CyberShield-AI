import asyncio
from app.db.database import init_db
from app.db.conversation_repository import conversation_repository

def test_user_isolation():
    print("Initializing Database & Seeding Dataset Users...")
    init_db()

    print("\n1. Testing Dataset Users Retrieval...")
    users = conversation_repository.get_all_demo_users()
    print(f"Total dataset demo users in DB: {len(users)}")
    assert len(users) >= 50, f"Expected at least 50 dataset users in DB, got {len(users)}"

    print("\n2. Testing User A (Naveen / USER_000001) Conversations...")
    convs_naveen = conversation_repository.get_user_conversations("USER_000001")
    print(f"Naveen Conversations Count: {len(convs_naveen)}")
    for c in convs_naveen:
        print(f"  - [{c['channel']}] {c['title']} (ID: {c['conversation_id']})")
    assert len(convs_naveen) > 0, "Naveen should have conversations!"

    print("\n3. Testing User B (Kavin / USER_000010) Conversations...")
    convs_kavin = conversation_repository.get_user_conversations("USER_000010")
    print(f"Kavin Conversations Count: {len(convs_kavin)}")
    for c in convs_kavin:
        print(f"  - [{c['channel']}] {c['title']} (ID: {c['conversation_id']})")
    assert len(convs_kavin) > 0, "Kavin should have conversations!"

    print("\n4. Testing Isolated Logged-In User ('Soorya')...")
    convs_soorya = conversation_repository.get_user_conversations("Soorya")
    print(f"Soorya Conversations Count: {len(convs_soorya)}")
    for c in convs_soorya:
        print(f"  - [{c['channel']}] {c['title']} (ID: {c['conversation_id']})")
    
    # Verify Soorya's conversations do NOT match Kavin's conversation IDs!
    kavin_ids = {c['conversation_id'] for c in convs_kavin}
    soorya_ids = {c['conversation_id'] for c in convs_soorya}
    overlap = kavin_ids.intersection(soorya_ids)
    print(f"Overlap between Kavin and Soorya conversation IDs: {overlap}")
    assert len(overlap) == 0, f"USER ISOLATION FAILED! Soorya shared conversation IDs with Kavin: {overlap}"

    print("\n5. Testing Channel Filtering (WhatsApp vs SMS vs Email)...")
    wa_kavin = conversation_repository.get_user_conversations("USER_000010", channel="WHATSAPP")
    sms_kavin = conversation_repository.get_user_conversations("USER_000010", channel="SMS")
    email_kavin = conversation_repository.get_user_conversations("USER_000010", channel="EMAIL")

    print(f"Kavin WhatsApp Convs: {len(wa_kavin)}, SMS: {len(sms_kavin)}, Email: {len(email_kavin)}")
    assert all(c['channel'] == 'WHATSAPP' for c in wa_kavin), "Channel filter WHATSAPP failed!"
    assert all(c['channel'] == 'SMS' for c in sms_kavin), "Channel filter SMS failed!"
    assert all(c['channel'] == 'EMAIL' for c in email_kavin), "Channel filter EMAIL failed!"

    print("\n[SUCCESS] Strict Dual User + Platform Isolation Fully Verified!")

if __name__ == "__main__":
    test_user_isolation()
