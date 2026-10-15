import json
from pathlib import Path
from typing import Dict, Any, List
from ml.preprocessing.validator import validate_dataset

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATASETS_DIR = BACKEND_DIR / "datasets"
MODELS_DIR = BACKEND_DIR / "ml" / "models"

def get_datasets_manifest() -> List[Dict[str, Any]]:
    """
    Returns comprehensive dataset inspection manifest:
    - Dataset Name
    - Modality
    - Total Rows
    - Target Classes
    - Status
    - Trained Model Name
    - Evaluation Metrics (Accuracy, Precision, Recall, F1)
    """
    manifest = []
    dataset_mappings = [
        ("messages/sms_scam_dataset.csv", "message", "sms_scam_meta.json"),
        ("emails/email_phishing_dataset.csv", "email", "email_phishing_meta.json"),
        ("urls/url_threat_dataset.csv", "url", "url_threat_meta.json"),
        ("fake_news/fake_news_dataset.csv", "news", "fake_news_meta.json"),
        ("profiles/profile_anomaly_dataset.csv", "profile", "profile_anomaly_meta.json"),
        ("files/file_security_dataset.csv", "file", "file_security_meta.json"),
        ("video_security/metadata.csv", "video", "video_security_meta.json")
    ]

    for rel_csv, modality, meta_file in dataset_mappings:
        csv_path = DATASETS_DIR / rel_csv
        val_rep = validate_dataset(str(csv_path)) if csv_path.exists() else {}

        meta_path = MODELS_DIR / meta_file
        meta_data = {}
        if meta_path.exists():
            try:
                with open(meta_path, "r", encoding="utf-8") as f:
                    meta_data = json.load(f)
            except Exception:
                pass

        has_trained_meta = bool(meta_data)
        model_status = meta_data.get("status", "TRAINED") if has_trained_meta else "MODEL_NOT_TRAINED"
        algorithm = meta_data.get("algorithm", "ML Classification Baseline") if has_trained_meta else "Pipeline Structure Ready (Awaiting Model Training)"
        metrics = meta_data.get("metrics", None) if has_trained_meta else {
            "accuracy": None,
            "precision": None,
            "recall": None,
            "macro_f1": None
        }

        manifest.append({
            "dataset_name": csv_path.name if csv_path.exists() else rel_csv,
            "modality": modality,
            "rows": val_rep.get("total_rows", 0),
            "columns": val_rep.get("columns", []),
            "classes": val_rep.get("classes", []),
            "class_distribution": val_rep.get("class_distribution", {}),
            "status": "VALID_AND_CONNECTED" if val_rep.get("usable_rows", 0) > 0 else "READY_FOR_DATASET",
            "trained_model": meta_data.get("model_name", f"{modality}_model") if has_trained_meta else f"{modality}_security_pipeline",
            "model_status": model_status,
            "algorithm": algorithm,
            "metrics": metrics
        })

    return manifest
