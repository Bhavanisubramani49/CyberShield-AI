# CyberShield AI — Dataset Connectors & Synthetic Test Fixtures

This directory defines the multimodal dataset schema and connector architecture for CyberShield AI threat detectors.

## Dataset Structure

- `messages/`: Synthetic SMS and instant messaging corpora containing lottery scam, OTP lure, and legitimate conversation samples.
- `emails/`: Synthetic email header and phishing body samples with credential verification test cases.
- `urls/`: Lexical threat intelligence samples (homograph attacks, direct IP hosts, suspicious TLDs).
- `fake_news/`: Sensationalist linguistic distortion and fact-check verification test corpora.
- `images/`: Local test image metadata fixtures for EXIF integrity and copy-move pixel anomaly benchmarking.
- `videos/`: Deepfake simulation metadata fixtures and frame consistency benchmark samples.
- `profiles/`: Synthetic social bot account metrics, follower/following ratios, and bio patterns.
- `files/`: Safe test file signatures, macro-enabled spreadsheets (.xlsm), and double extension test fixtures.

## Privacy & Security Rule
All test fixtures are synthetic, academic demonstration payloads. No real credentials, private keys, or malicious executables are stored.
