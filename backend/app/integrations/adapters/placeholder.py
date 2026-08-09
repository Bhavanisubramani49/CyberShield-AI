from typing import List, Dict, Any
from datetime import datetime, timezone
from app.integrations.base import BasePlatformAdapter
from app.integrations.permissions import PermissionScope, IntegrationStatus, ConnectionHealth
from app.integrations.schemas import NormalizedEventSchema

class WhatsAppAdapter(BasePlatformAdapter):
    platform_id = "whatsapp"
    name = "WhatsApp Cloud API Integration Target"
    category = "Messaging"
    is_simulation = False
    description = "Official WhatsApp Business Platform & Cloud API adapter target for end-to-end webhook threat verification."
    auth_requirement_note = "Integration requires an official Meta Graph API Developer Account, App Secret, Webhook Verification, and explicit user consent. CyberShield AI does not perform unauthorized scraping or credential collection."

    def get_required_permissions(self) -> List[str]:
        return [
            PermissionScope.READ_MESSAGES.value,
            PermissionScope.READ_URLS.value,
            PermissionScope.READ_MEDIA.value,
            PermissionScope.RECEIVE_EVENTS.value,
            PermissionScope.ANALYZE_CONTENT.value
        ]

    def get_capabilities(self) -> List[str]:
        return [
            "Official Meta Cloud Webhook",
            "Inbound Message Threat Scanning",
            "Media Attachment Inspection",
            "URL Phishing Verification"
        ]

    def get_default_status(self) -> str:
        return IntegrationStatus.NOT_CONNECTED.value

    def get_default_health(self) -> str:
        return ConnectionHealth.NOT_CONFIGURED.value

    def can_process_event(self, granted_permissions: List[str]) -> bool:
        return False  # External platform requires official OAuth configuration

    def normalize_event(self, raw_payload: Dict[str, Any], granted_permissions: List[str]) -> NormalizedEventSchema:
        raise PermissionError("Access Denied: WhatsApp adapter is not connected. Official Meta OAuth and user authorization are required.")

class InstagramAdapter(BasePlatformAdapter):
    platform_id = "instagram"
    name = "Instagram Graph API Integration Target"
    category = "Social Media"
    is_simulation = False
    description = "Direct Instagram Messaging and Post Content adapter target via Meta Graph API."
    auth_requirement_note = "Requires official Meta Instagram Graph API credentials and authenticated account linking. No private credential scraping is permitted."

    def get_required_permissions(self) -> List[str]:
        return [
            PermissionScope.READ_MESSAGES.value,
            PermissionScope.READ_MEDIA.value,
            PermissionScope.READ_PROFILES.value,
            PermissionScope.RECEIVE_EVENTS.value,
            PermissionScope.ANALYZE_CONTENT.value
        ]

    def get_capabilities(self) -> List[str]:
        return [
            "Meta Graph Webhook Ingestion",
            "Direct Message Safety Check",
            "Profile Impersonation Scanning",
            "Deepfake & Image Forensics"
        ]

    def get_default_status(self) -> str:
        return IntegrationStatus.NOT_CONNECTED.value

    def get_default_health(self) -> str:
        return ConnectionHealth.NOT_CONFIGURED.value

    def can_process_event(self, granted_permissions: List[str]) -> bool:
        return False

    def normalize_event(self, raw_payload: Dict[str, Any], granted_permissions: List[str]) -> NormalizedEventSchema:
        raise PermissionError("Access Denied: Instagram adapter is not connected. Official Meta Graph API authorization required.")

class FacebookAdapter(BasePlatformAdapter):
    platform_id = "facebook"
    name = "Facebook Pages & Feed Adapter Target"
    category = "Social Media"
    is_simulation = False
    description = "Facebook Social Feed & Messenger integration target for fake news and manipulated media scanning."
    auth_requirement_note = "Requires Meta Business Verification, Page Token, and Webhook Subscription. Direct third-party credential theft is strictly blocked."

    def get_required_permissions(self) -> List[str]:
        return [
            PermissionScope.READ_MESSAGES.value,
            PermissionScope.READ_MEDIA.value,
            PermissionScope.READ_PROFILES.value,
            PermissionScope.RECEIVE_EVENTS.value,
            PermissionScope.ANALYZE_CONTENT.value
        ]

    def get_capabilities(self) -> List[str]:
        return [
            "Feed Post Verification",
            "Fake News Cross-Checking",
            "Phishing Link Detection",
            "Deepfake Media Detection"
        ]

    def get_default_status(self) -> str:
        return IntegrationStatus.NOT_CONNECTED.value

    def get_default_health(self) -> str:
        return ConnectionHealth.NOT_CONFIGURED.value

    def can_process_event(self, granted_permissions: List[str]) -> bool:
        return False

    def normalize_event(self, raw_payload: Dict[str, Any], granted_permissions: List[str]) -> NormalizedEventSchema:
        raise PermissionError("Access Denied: Facebook adapter is not connected. Requires official Meta API authorization.")

