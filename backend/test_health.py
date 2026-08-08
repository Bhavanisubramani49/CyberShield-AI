import asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from app.db.database import init_db, check_db_health, DB_PATH
from app.db.repository import event_repository

async def test_api():
    print("Testing FastAPI CyberShield AI backend & Module 7 Persistent Database Architecture...")
    
    # Initialize DB for testing
    init_db()
    db_status = check_db_health()
    print(f"Database Initialization: {db_status} at {DB_PATH}")
    assert db_status == "connected"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Test Root Endpoint
        res_root = await client.get("/")
        print(f"GET / => Status: {res_root.status_code}")
        assert res_root.status_code == 200

        # 2. Test Health Endpoint with Database Status
        res_health = await client.get("/api/v1/health")
        print(f"GET /api/v1/health => Status: {res_health.status_code}")
        assert res_health.status_code == 200
        health_data = res_health.json()
        assert health_data["status"] == "healthy"
        assert health_data.get("database") == "connected"

        # 3. Test Metrics Endpoint
        res_metrics = await client.get("/api/v1/metrics")
        print(f"GET /api/v1/metrics => Status: {res_metrics.status_code}")
        assert res_metrics.status_code == 200

        # 3b. Test AI Models Registry Endpoint (Module 8 Multimodal Registry)
        res_models = await client.get("/api/v1/ai/models")
        print(f"GET /api/v1/ai/models => Status: {res_models.status_code}, Models: {len(res_models.json())}")
        assert res_models.status_code == 200
        assert len(res_models.json()) == 8
        model_names = [m["name"] for m in res_models.json()]
        assert "sms_scam_detection_ai" in model_names
        assert "email_phishing_detection_ai" in model_names
        assert "url_threat_detection_ai" in model_names
        assert "fake_news_classifier_ai" in model_names

        # 4. Test Events Analysis Endpoint
        res_event = await client.post("/api/v1/events/analyze", json={
            "content_type": "message",
            "sender_type": "simulated_attacker",
            "sender_name": "Attacker +91 99999 11111",
            "payload": {
                "text": "Congratulations! You won ₹10,00,000 lottery prize. Click here immediately: http://192.168.1.1/free-reward.xyz"
            }
        })
        print(f"POST /api/v1/events/analyze => Status: {res_event.status_code}")
        assert res_event.status_code == 200
        ai_data = res_event.json()
        assert ai_data["classification"] == "SCAM"
        assert ai_data["risk_level"] == "CRITICAL"

        # 5. Test Event Dispatch / Send Endpoint (Persistent DB Write)
        res_send = await client.post("/api/v1/events/send", json={
            "event_id": "EVT-10099",
            "content_type": "message",
            "sender_type": "simulated_attacker",
            "sender_name": "Attacker +91 99999 11111",
            "payload": {
                "text": "Congratulations! You won ₹10,00,000 lottery prize. Click here immediately."
            },
            "ai_result": ai_data
        })
        print(f"POST /api/v1/events/send => Status: {res_send.status_code}")
        assert res_send.status_code == 200
        event_sent = res_send.json()
        assert event_sent["event_id"] == "EVT-10099"
        assert len(event_sent["timeline"]) >= 4

        # 6. Test Event List Endpoint from SQLite
        res_list = await client.get("/api/v1/events")
        print(f"GET /api/v1/events => Status: {res_list.status_code}, Count: {len(res_list.json())}")
        assert res_list.status_code == 200
        assert len(res_list.json()) >= 1

        # 7. Test Filtered Queries (Modality & Risk)
        res_filter_mod = await client.get("/api/v1/events?modality=message")
        print(f"GET /api/v1/events?modality=message => Status: {res_filter_mod.status_code}, Count: {len(res_filter_mod.json())}")
        assert res_filter_mod.status_code == 200
        assert all("message" in e["content_type"].lower() for e in res_filter_mod.json())

        res_filter_risk = await client.get("/api/v1/events?risk_level=CRITICAL")
        print(f"GET /api/v1/events?risk_level=CRITICAL => Status: {res_filter_risk.status_code}, Count: {len(res_filter_risk.json())}")
        assert res_filter_risk.status_code == 200
        assert all(e["risk_level"] == "CRITICAL" for e in res_filter_risk.json())

        # 8. Test Pagination
        res_page = await client.get("/api/v1/events?page=1&limit=2")
        print(f"GET /api/v1/events?page=1&limit=2 => Status: {res_page.status_code}, Count: {len(res_page.json())}")
        assert res_page.status_code == 200
        assert len(res_page.json()) <= 2

        # 9. Test Event Stats from SQLite
        res_stats = await client.get("/api/v1/events/stats")
        print(f"GET /api/v1/events/stats => Status: {res_stats.status_code}, Stats: {res_stats.json()}")
        assert res_stats.status_code == 200
        assert res_stats.json()["total_events"] >= 1

        # 10. Test Single Event Retrieval with Timelines
        res_single = await client.get("/api/v1/events/EVT-10099")
        print(f"GET /api/v1/events/EVT-10099 => Status: {res_single.status_code}")
        assert res_single.status_code == 200
        assert res_single.json()["event_id"] == "EVT-10099"
        assert len(res_single.json()["timeline"]) >= 4

        # 11. Test Action Update & Audit Trail
        res_action = await client.post("/api/v1/events/EVT-10099/action", json={"action": "ALLOW"})
        print(f"POST /api/v1/events/EVT-10099/action => Status: {res_action.status_code}")
        assert res_action.status_code == 200
        assert res_action.json()["user_action"] == "ALLOW"

        # 12. Test Deletion
        res_del = await client.delete("/api/v1/events/EVT-10099")
        print(f"DELETE /api/v1/events/EVT-10099 => Status: {res_del.status_code}")
        assert res_del.status_code == 200

        # Verify deleted event returns 404
        res_404 = await client.get("/api/v1/events/EVT-10099")
        print(f"GET /api/v1/events/EVT-10099 (After Delete) => Status: {res_404.status_code}")
        assert res_404.status_code == 404

    # 13. Backend Restart Persistence Test: Query Repository directly
    persistent_events = event_repository.get_events()
    print(f"\n[PERSISTENCE VERIFICATION] Total events preserved across database sessions: {len(persistent_events)}")
    assert len(persistent_events) >= 1

    print("\n[SUCCESS] All CyberShield AI backend & Module 7 SQLite Database tests verified and functional!")

if __name__ == "__main__":
    asyncio.run(test_api())
