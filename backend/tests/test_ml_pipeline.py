import unittest
from pathlib import Path
from ml.preprocessing.validator import validate_dataset
from ml.preprocessing.text import clean_text, extract_bow_features
from ml.evaluation.metrics import compute_classification_metrics
from ml.training.trainer import train_message_model, train_email_model, train_url_model
from ml.inference.engine import ml_engine
from ml.datasets_service import get_datasets_manifest
from app.services.analysis import model_registry

class TestMLPipeline(unittest.TestCase):
    def test_dataset_validator(self):
        csv_path = Path(__file__).resolve().parent.parent / "datasets" / "messages" / "sms_scam_dataset.csv"
        report = validate_dataset(str(csv_path))
        self.assertEqual(report["status"], "VALID")
        self.assertGreater(report["total_rows"], 0)
        self.assertIn("label", report["columns"])
        self.assertIn("text", report["columns"])

    def test_text_preprocessing(self):
        raw = "   CONGRATULATIONS!  You Won ₹10,00,000   "
        cleaned = clean_text(raw)
        self.assertEqual(cleaned, "congratulations! you won ₹10,00,000")
        
        vec = extract_bow_features(cleaned, ["won", "lottery", "meeting"])
        self.assertGreater(vec[0], 0.0)
        self.assertEqual(vec[1], 0.0)

    def test_metrics_evaluation(self):
        y_true = ["scam", "safe", "scam", "safe", "scam"]
        y_pred = ["scam", "safe", "scam", "safe", "safe"]
        metrics = compute_classification_metrics(y_true, y_pred)
        self.assertGreaterEqual(metrics["accuracy"], 0.8)
        self.assertGreater(metrics["macro_f1"], 0.7)
        self.assertEqual(metrics["sample_count"], 5)

    def test_training_and_serialization(self):
        meta_msg = train_message_model()
        self.assertEqual(meta_msg["status"], "TRAINED")
        self.assertIn("accuracy", meta_msg["metrics"])

        meta_email = train_email_model()
        self.assertEqual(meta_email["status"], "TRAINED")

        meta_url = train_url_model()
        self.assertEqual(meta_url["status"], "TRAINED")

    def test_inference_pipeline(self):
        # Threat inference
        threat_res = ml_engine.predict_message("Congratulations! You won ₹10,00,000 lottery cash prize immediately.")
        self.assertEqual(threat_res.classification, "SCAM")
        self.assertIn(threat_res.risk_level, ["HIGH", "CRITICAL"])
        self.assertGreater(len(threat_res.forensic_reasons), 0)

        # Safe inference
        safe_res = ml_engine.predict_message("Hi Alex, let's review the pull request today at 3 PM.")
        self.assertEqual(safe_res.classification, "SAFE")
        self.assertEqual(safe_res.risk_level, "LOW")

    def test_datasets_manifest(self):
        manifest = get_datasets_manifest()
        self.assertEqual(len(manifest), 6)
        modalities = [d["modality"] for d in manifest]
        for mod in ["message", "email", "url", "news", "profile", "file"]:
            self.assertIn(mod, modalities)

    def test_model_registry_status(self):
        models = model_registry.list_models()
        self.assertEqual(len(models), 8)
        for m in models:
            self.assertIn(m["status"], ["TRAINED", "FALLBACK"])
            self.assertIn("accuracy", m)
            self.assertIn("precision", m)

if __name__ == "__main__":
    unittest.main()
