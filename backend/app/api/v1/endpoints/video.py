from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import Optional, Dict, Any
from pydantic import BaseModel
import os
import tempfile
from datetime import datetime, timezone

from app.services.video_service import video_security_service, VideoAnalysisPipelineResult
from app.services.event_processor import event_processor_service
from app.services.notification_service import notification_service
from app.schemas.events import AISecurityResultSchema
from app.db.database import SessionLocal
from app.db.models import SecurityEventModel

router = APIRouter(prefix="/video", tags=["Video Security Pipeline"])

class VideoAnalyzeJSONRequest(BaseModel):
    filename: str = "video_sample.mp4"
    source_platform: Optional[str] = "videos"
    sender_id: Optional[str] = None
    sender_name: Optional[str] = "Unknown Sender"
    sender_type: str = "normal_user"
    duration_sec: Optional[float] = 0.0
    fps: Optional[float] = 30.0
    width: Optional[int] = 1920
    height: Optional[int] = 1080
    payload: Optional[Dict[str, Any]] = None

@router.post("/analyze", summary="Analyze Video File / Payload via Video Security Pipeline")
async def analyze_video_payload(req: VideoAnalyzeJSONRequest) -> Dict[str, Any]:
    """
    Video Security Pipeline Endpoint:
    - Accepts video metadata, filename, source platform, and sender context
    - Executes frame sampling & video metadata extraction
    - Returns MODEL_NOT_TRAINED status when no trained model weights exist
    - Stores Security Event and dispatches CyberShield Notification
    """
    try:
        payload = req.payload or {}
        payload.update({
            "filename": req.filename,
            "source_platform": req.source_platform,
            "sender_id": req.sender_id,
            "sender_name": req.sender_name,
            "sender_type": req.sender_type,
            "duration_sec": req.duration_sec,
            "fps": req.fps,
            "width": req.width,
            "height": req.height
        })

        pipeline_res = video_security_service.run_pipeline(payload)
        threat_res = video_security_service.to_threat_analysis_result(pipeline_res)

        ai_result_schema = AISecurityResultSchema(
            classification=threat_res.classification,
            confidence=threat_res.confidence,
            risk_score=threat_res.risk_score,
            risk_level=threat_res.risk_level,
            reasons=threat_res.forensic_reasons,
            recommendation=threat_res.recommended_action,
            model=threat_res.model_name,
            timestamp=datetime.now(timezone.utc).isoformat(),
            processing_time_ms=threat_res.processing_time_ms
        )

        # Store security event & dispatch notification
        event_id = f"EVT-VID-{int(os.urandom(3).hex(), 16):06d}"
        stored_event = event_processor_service.process_and_store_event(
            event_id=event_id,
            content_type="video",
            platform=req.source_platform or "videos",
            sender_type=req.sender_type,
            sender_name=req.sender_name or req.sender_id or "Video Sender",
            recipient_id="CyberShield Protected Receiver",
            payload=payload,
            ai_result=ai_result_schema
        )

        db = SessionLocal()
        try:
            event_model = db.query(SecurityEventModel).filter(SecurityEventModel.event_id == stored_event.event_id).first()
            if event_model:
                notification_service.create_notification_from_event(event_model)
        finally:
            db.close()

        return pipeline_res.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video pipeline processing error: {str(e)}")

@router.post("/upload", summary="Upload MP4 Video for Security Pipeline Analysis")
async def upload_video_file(
    file: UploadFile = File(...),
    source_platform: str = Form("videos"),
    sender_name: str = Form("Video Uploader"),
    sender_type: str = Form("normal_user")
) -> Dict[str, Any]:
    """
    Accepts raw MP4 video file upload for frame sampling, metadata extraction,
    and video security pipeline execution.
    """
    if not file.filename.lower().endswith((".mp4", ".mov", ".avi", ".webm", ".mkv")):
        raise HTTPException(status_code=400, detail="Only video files (.mp4, .mov, .avi, .webm, .mkv) are supported.")

    file_bytes = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        payload = {
            "filename": file.filename,
            "source_platform": source_platform,
            "sender_name": sender_name,
            "sender_type": sender_type
        }

        pipeline_res = video_security_service.run_pipeline(payload, filepath=tmp_path, file_bytes=file_bytes)
        threat_res = video_security_service.to_threat_analysis_result(pipeline_res)

        ai_result_schema = AISecurityResultSchema(
            classification=threat_res.classification,
            confidence=threat_res.confidence,
            risk_score=threat_res.risk_score,
            risk_level=threat_res.risk_level,
            reasons=threat_res.forensic_reasons,
            recommendation=threat_res.recommended_action,
            model=threat_res.model_name,
            timestamp=datetime.now(timezone.utc).isoformat(),
            processing_time_ms=threat_res.processing_time_ms
        )

        event_id = f"EVT-VID-UPL-{int(os.urandom(3).hex(), 16):06d}"
        stored_event = event_processor_service.process_and_store_event(
            event_id=event_id,
            content_type="video",
            platform=source_platform,
            sender_type=sender_type,
            sender_name=sender_name,
            recipient_id="CyberShield Protected Receiver",
            payload=payload,
            ai_result=ai_result_schema
        )

        db = SessionLocal()
        try:
            event_model = db.query(SecurityEventModel).filter(SecurityEventModel.event_id == stored_event.event_id).first()
            if event_model:
                notification_service.create_notification_from_event(event_model)
        finally:
            db.close()

        return pipeline_res.model_dump()
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
