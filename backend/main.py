from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import health, events, ai, dashboard, notifications, integrations, gateway
from app.db.database import init_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CyberShield AI - Cross-Platform Multi-AI Cybersecurity Protection Ecosystem",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# CORS configuration for cross-platform clients (Android WebView / Windows App / Vite Web)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:3000"],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from fastapi.staticfiles import StaticFiles

# Ensure demo media folder exists and mount static directory
os.makedirs("data/demo", exist_ok=True)
app.mount("/media", StaticFiles(directory="data/demo"), name="media")

# Automatically initialize SQLite tables and baseline seed
@app.on_event("startup")
def on_startup():
    init_db()

# Include v1 API routes
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["System Health"])
app.include_router(events.router, prefix=settings.API_V1_STR, tags=["Security Events & Analysis"])
app.include_router(ai.router, prefix=settings.API_V1_STR, tags=["AI Engine Registry"])
app.include_router(dashboard.router, prefix=settings.API_V1_STR, tags=["Security Dashboard & Analytics"])
app.include_router(notifications.router, prefix=settings.API_V1_STR, tags=["Real-Time Security Notifications"])
app.include_router(integrations.router, prefix=settings.API_V1_STR, tags=["Platform Integration & Permissions"])
app.include_router(gateway.router, prefix=settings.API_V1_STR, tags=["External Gateway & Inter-App Bridge"])

@app.get("/", tags=["Root"])
async def root():
    return {
        "ecosystem": "CyberShield AI",
        "status": "Online",
        "version": settings.VERSION,
        "docs_url": f"{settings.API_V1_STR}/docs",
        "three_platforms": {
            "platform_1": "Sender Platform (Simulation & Attack Generators)",
            "platform_2": "Receiver Platform (Multi-App Environment)",
            "platform_3": "CyberShield AI Security Platform (Engine, Router, Risk, Explanations)"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
