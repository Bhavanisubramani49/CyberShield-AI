# CyberShield AI — Cross-Platform Cybersecurity Ecosystem

CyberShield AI is a comprehensive, cross-platform cybersecurity protection ecosystem designed for **Android and Windows**. It monitors authorized digital events in real-time, routes incoming content to specialized AI detection models, computes Explainable AI risk assessments, issues immediate user alerts, and empowers instant user decisions (**BLOCK / REVIEW / ALLOW / UNBLOCK**).

---

## 🏗️ 3-Platform Architecture
1. **Platform 1 — Sender Platform**: Controlled simulation hub for testing safe & malicious payloads across 8 content modalities (SMS, Email, URL, News, Images, Video, Profiles, Files).
2. **Platform 2 — Receiver Platform**: Simulated multi-app communication environment (Messages, Email, Social, Media, News, URLs, Files, Alerts).
3. **Platform 3 — CyberShield AI Security Platform**: Central intelligence layer containing Event Manager, AI Model Router, Risk Engine, Explainable AI, and Unified Dashboard.

---

## 🚀 Running the Project

### 1. Start the Backend (FastAPI)
```powershell
cd backend
python -m pip install -r requirements.txt
python main.py
# Server runs on: http://127.0.0.1:8000
# API Docs: http://127.0.0.1:8000/api/v1/docs
```

### 2. Start the Frontend (Vite + React + TypeScript)
```powershell
cd frontend
npm install
npm run dev
# App runs on: http://localhost:5173
```

### 3. Run Backend Verification Tests
```powershell
cd backend
python test_health.py
```

---

## 📋 Module Roadmap Status
- [x] **Module 1**: Project Foundation and Architecture (Completed & Verified)
- [ ] **Module 2**: Professional UI/UX and Navigation
- [ ] **Modules 3–33**: Following strict roadmap upon confirmation.
