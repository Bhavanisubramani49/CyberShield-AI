from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import health, events

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
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 API routes
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["System Health"])
app.include_router(events.router, prefix=settings.API_V1_STR, tags=["Security Events & Analysis"])

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
