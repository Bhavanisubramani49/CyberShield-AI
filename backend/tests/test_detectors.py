import unittest
from app.services.analysis import model_registry
from app.services.analysis.message_detector import SMSScamDetector
from app.services.analysis.email_detector import EmailPhishingDetector
from app.services.analysis.url_detector import URLThreatDetector
from app.services.analysis.news_detector import FakeNewsDetector
from app.services.analysis.image_detector import ImageManipulationDetector
from app.services.analysis.video_detector import DeepfakeVideoDetector
from app.services.analysis.profile_detector import FakeProfileDetector
from app.services.analysis.file_detector import FileSecurityDetector

class TestMultimodalDetectors(unittest.TestCase):
    def test_sms_scam_detector(self):
        detector = SMSScamDetector()
        
        # 1. Threat input
        threat_res = detector.analyze({"text": "Congratulations! You won ₹10,00,000 lottery. Click http://192.168.1.1/free-reward.xyz immediately."})
        self.assertEqual(threat_res.classification, "SCAM")
        self.assertEqual(threat_res.risk_level, "CRITICAL")
        self.assertGreaterEqual(threat_res.risk_score, 85)
        self.assertIn("QUARANTINE", threat_res.recommended_action)
        self.assertGreater(len(threat_res.forensic_reasons), 0)

        # 2. Safe input
        safe_res = detector.analyze({"text": "Hi Alex, are we meeting at 3 PM today to review the project documentation?"})
        self.assertEqual(safe_res.classification, "SAFE")
        self.assertEqual(safe_res.risk_level, "LOW")
        self.assertEqual(safe_res.recommended_action, "ALLOW")

        # 3. Empty input
        empty_res = detector.analyze({"text": ""})
        self.assertEqual(empty_res.classification, "SAFE")
        self.assertEqual(empty_res.risk_level, "LOW")

    def test_email_phishing_detector(self):
        detector = EmailPhishingDetector()

        # 1. Threat input
        threat_res = detector.analyze({
            "subject": "Urgent: Your account is scheduled for immediate suspension",
            "body": "Your banking security profile requires immediate password re-verification.",
            "link": "http://192.168.1.1/bank-login.xyz"
        })
        self.assertEqual(threat_res.classification, "PHISHING")
        self.assertIn(threat_res.risk_level, ["HIGH", "CRITICAL"])
        self.assertIn(threat_res.recommended_action, ["BLOCK", "QUARANTINE"])

        # 2. Safe input
        safe_res = detector.analyze({
            "subject": "Weekly Team Update",
            "body": "Hi team, please find attached the quarterly project milestones.",
            "link": "https://enterprise.com/portal"
        })
        self.assertEqual(safe_res.classification, "SAFE")
        self.assertEqual(safe_res.recommended_action, "ALLOW")

    def test_url_threat_detector(self):
        detector = URLThreatDetector()

        # 1. Malicious IP URL
        mal_res = detector.analyze({"url": "http://192.168.1.1/verify-account.xyz"})
        self.assertEqual(mal_res.classification, "MALICIOUS")
        self.assertEqual(mal_res.risk_level, "CRITICAL")
        self.assertEqual(mal_res.recommended_action, "QUARANTINE" if mal_res.risk_score >= 85 else "BLOCK")

        # 2. Safe HTTPS URL
        safe_res = detector.analyze({"url": "https://cybershield.ai/documentation"})
        self.assertEqual(safe_res.classification, "SAFE")
        self.assertEqual(safe_res.recommended_action, "ALLOW")

    def test_fake_news_detector(self):
        detector = FakeNewsDetector()

        # 1. Disinformation input
        fake_res = detector.analyze({
            "headline": "SHOCKING: Central Government to ban all digital payment apps starting tomorrow!",
            "text": "An unverified leaked memo claims all digital currency will be frozen immediately."
        })
        self.assertEqual(fake_res.classification, "FAKE_NEWS")
        self.assertIn(fake_res.risk_level, ["HIGH", "CRITICAL"])

        # 2. Safe news
        safe_res = detector.analyze({
            "headline": "Cybersecurity Standards Updated for 2026 Enterprise Applications",
            "text": "National cyber agency releases official guidelines emphasizing zero-trust architecture."
        })
        self.assertEqual(safe_res.classification, "SAFE")

    def test_image_manipulation_detector(self):
        detector = ImageManipulationDetector()

        # 1. Manipulated image
        tampered_res = detector.analyze({
            "filename": "tampered_id_document_v2.png",
            "description": "Scanned national identity document with copy-move pixel manipulation and spliced signature area."
        })
        self.assertEqual(tampered_res.classification, "MANIPULATED")
        self.assertEqual(tampered_res.risk_level, "CRITICAL")

        # 2. Safe image
        safe_res = detector.analyze({
            "filename": "authentic_office_photo.png",
            "description": "Natural photograph with authentic EXIF metadata."
        })
        self.assertEqual(safe_res.classification, "SAFE")

    def test_deepfake_video_detector(self):
        detector = DeepfakeVideoDetector()

        # 1. Deepfake stream
        df_res = detector.analyze({
            "filename": "synthetic_face_swap_test_48fps.mp4",
            "description": "Deepfake video stream with facial boundary distortion and temporal GAN artifacts."
        })
        self.assertEqual(df_res.classification, "DEEPFAKE")
        self.assertEqual(df_res.risk_level, "CRITICAL")

        # 2. Safe video
        safe_res = detector.analyze({
            "filename": "authentic_keynote.mp4",
            "description": "Natural recorded keynote speech with verified temporal frame consistency."
        })
        self.assertEqual(safe_res.classification, "SAFE")

    def test_fake_profile_detector(self):
        detector = FakeProfileDetector()

        # 1. Bot profile
        bot_res = detector.analyze({
            "username": "@giveaway_reward_bot_99",
            "followers": 12,
            "following": 4820,
            "bio": "Official crypto lottery reward bot. Follow & claim instant ₹50,000 bonus cash!"
        })
        self.assertEqual(bot_res.classification, "FAKE_PROFILE")
        self.assertIn(bot_res.risk_level, ["HIGH", "CRITICAL"])

        # 2. Safe profile
        safe_res = detector.analyze({
            "username": "@alex_vance_phd",
            "followers": 1250,
            "following": 340,
            "bio": "Lead Cybersecurity Architect & AI Researcher."
        })
        self.assertEqual(safe_res.classification, "SAFE")

    def test_file_security_detector(self):
        detector = FileSecurityDetector()

        # 1. Dangerous macro spreadsheet
        macro_res = detector.analyze({
            "filename": "urgent_payroll_update.xlsm",
            "file_type": "Macro-Enabled Spreadsheet (.xlsm)"
        })
        self.assertEqual(macro_res.classification, "MALICIOUS")
        self.assertEqual(macro_res.risk_level, "CRITICAL")
        self.assertEqual(macro_res.recommended_action, "QUARANTINE")

        # 2. Safe PDF
        safe_res = detector.analyze({
            "filename": "annual_security_report.pdf",
            "file_type": "Standard PDF Document (.pdf)"
        })
        self.assertEqual(safe_res.classification, "SAFE")

    def test_model_registry(self):
        models = model_registry.list_models()
        self.assertEqual(len(models), 8)
        modalities = [m["modality"] for m in models]
        for expected in ["message", "email", "url", "news", "image", "video", "profile", "file"]:
            self.assertIn(expected, modalities)

        # Test automatic routing for all 8 modalities
        for mod in ["message", "email", "url", "news", "image", "video", "profile", "file"]:
            res = model_registry.route_and_analyze(mod, {"text": "test", "url": "test", "filename": "test"})
            self.assertIsNotNone(res.model_name)
            self.assertIsNotNone(res.classification)
            self.assertIsNotNone(res.risk_score)

if __name__ == "__main__":
    unittest.main()
