# CyberShield AI — Cross-Platform Multi-AI Cybersecurity Protection Ecosystem

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy_2.0-003B57.svg?logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)

> **CyberShield AI** is an advanced academic cybersecurity research platform and multimodal threat intelligence ecosystem. Designed for cross-platform defense on **Windows Desktop** and **Android Mobile**, it monitors digital communication streams across **8 distinct modalities**, computes Explainable AI risk assessments, isolates threats in a quarantine vault, and delivers real-time notifications with full user agency.

---

## 1. Project Overview & Problem Statement

Modern cyber attacks exploit diverse modalities simultaneously: financial SMS scams, deceptive banking phishing emails, obfuscated IP links, coordinated fake news, synthesized deepfakes, and macro-embedded attachments. Traditional antivirus tools operate reactively and lack explainability.

**CyberShield AI** addresses this challenge through a **zero-trust, decoupled 3-platform architecture**:
1. **Sender Platform (Simulation & Test Hub)**: Controlled security testing vectors.
2. **CyberShield AI Defense Engine**: Multimodal threat classification, calibrated risk scoring, and Explainable AI reasoning.
3. **Receiver Platform (Multi-App Surface)**: Protected client application simulated environments with instant quarantine isolation.

---

## 2. Key Architecture & Features

```
┌─────────────────┐       ┌────────────────────────┐       ┌─────────────────┐
│ SENDER PLATFORM │ ────▶ │ CYBERSHIELD DEFENSE AI │ ────▶ │RECEIVER PLATFORM│
│  (5 Personas)   │       │ (8 Specialized Models) │       │ (8 App Surfaces)│
└─────────────────┘       └────────────────────────┘       └─────────────────┘
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 ▼                                           ▼
       ┌───────────────────┐                       ┌───────────────────┐
       │ PERSISTENT SQLITE │                       │ REAL-TIME ALERTS  │
       │   (cybershield.db)│                       │  (SSE Notification)│
       └───────────────────┘                       └───────────────────┘
```

- **8 Specialized Multimodal Detectors**:
  - `sms_scam_detection_ai`: TF-IDF linguistic scanner for lottery traps and financial scams.
  - `email_phishing_classifier`: Header and credential harvesting detector.
  - `url_threat_evaluator`: Lexical entropy and raw IP host evaluator.
  - `fake_news_detector`: Sensationalist distortion and unverified claims classifier.
  - `image_manipulation_detector`: Error Level Analysis (ELA) and GAN pixel splice detector.
  - `deepfake_video_pipeline`: Temporal facial consistency and blink anomaly analyzer.
  - `fake_profile_analyzer`: Follower/following ratio and bot signature analyzer.
  - `file_security_checker`: File signature, macro heuristic, and entropy scanner.
- **Persistent Database Layer**: SQLite storage via SQLAlchemy (`backend/data/cybershield.db`) for events, 6-stage lifecycle milestones, user action audit records, and real-time alerts.
- **Zero-Trust Platform Integrations (Module 14)**: Decoupled adapter layer separating authorized local simulation from standby third-party targets (WhatsApp, Instagram, Facebook, Gmail, etc.) that strictly require official OAuth consent.
- **Real-Time Notification Center (Module 13)**: Interactive Header bell badge (`🔔 3`) with Server-Sent Events (SSE) streaming and critical alert highlighting.
- **Forensic Security Audit Center (Module 12)**: Paginated event inspection with Explainable AI reasoning bullets and filtered CSV export.
- **Academic Demo Suite (Module 15)**: 9 pre-calibrated academic security attack vectors with 1-click execution and real-time visual milestone tracking.

---

## 3. Complete 15-Module Engineering Roadmap

