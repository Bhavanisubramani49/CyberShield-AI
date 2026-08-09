from enum import Enum
from typing import List, Dict

class PermissionScope(str, Enum):
    READ_MESSAGES = "READ_MESSAGES"
    READ_EMAIL = "READ_EMAIL"
    READ_URLS = "READ_URLS"
    READ_MEDIA = "READ_MEDIA"
    READ_PROFILES = "READ_PROFILES"
    READ_FILES = "READ_FILES"
    RECEIVE_EVENTS = "RECEIVE_EVENTS"
    ANALYZE_CONTENT = "ANALYZE_CONTENT"
    SEND_SIMULATION = "SEND_SIMULATION"
    MANAGE_SECURITY_ACTIONS = "MANAGE_SECURITY_ACTIONS"

PERMISSION_METADATA: Dict[str, Dict[str, str]] = {
    PermissionScope.READ_MESSAGES.value: {
        "title": "Read Messaging Payloads",
        "description": "Allows ingesting message texts and metadata for threat scanning."
    },
    PermissionScope.READ_EMAIL.value: {
        "title": "Read Email Headers & Content",
        "description": "Allows ingesting email subject lines, senders, and body for phishing analysis."
    },
    PermissionScope.READ_URLS.value: {
        "title": "Inspect Links & Domains",
        "description": "Allows parsing hyperlinks and domain reputations."
    },
    PermissionScope.READ_MEDIA.value: {
        "title": "Inspect Images & Video Frames",
        "description": "Allows perceptual hashing, deepfake analysis, and EXIF metadata scanning."
    },
    PermissionScope.READ_PROFILES.value: {
        "title": "Analyze Profile Metadata",
        "description": "Allows scanning account age, follower ratios, and impersonation traits."
    },
    PermissionScope.READ_FILES.value: {
        "title": "Inspect Shared Files & Attachments",
        "description": "Allows static file heuristics, entropy calculation, and binary signature checking."
    },
    PermissionScope.RECEIVE_EVENTS.value: {
        "title": "Real-Time Event Stream Ingestion",
        "description": "Allows subscribing to incoming event triggers."
    },
    PermissionScope.ANALYZE_CONTENT.value: {
        "title": "AI Model Risk Assessment",
        "description": "Allows routing payload through specialized neural detectors."
    },
    PermissionScope.SEND_SIMULATION.value: {
        "title": "Controlled Simulation Dispatch",
        "description": "Allows sending simulated academic test attacks."
    },
    PermissionScope.MANAGE_SECURITY_ACTIONS.value: {
        "title": "Enforce Containment Decisions",
        "description": "Allows applying quarantine, block, or review flags."
    }
}

class IntegrationStatus(str, Enum):
    AUTHORIZED_SIMULATION = "AUTHORIZED_SIMULATION"
    NOT_CONNECTED = "NOT_CONNECTED"
    PENDING = "PENDING"
    AUTHORIZED = "AUTHORIZED"
    DENIED = "DENIED"
    REVOKED = "REVOKED"
    ERROR = "ERROR"

class ConnectionHealth(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    NOT_CONFIGURED = "NOT_CONFIGURED"
    RESTRICTED = "RESTRICTED"