class GmailAdapter(BasePlatformAdapter):
    platform_id = "gmail"
    name = "Google Workspace & Gmail API Target"
    category = "Email"
    is_simulation = False
    description = "Official Google Gmail REST API target with OAuth2 consent for enterprise email threat filtering."
    auth_requirement_note = "Requires Google Cloud Project OAuth2 Client ID, user consent screen approval, and secure token exchange. CyberShield AI does not store user passwords."

    def get_required_permissions(self) -> List[str]:
        return [
            PermissionScope.READ_EMAIL.value,
            PermissionScope.READ_URLS.value,
            PermissionScope.READ_FILES.value,
            PermissionScope.RECEIVE_EVENTS.value,
            PermissionScope.ANALYZE_CONTENT.value
        ]

    def get_capabilities(self) -> List[str]:
        return [
            "Google Pub/Sub Push Notifications",
            "Header & DKIM/SPF Inspection",
            "Phishing Detection AI Analysis",
            "Attachment Antivirus Heuristics"
        ]

    def get_default_status(self) -> str:
        return IntegrationStatus.NOT_CONNECTED.value

    def get_default_health(self) -> str:
        return ConnectionHealth.NOT_CONFIGURED.value

    def can_process_event(self, granted_permissions: List[str]) -> bool:
        return False

    def normalize_event(self, raw_payload: Dict[str, Any], granted_permissions: List[str]) -> NormalizedEventSchema:
        raise PermissionError("Access Denied: Gmail adapter is not connected. Official Google OAuth2 consent is required.")

class GenericEmailAdapter(BasePlatformAdapter):
    platform_id = "generic_email"
    name = "Enterprise IMAP / SMTP Security Gateway"
    category = "Email"
    is_simulation = False
    description = "Standard RFC-compliant IMAP/TLS email gateway target for corporate email filtering."
    auth_requirement_note = "Requires secure TLS configuration and explicit mail gateway routing rules."

    def get_required_permissions(self) -> List[str]:
        return [
            PermissionScope.READ_EMAIL.value,
            PermissionScope.READ_URLS.value,
            PermissionScope.READ_FILES.value,
            PermissionScope.RECEIVE_EVENTS.value,
            PermissionScope.ANALYZE_CONTENT.value
        ]

    def get_capabilities(self) -> List[str]:
        return [
            "TLS Mail Gateway Inspection",
            "RFC Header Parsing",
            "Phishing Heuristic Engine",
            "Payload Quarantining"
        ]

    def get_default_status(self) -> str:
        return IntegrationStatus.NOT_CONNECTED.value

    def get_default_health(self) -> str:
        return ConnectionHealth.NOT_CONFIGURED.value

    def can_process_event(self, granted_permissions: List[str]) -> bool:
        return False

    def normalize_event(self, raw_payload: Dict[str, Any], granted_permissions: List[str]) -> NormalizedEventSchema:
        raise PermissionError("Access Denied: Generic Email gateway is not configured.")

class GenericSocialAdapter(BasePlatformAdapter):
    platform_id = "generic_social"
    name = "Generic Webhook & Social Feed Target"
    category = "Social Media"
    is_simulation = False
    description = "Standard HMAC-SHA256 authenticated webhook target for custom enterprise social media streams."
    auth_requirement_note = "Requires verified webhook signing secrets and registered enterprise endpoints."

    def get_required_permissions(self) -> List[str]:
        return [
            PermissionScope.READ_MESSAGES.value,
            PermissionScope.READ_URLS.value,
            PermissionScope.READ_MEDIA.value,
            PermissionScope.RECEIVE_EVENTS.value,
            PermissionScope.ANALYZE_CONTENT.value
        ]

    def get_capabilities(self) -> List[str]:
        return [
            "HMAC Webhook Ingestion",
            "Real-Time Misinformation Scoring",
            "Deepfake Verification",
            "User Impersonation Checks"
        ]

    def get_default_status(self) -> str:
        return IntegrationStatus.NOT_CONNECTED.value

    def get_default_health(self) -> str:
        return ConnectionHealth.NOT_CONFIGURED.value

    def can_process_event(self, granted_permissions: List[str]) -> bool:
        return False

    def normalize_event(self, raw_payload: Dict[str, Any], granted_permissions: List[str]) -> NormalizedEventSchema:
        raise PermissionError("Access Denied: Generic Social webhook endpoint is not connected.")
