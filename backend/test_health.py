import asyncio
from httpx import AsyncClient, ASGITransport
from main import app

async def test_api():
    print("Testing FastAPI CyberShield AI backend endpoints...")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test Root Endpoint
        res_root = await client.get("/")
        print(f"GET / => Status: {res_root.status_code}")
        assert res_root.status_code == 200

        # Test Health Endpoint
        res_health = await client.get("/api/v1/health")
        print(f"GET /api/v1/health => Status: {res_health.status_code}")
        assert res_health.status_code == 200
        assert res_health.json()["status"] == "healthy"

        # Test Metrics Endpoint
        res_metrics = await client.get("/api/v1/metrics")
        print(f"GET /api/v1/metrics => Status: {res_metrics.status_code}")
        assert res_metrics.status_code == 200

        # Test Events Analysis Endpoint (SMS Scam Test)
        res_event = await client.post("/api/v1/events/analyze", json={
            "content_type": "message",
            "sender_type": "simulated_attacker",
            "sender_name": "Attacker +91 99999 11111",
            "payload": {
                "text": "Congratulations! You won ₹10,00,000. Click here immediately to claim your prize."
            }
        })
        print(f"POST /api/v1/events/analyze => Status: {res_event.status_code}")
        assert res_event.status_code == 200
        data = res_event.json()
        print(f"Analysis Output: Classification={data['classification']}, Risk={data['risk_level']}, Model={data['model']}")
        assert data["classification"] == "SCAM"
        assert data["risk_level"] == "CRITICAL"

    print("\n[SUCCESS] All CyberShield AI backend endpoints verified and functional!")

if __name__ == "__main__":
    asyncio.run(test_api())
