import asyncio
import os
import json
from pathlib import Path
from httpx import AsyncClient, ASGITransport

from main import app
from app.db.database import init_db, check_db_health
from app.services.video_service import video_security_service
from ml.datasets_service import get_datasets_manifest
from ml.preprocessing.validator import validate_dataset

async def run_video_pipeline_tests():
    print("==========================================================================")
    print("CYBERSHIELD AI — VIDEO SECURITY PIPELINE & DATASET INTEGRATION TEST")
    print("==========================================================================")

    init_db()
    db_status = check_db_health()
    print(f"[OK] Database Health: {db_status}")
    assert db_status == "connected"

    # 1. Test Dataset Directory Structure & metadata.csv Validation
    dataset_dir = Path("datasets/video_security")
    assert dataset_dir.exists(), "backend/datasets/video_security/ directory does not exist!"
    assert (dataset_dir / "safe").exists(), "backend/datasets/video_security/safe/ missing!"
    assert (dataset_dir / "real").exists(), "backend/datasets/video_security/real/ missing!"
    assert (dataset_dir / "deepfake").exists(), "backend/datasets/video_security/deepfake/ missing!"
    assert (dataset_dir / "manipulated").exists(), "backend/datasets/video_security/manipulated/ missing!"
    assert (dataset_dir / "metadata.csv").exists(), "backend/datasets/video_security/metadata.csv missing!"
    print("[OK] Video dataset directory structure verified (safe, real, deepfake, manipulated, metadata.csv).")

    val_rep = validate_dataset(str(dataset_dir / "metadata.csv"))
    print(f"[OK] Metadata CSV Validation: columns = {val_rep.get('columns')}, usable_rows = {val_rep.get('usable_rows')}")
    assert "video_id" in val_rep.get("columns", [])

    # 2. Test Manifest Detection via datasets_service
    manifest = get_datasets_manifest()
    video_manifest = next((d for d in manifest if d["modality"] == "video"), None)
    assert video_manifest is not None, "Video dataset missing from get_datasets_manifest()"
    print(f"[OK] Video Dataset Manifest: status = {video_manifest['status']}, model_status = {video_manifest['model_status']}")
    assert video_manifest["model_status"] == "MODEL_NOT_TRAINED"
    assert video_manifest["metrics"]["accuracy"] is None, "Accuracy must be None when model is not trained!"
    assert video_manifest["metrics"]["macro_f1"] is None, "Macro F1 must be None when model is not trained!"

    # 3. Test VideoSecurityService Direct Pipeline Execution
    payload = {
        "filename": "suspicious_call_sample.mp4",
        "source_platform": "whatsapp",
        "sender_name": "Unknown Contact (+91 98765 43210)",
        "sender_type": "simulated_attacker",
        "duration_sec": 12.5,
        "fps": 30.0,
        "width": 1920,
        "height": 1080
    }

    pipeline_res = video_security_service.run_pipeline(payload)
    print(f"[OK] Video Service Pipeline Execution:")
    print(f"     - Classification: {pipeline_res.classification}")
    print(f"     - Model Status: {pipeline_res.model_status}")
    print(f"     - Risk Level: {pipeline_res.risk_level}")
    print(f"     - Risk Score: {pipeline_res.risk_score}")
    print(f"     - Frames Extracted: {pipeline_res.frames_extracted_count}")
    print(f"     - Forensic Reasons: {pipeline_res.forensic_reasons}")

    assert pipeline_res.model_status == "MODEL_NOT_TRAINED"
    assert pipeline_res.classification == "MODEL_NOT_TRAINED"
    assert pipeline_res.risk_score == 0
    assert pipeline_res.frames_extracted_count >= 1

    # 4. Test FastAPI Async Endpoints via httpx
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # A. AI Models Endpoint Verification
        res_models = await client.get("/api/v1/ai/models")
        assert res_models.status_code == 200
        models_data = res_models.json()
        video_model_info = next((m for m in models_data if m["modality"] == "video"), None)
        assert video_model_info is not None
        print(f"[OK] GET /api/v1/ai/models (Video Modality): status = {video_model_info['status']}, accuracy = {video_model_info['accuracy']}")
        assert video_model_info["status"] == "MODEL_NOT_TRAINED"
        assert video_model_info["accuracy"] is None, "No fake accuracy allowed!"

        # B. Video Security Analyze Endpoint
        res_analyze = await client.post("/api/v1/video/analyze", json={
            "filename": "deepfake_interview.mp4",
            "source_platform": "instagram",
            "sender_name": "Synthetic Profile",
            "sender_type": "fake_account",
            "duration_sec": 15.0,
            "fps": 30.0
        })
        assert res_analyze.status_code == 200
        analyze_data = res_analyze.json()
        print(f"[OK] POST /api/v1/video/analyze: status = {analyze_data['model_status']}, classification = {analyze_data['classification']}")
        assert analyze_data["model_status"] == "MODEL_NOT_TRAINED"
        assert analyze_data["classification"] == "MODEL_NOT_TRAINED"

        # C. Notifications Integration Verification
        res_notifs = await client.get("/api/v1/notifications")
        assert res_notifs.status_code == 200
        notif_list = res_notifs.json()
        print(f"[OK] GET /api/v1/notifications: Total notifications = {len(notif_list)}")
        assert len(notif_list) >= 1

    print("==========================================================================")
    print("ALL VIDEO SECURITY PIPELINE & DATASET TESTS PASSED SUCCESSFULLY!")
    print("==========================================================================")

if __name__ == "__main__":
    asyncio.run(run_video_pipeline_tests())