| Module | Core Achievement | Git Checkpoint |
| :--- | :--- | :--- |
| **Module 1** | Foundation architecture, FastAPI backend, CORS, health & telemetry | `81fd336` |
| **Module 2** | Professional UI/UX, Windows desktop command center, Android mobile viewport | `3355735` |
| **Module 3** | Authentication flow, Level-4 credentials, and Dark/Light theme persistence | `22f7bb7` |
| **Module 4** | Sender Platform with 5 personas, 8 modalities, and quick attack vectors | `498436a` |
| **Module 5** | Receiver Platform with 8 simulated app surfaces and vault quarantine | `393d1e0` |
| **Module 6** | Central Event Processor, 6-stage lifecycle bus, Communication Monitor | `1665068` |
| **Module 7** | Persistent SQLite database architecture at `backend/data/cybershield.db` | `f4e2292` |
| **Module 8** | Multimodal Threat Engine, `BaseThreatDetector`, and Model Registry | `874b8c7` |
| **Module 9** | Real dataset integration (`backend/datasets/`) and ML inference engine | `64dfd2c` |
| **Module 10** | Production hardening, disconnect-safe SSE streaming, indexed lookups | `f24e280` |
| **Module 11** | Security Dashboard, timeframe analytics (`24h`, `7d`, `30d`), CSV exporter | `1fb4474` |
| **Module 12** | Security History, deep forensic modal, multi-filter search & pagination | `ab4fcc5` |
| **Module 13** | Real-Time Notification Center, Header bell badge, and severity router | `3db7c4a` |
| **Module 14** | Platform Integration & Permission Architecture with zero-trust boundaries | `56c3938` |
| **Module 15** | Final Security Controls, System Diagnostics, Demo Suite & Master Docs | `Current` |

---

## 4. Technology Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn (ASGI), SQLAlchemy 2.0, Pydantic v2, Scikit-learn, NumPy.
- **Database**: Persistent SQLite (`backend/data/cybershield.db`).
- **Frontend**: React 18, TypeScript, Vite, Lucide React, Custom Glassmorphic CSS Design System (`index.css`).
- **Documentation**: OpenAPI 3.1 (Swagger UI), ReDoc, Markdown Architecture Guides.

---

## 5. Quickstart & Installation Instructions

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher & npm

### A. Backend Execution
```powershell
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Launch FastAPI backend server
python -m uvicorn main:app --reload --port 8000
```
- API Root: `http://127.0.0.1:8000`
- Interactive Swagger API Documentation: `http://127.0.0.1:8000/api/v1/docs`

### B. Frontend Execution
```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start Vite development server
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 6. Running Verification Tests

### Backend Unit & Integration Tests
```powershell
cd backend
python -m unittest discover tests
python test_health.py
```
*Expected: 24 unit tests passed, all 16 integration assertions verified (0 failures).*

### Frontend Production Build
```powershell
cd frontend
npm run build
```
*Expected: 0 TypeScript errors, 0 build warnings.*

---

## 7. Interactive Academic Demo Scenarios

Navigate to **Academic Demo Suite** in the navigation menu to trigger 9 pre-calibrated academic security evaluations:
1. **Safe Everyday Message** (`sms_scam_detection_ai` ➔ `ALLOW`)
2. **Lottery / Cash Reward Scam** (`sms_scam_detection_ai` ➔ `QUARANTINE`)
3. **Banking Phishing Email** (`email_phishing_classifier` ➔ `BLOCK`)
4. **IP Host Phishing URL** (`url_threat_evaluator` ➔ `QUARANTINE`)
5. **Disinformation / Fake News** (`fake_news_detector` ➔ `REVIEW`)
6. **Synthetic Bot Profile** (`fake_profile_analyzer` ➔ `REVIEW`)
7. **Manipulated GAN Image** (`image_manipulation_detector` ➔ `REVIEW`)
8. **Deepfake Video Face Swap** (`deepfake_video_pipeline` ➔ `BLOCK`)
9. **Macro-Embedded Document** (`file_security_checker` ➔ `QUARANTINE`)

---

## 8. Academic Security Disclaimer & Ethical Boundaries

> **IMPORTANT ACADEMIC DISCLAIMER**:  
> CyberShield AI is a controlled academic cybersecurity prototype designed for research and educational threat modeling.  
> - All communication occurs strictly within the sandboxed CyberShield AI simulation environment.  
> - The application **does not** claim, attempt, or implement unauthorized interception or control of real third-party applications (e.g., WhatsApp, Instagram, Facebook, Gmail, or Google Play Store).  
> - Third-party integration targets require authentic provider OAuth2 credentials, developer agreements, and explicit user consent.  
> - CyberShield AI does not harvest, store, or simulate private credentials, session tokens, or passwords.

---

## 9. License & Attribution
Developed for Advanced Academic Cybersecurity Research & Threat Defense. Built with pride using the CyberShield AI Green + Blue + White Design System.
