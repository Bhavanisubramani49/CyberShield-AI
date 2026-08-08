from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
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

@router.post("/events/send", response_model=SecurityEventSchema, summary="Send Security Event to Event Pipeline & Receiver")
async def send_security_event(req: EventSendRequest):
    """
    Transfers the simulated event into the CyberShield AI event processor and Receiver queue.
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

@router.get("/events", response_model=List[SecurityEventSchema], summary="Get Event Simulation History")
async def get_security_events():
    """
    Returns list of all events managed by the central event processor.
    """
    return event_processor_service.get_all_events()

@router.get("/events/stats", response_model=EventStatsSchema, summary="Get Dynamic Event Statistics")
async def get_event_statistics():
    """
    Returns real-time computed statistics: total events, threats, quarantined, blocked, under review.
    """
    return event_processor_service.get_event_stats()

@router.get("/events/stream", summary="Server-Sent Events Stream for Real-Time Event Activity")
async def stream_security_events():
    """
    Real-time SSE event stream pushing active security events to connected monitoring surfaces.
    """
    async def event_generator():
        while True:
            events = event_processor_service.get_all_events()
            data = json.dumps([e.model_dump() for e in events[:10]])
            yield f"data: {data}\n\n"
            await asyncio.sleep(3.0)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/events/{event_id}", response_model=SecurityEventSchema, summary="Get Event Details by ID")
async def get_event_by_id(event_id: str):
    """
    Retrieves full forensic details and processing timeline for a specific Event ID.
    """
    event = event_processor_service.get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found in event repository")
    return event

@router.post("/events/{event_id}/action", response_model=SecurityEventSchema, summary="Update User Decision Action for Event")
async def update_event_action(event_id: str, req: UserActionUpdateRequest):
    """
    Updates the security state and decision (ALLOW, BLOCK, QUARANTINE, REVIEW) for an event.
    """
    try:
        updated = event_processor_service.update_event_action(event_id, req.action)
        if not updated:
            raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")
        return updated
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Action update error: {str(e)}")
