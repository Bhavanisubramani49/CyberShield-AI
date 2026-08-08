# CyberShield AI — System Architecture & Foundation Document

## 1. Executive Summary
**CyberShield AI** is an AI-powered, cross-platform cybersecurity protection ecosystem designed for **Android and Windows**. It monitors authorized digital communication events in real-time, routes content across 8 specialized AI detection models, computes Explainable AI risk assessments, issues immediate user notifications, and provides user-driven control (**BLOCK / REVIEW / ALLOW / UNBLOCK**).

---

## 2. Three-Platform Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 PLATFORM 1: SENDER PLATFORM                 │
│  • Simulated Senders: Normal User, Unknown, Fake, Attacker  │
│  • Content Modalities: SMS, Email, URL, News, Img, Vid, File│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼ [Secure Communication Event]
┌─────────────────────────────────────────────────────────────┐
│                PLATFORM 2: RECEIVER PLATFORM                │
│  • Multi-App Simulated Surface: Messages, Email, Social,    │
│    News Feed, Media/Images, Video Streams, Files, Alerts    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼ [Event Interception]
┌─────────────────────────────────────────────────────────────┐
│            PLATFORM 3: CYBERSHIELD AI SECURITY ENGINE       │
│  • Event Manager & Content Type Identifier                  │
│  • AI Model Router (8 Specialized AI Models)                │
│  • Risk Engine (CRITICAL, HIGH, MEDIUM, LOW)                │
│  • Explainable AI (Human-Readable Reasons & Recommendations)│
│  • Immediate Alert Dispatcher                               │
│  • User Decision: [ BLOCK ] | [ REVIEW ] | [ ALLOW ]        │
│  • Quarantine & History Manager                             │
│  • Unified Cross-Platform Security Dashboard                │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Backend
- **Language**: Python 3.13
- **Framework**: FastAPI (Asynchronous REST API)
- **Validation**: Pydantic v2 & Pydantic-Settings
- **Server**: Uvicorn ASGI
- **Testing**: Async HTTPX Test Client

### Frontend (Android + Windows Cross-Platform)
- **Core**: React 18 + TypeScript + Vite
- **Styling**: Custom CyberShield Glassmorphic Design System (`index.css`)
- **Icons**: Lucide React
- **Viewport Engine**: Responsive Adaptive Layout (Full Windows Desktop command view + Android Mobile viewport simulator)

---

## 4. 8 Specialized AI Detection Models Matrix
1. **SMS Scam Detection**: Detects prize scams, urgent OTP demands, and financial traps.
2. **Email Phishing Model**: Detects deceptive sender spoofing and credential harvesting.
3. **URL Threat Detection**: Detects homograph phishing, malicious IP hosts, and anomalous domains.
4. **Fake News Classifier**: Detects sensationalist linguistic distortion and synthetic disinformation.
5. **Image Manipulation Model**: Detects generative AI synthesis, spliced pixels, and EXIF flags.
6. **Deepfake Video Pipeline**: Extracts facial frames and evaluates temporal/GAN inconsistencies.
7. **Fake Profile Analyzer**: Detects bot swarm patterns, ratio anomalies, and synthetic metadata.
8. **File Security Pipeline**: Inspects file headers, entropy, macros, and test signatures safely.

---

## 5. Security & Privacy Philosophy
- **Zero OS Bypass**: Respects Android, Windows, and sandbox boundaries.
- **Explicit Consent**: Operates with user consent and integration adapters.
- **Explainability**: Every warning provides explicit reasons and recommendations.
- **User Agency**: The user retains full control over allow, block, and quarantine recovery.
