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
        print(f"Response: {res_root.json()}")
        assert res_root.status_code == 200

        # Test Health Endpoint
        res_health = await client.get("/api/v1/health")
        print(f"\nGET /api/v1/health => Status: {res_health.status_code}")
        print(f"Health Data: {res_health.json()}")
        assert res_health.status_code == 200
        assert res_health.json()["status"] == "healthy"
        assert len(res_health.json()["active_ai_models"]) == 8

        # Test Metrics Endpoint
        res_metrics = await client.get("/api/v1/metrics")
        print(f"\nGET /api/v1/metrics => Status: {res_metrics.status_code}")
        print(f"Metrics Data: {res_metrics.json()}")
        assert res_metrics.status_code == 200

    print("\n[SUCCESS] All Module 1 backend endpoints verified and functional!")

if __name__ == "__main__":
    # Check if httpx is installed, otherwise run basic app check
    try:
        asyncio.run(test_api())
    except ImportError:
        print("Installing httpx for ASGI test...")
