# CyberShield AI — Multi-AI Cybersecurity Protection Ecosystem

CyberShield AI is a comprehensive, production-hardened cross-platform cybersecurity protection ecosystem for **Android and Windows**. It monitors authorized digital events in real-time, routes content across 8 specialized AI detection models, computes standardized Explainable AI risk assessments (0–100), persists full event forensic timelines in an SQLite database, and empowers instant user decisions (**ALLOW / BLOCK / QUARANTINE / REVIEW**).

---

### 🛡️ Academic & Simulation Disclaimer
> **IMPORTANT ARCHITECTURE RULE**: This is an academic controlled simulation environment. CyberShield AI does **NOT** directly access, intercept, monitor, control, or take over third-party applications such as WhatsApp, Instagram, Facebook, Gmail, or Google Play Store. All tests utilize synthetic demonstration payloads and public benchmark datasets inside the sandboxed CyberShield event engine.

---

## 🏗️ 3-Platform Architecture

```
┌────────────────────────────┐       ┌────────────────────────────┐       ┌────────────────────────────┐
│   PLATFORM 1: SENDER HUB   │       │ PLATFORM 2: RECEIVER APP   │       │ PLATFORM 3: CYBERSHIELD AI │
│  • 5 Personas              │       │  • 8 Simulated Surfaces    │       │  • Multimodal Model Router │
│  • 8 Modality Generators   │──────▶│  • Quarantine Vault        │◀──────│  • Trained ML Inference    │
│  • Quick Attack Fixtures   │       │  • Review & Agency Controls│       │  • Explainable Risk Engine │
│  • Controlled Payloads     │       │  • Safe Delivery Surface   │       │  • SQLite Database Layer   │
└────────────────────────────┘       └────────────────────────────┘       └────────────────────────────┘
```

---

## 🤖 Multimodal AI Threat Detection Engines

CyberShield AI features 8 dedicated threat classification engines backed by modular preprocessors, lexical feature extractors, and calibrated risk scoring:

1. **SMS Scam Detection AI (`sms_scam_detection_ai`)**: TF-IDF + Logistic Regression analyzing lottery fraud, OTP traps, and urgency pressure phrases.
2. **Email Phishing Detection AI (`email_phishing_detection_ai`)**: TF-IDF + Linear classifier inspecting credential harvesting, urgent deactivation threats, and deceptive links.
3. **URL Threat & Domain Classifier (`url_threat_detection_ai`)**: Lexical feature classifier inspecting direct IP hosts, suspicious TLDs (`.xyz`, `.top`), and unencrypted HTTP protocols.
4. **Fake News & Disinformation AI (`fake_news_classifier_ai`)**: Linguistic distortion NLP classifier detecting sensationalist headlines and unverified factual claims.
5. **Image Manipulation Forensics (`image_manipulation_ai`)**: Local EXIF metadata verification, copy-move pixel anomalies, and GAN synthesis residual detection.
6. **Deepfake Video Stream Pipeline (`deepfake_video_pipeline`)**: Temporal frame sampling, facial boundary warping detection, and spectral frequency consistency checks.
7. **Fake Profile & Bot Analyzer (`fake_profile_analyzer_ai`)**: Account velocity, follower/following ratio asymmetry ($>50:1$), and promotional spam heuristics.
8. **File Security & Metadata Pipeline (`file_security_pipeline`)**: Dangerous executable/macro signatures (`.xlsm`, `.exe`, `.bat`), double extension camouflage, and PE header analysis.

---

## 📊 Standardized Risk Engine & Security Policy

| Risk Score | Risk Level | Automated Decision | User Agency & Quarantine Policy |
| :---: | :---: | :---: | :--- |
| **0 – 29** | `LOW` | **ALLOW** | Delivered immediately to the target receiver surface. |
| **30 – 59** | `MEDIUM` | **REVIEW** | Held in review queue; receiver evaluates indicators before allowing or blocking. |
| **60 – 84** | `HIGH` | **BLOCK / REVIEW** | Blocked automatically; officer can override with full audit trail. |
| **85 – 100** | `CRITICAL` | **QUARANTINE** | Masked and locked in the quarantine vault; safe preview and forensic analysis. |

---

## 🚀 Setup & Execution

### 1. Backend (FastAPI + SQLAlchemy + SQLite + ML Engine)
```powershell
cd backend
python -m pip install -r requirements.txt
python main.py
# Server runs on: http://127.0.0.1:8000
# OpenAPI Docs:   http://127.0.0.1:8000/api/v1/docs
```

### 2. Frontend (Vite + React + TypeScript + Responsive CSS)
```powershell
cd frontend
npm install
npm run dev
# Application runs on: http://localhost:5173
```

### 3. Run Test Suite
```powershell
cd backend
# Run all detector, ML pipeline, and backend regression tests
python -m unittest discover tests
python test_health.py

cd ../frontend
npm run build
```

---

## 📋 Module Roadmap Status
- [x] **Module 1**: Project Foundation and Architecture
- [x] **Module 2**: Professional UI/UX and Navigation (Windows + Android Views)
- [x] **Module 3**: Authentication, User Management, and Dark/Light Theme
- [x] **Module 4**: Sender Platform (Controlled Security Test Hub)
- [x] **Module 5**: Receiver Platform (Protected Multi-App Simulation)
- [x] **Module 6**: Communication & Real-Time Security Event System (Event Bus & Monitor)
- [x] **Module 7**: Database & Event Storage Architecture (SQLite + SQLAlchemy 2.0)
- [x] **Module 8**: Threat Analysis Engine & Multimodal AI Pipeline
- [x] **Module 9**: Real Dataset & AI Model Integration (TF-IDF + ML Classifiers)
- [x] **Module 10**: Performance Optimization, Production Hardening & Full-System Integration Verification
