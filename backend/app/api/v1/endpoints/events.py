from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import List, Optional
import json
import asyncio
from app.schemas.events import (
    EventAnalyzeRequest, 
    EventSendRequest, 
    AISecurityResultSchema, 
    SecurityEventSchema,
    EventStatsSchema,
    UserActionUpdateRequest
)
from app.services.event_processor import event_processor_service

router = APIRouter()

@router.post("/events/analyze", response_model=AISecurityResultSchema, summary="Analyze Security Event via Model Router")
async def analyze_security_event(req: EventAnalyzeRequest):
    """
    Routes incoming simulation content to the appropriate specialized AI detector.
    Returns standardized risk score (0-100), Explainable AI reasons, and recommended action.
    """
    try:
        return event_processor_service.analyze_payload(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI inference error: {str(e)}")

@router.post("/events/send", response_model=SecurityEventSchema, summary="Send Security Event to SQLite Database & Receiver")
async def send_security_event(req: EventSendRequest):
    """
    Transfers the simulated event permanently into the SQLite database repository and Receiver queue.
    """
    try:
        return event_processor_service.process_and_store_event(
            event_id=req.event_id,
            content_type=req.content_type,
            sender_type=req.sender_type,
            sender_name=req.sender_name,
            payload=req.payload,
            ai_result=req.ai_result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Event dispatch error: {str(e)}")

@router.get("/events", response_model=List[SecurityEventSchema], summary="Get Event Simulation History from Database")
async def get_security_events(
    modality: Optional[str] = Query(None, description="Filter by modality e.g. message, email, url"),
    risk_level: Optional[str] = Query(None, description="Filter by risk e.g. LOW, MEDIUM, HIGH, CRITICAL"),
    action: Optional[str] = Query(None, description="Filter by action e.g. ALLOW, BLOCK, QUARANTINE, REVIEW"),
    classification: Optional[str] = Query(None, description="Filter by classification e.g. SCAM, PHISHING, SAFE"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by ID, sender, classification, modality, model, or content"),
    date_filter: Optional[str] = Query(None, description="Filter by timeframe: all, 24h, 7d, 30d"),
    sort_by: Optional[str] = Query("newest", description="Sort order: newest, oldest, highest_risk, lowest_risk"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Returns filtered, searched, sorted, and paginated list of security events from persistent SQLite database.
    """
    return event_processor_service.get_all_events(
        modality=modality,
        risk_level=risk_level,
        action=action,
        classification=classification,
        status=status,
        search=search,
        date_filter=date_filter,
        sort_by=sort_by,
        page=page,
        limit=limit
    )

@router.get("/events/stats", response_model=EventStatsSchema, summary="Get Dynamic Database Event Statistics")
async def get_event_statistics():
    """
    Returns real-time computed statistics aggregated directly from the SQLite database repository.
    """
    return event_processor_service.get_event_stats()

@router.get("/events/stream", summary="Server-Sent Events Stream for Real-Time Event Activity")
async def stream_security_events():
    """
    Real-time SSE event stream pushing active security events from database to connected monitoring surfaces.
    Handles client disconnects and resource cleanup safely.
    """
    async def event_generator():
        try:
            while True:
                events = event_processor_service.get_all_events(page=1, limit=10)
                data = json.dumps([e.model_dump() for e in events])
                yield f"data: {data}\n\n"
                await asyncio.sleep(3.0)
        except (asyncio.CancelledError, GeneratorExit):
            # Client disconnected cleanly
            pass
        except Exception as e:
            # Fallback safe close
            yield f"data: []\n\n"

    return StreamingResponse(
        event_generator(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/events/{event_id}", response_model=SecurityEventSchema, summary="Get Event Details by ID from Database")
async def get_event_by_id(event_id: str):
    """
    Retrieves full forensic details and processing timeline for a specific Event ID from SQLite.
    """
    event = event_processor_service.get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found in database repository")
    return event

@router.post("/events/{event_id}/action", response_model=SecurityEventSchema, summary="Update User Action & Audit in Database")
async def update_event_action(event_id: str, req: UserActionUpdateRequest):
    """
    Updates the security decision (ALLOW, BLOCK, QUARANTINE, REVIEW) and records audit trail in SQLite.
    """
    try:
        updated = event_processor_service.update_event_action(event_id, req.action)
        if not updated:
            raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found in database")
        return updated
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Action update error: {str(e)}")

@router.delete("/events/{event_id}", summary="Delete Simulated Event from Database")
async def delete_event(event_id: str):
    """
    Controlled simulation deletion: removes event, associated timeline, and action records from SQLite.
    """
    deleted = event_processor_service.delete_event(event_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")
    return {"status": "success", "message": f"Event '{event_id}' deleted from simulation database"}
