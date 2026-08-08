import asyncio
from httpx import AsyncClient, ASGITransport
from main import app

async def test_api():
    print("Testing FastAPI CyberShield AI backend & Module 6 Communication/Event System...")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Test Root Endpoint
        res_root = await client.get("/")
        print(f"GET / => Status: {res_root.status_code}")
        assert res_root.status_code == 200

        # 2. Test Health Endpoint
        res_health = await client.get("/api/v1/health")
        print(f"GET /api/v1/health => Status: {res_health.status_code}")
        assert res_health.status_code == 200
        assert res_health.json()["status"] == "healthy"

        # 3. Test Metrics Endpoint
        res_metrics = await client.get("/api/v1/metrics")
        print(f"GET /api/v1/metrics => Status: {res_metrics.status_code}")
        assert res_metrics.status_code == 200

        # 4. Test Events Analysis Endpoint (SMS Scam Test)
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
        print(f"AI Output: Classification={ai_data['classification']}, Risk={ai_data['risk_level']} ({ai_data['risk_score']}/100), Model={ai_data['model']}")
        assert ai_data["classification"] == "SCAM"
        assert ai_data["risk_level"] == "CRITICAL"

        # 5. Test Event Dispatch / Send Endpoint
        res_send = await client.post("/api/v1/events/send", json={
            "event_id": "EVT-10088",
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
        assert event_sent["event_id"] == "EVT-10088"
        assert len(event_sent["timeline"]) >= 4

        # 6. Test Event List Endpoint
        res_list = await client.get("/api/v1/events")
        print(f"GET /api/v1/events => Status: {res_list.status_code}, Total: {len(res_list.json())}")
        assert res_list.status_code == 200
        assert len(res_list.json()) >= 1

        # 7. Test Event Stats Endpoint
        res_stats = await client.get("/api/v1/events/stats")
        print(f"GET /api/v1/events/stats => Status: {res_stats.status_code}, Stats: {res_stats.json()}")
        assert res_stats.status_code == 200
        assert res_stats.json()["total_events"] >= 1

        # 8. Test Single Event Retrieval
        res_single = await client.get("/api/v1/events/EVT-10088")
        print(f"GET /api/v1/events/EVT-10088 => Status: {res_single.status_code}")
        assert res_single.status_code == 200
        assert res_single.json()["event_id"] == "EVT-10088"

        # 9. Test Event Action Update (e.g. ALLOW or BLOCK)
        res_action = await client.post("/api/v1/events/EVT-10088/action", json={"action": "ALLOW"})
        print(f"POST /api/v1/events/EVT-10088/action => Status: {res_action.status_code}")
        assert res_action.status_code == 200
        assert res_action.json()["user_action"] == "ALLOW"

    print("\n[SUCCESS] All CyberShield AI backend & Module 6 Communication/Event endpoints verified and functional!")

if __name__ == "__main__":
    asyncio.run(test_api())
