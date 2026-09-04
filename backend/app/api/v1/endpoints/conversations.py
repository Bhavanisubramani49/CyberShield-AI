import json
import asyncio
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from typing import List, Optional
from app.schemas.conversations import (
    DemoUserSchema,
    ConversationSummarySchema,
    MessageItemSchema,
    SendConversationMessageRequest,
    UserContactSchema,
    MessageActionRequest
)
from app.db.conversation_repository import conversation_repository
from app.datasets.whatsapp_security_dataset import get_dataset_metadata

router = APIRouter(prefix="/conversations", tags=["Multi-User Protected Conversations"])

@router.get("/users", response_model=List[DemoUserSchema], summary="Get List of All Synthetic Demo Users")
def get_demo_users(exclude_user_id: Optional[str] = Query(None, description="Optional user_id to exclude from demo list")):
    """Returns list of synthetic demo users, optionally excluding specific user (e.g. Kavin)."""
    return conversation_repository.get_all_demo_users(exclude_user_id=exclude_user_id)

@router.get("/contacts", response_model=List[UserContactSchema], summary="Get User-Specific WhatsApp Contacts")
def get_user_contacts(user_id: str = Query("user-kavin", description="User ID to fetch contacts for")):
    """Returns contacts specific to the requested user account."""
    return conversation_repository.get_user_contacts(user_id=user_id)

@router.get("/dataset/info", summary="Get Synthetic WhatsApp Security Dataset Info")
def get_whatsapp_dataset_info():
    """Returns metadata and benchmark samples for WhatsApp security dataset."""
    return get_dataset_metadata()

@router.get("/stream", summary="Real-Time Server-Sent Events Stream")
async def stream_conversation_events(conversation_id: Optional[str] = Query(None)):
    """
    Real-time Server-Sent Events (SSE) stream yielding new conversation messages instantly.
    """
    async def event_generator():
        queue = asyncio.Queue()

        def listener(msg_data):
            if not conversation_id or msg_data.get("conversation_id") == conversation_id:
                queue.put_nowait(msg_data)

        conversation_repository.subscribers.append(listener)
        try:
            yield "data: {\"type\": \"connected\"}\n\n"
            while True:
                msg_data = await queue.get()
                yield f"data: {json.dumps(msg_data)}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            if listener in conversation_repository.subscribers:
                conversation_repository.subscribers.remove(listener)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("", response_model=List[ConversationSummarySchema], summary="Get User Conversations")
def get_user_conversations(
    user_id: str = Query("user-kavin", description="User ID to fetch conversations for")
):
    """
    Returns list of direct and group conversations for the specified user,
    including member lists, latest messages, and threat badge counters.
    """
    return conversation_repository.get_user_conversations(user_id=user_id)

@router.get("/{conversation_id}", response_model=ConversationSummarySchema, summary="Get Conversation Details")
def get_conversation_details(conversation_id: str, user_id: str = Query("user-kavin")):
    """Returns metadata and member details for a specific conversation."""
    conversations = conversation_repository.get_user_conversations(user_id=user_id)
    found = next((c for c in conversations if c["conversation_id"] == conversation_id), None)
    if not found:
        raise HTTPException(status_code=404, detail=f"Conversation '{conversation_id}' not found.")
    return found

@router.get("/{conversation_id}/messages", response_model=List[MessageItemSchema], summary="Get Conversation Thread Messages")
def get_conversation_messages(conversation_id: str):
    """
    Returns the ordered, persistent thread of messages belonging to a conversation,
    enriched with CyberShield AI threat classifications and risk scores.
    """
    return conversation_repository.get_conversation_messages(conversation_id=conversation_id)

@router.post("/{conversation_id}/messages", response_model=MessageItemSchema, summary="Send Message to Conversation")
def send_conversation_message(
    conversation_id: str,
    req: SendConversationMessageRequest
):
    """
    Dispatches a message into a conversation:
    - Runs CyberShield Multimodal AI Threat Engine
    - Determines classification, risk score, and delivery decision
    - Persists message and recipient delivery states in SQLite
    - Generates security notifications if dangerous content detected
    """
    if not req.content or not req.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")

    try:
        return conversation_repository.send_message(
            conversation_id=conversation_id,
            sender_id=req.sender_id,
            content=req.content,
            content_type=req.content_type
        )
    except PermissionError as perm_err:
        raise HTTPException(status_code=403, detail=str(perm_err))
    except ValueError as val_err:
        raise HTTPException(status_code=404, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to dispatch conversation message: {str(e)}")

@router.post("/messages/{message_id}/action", response_model=MessageItemSchema, summary="Process Block or Allow Action on Message")
def update_message_action(
    message_id: str,
    req: MessageActionRequest
):
    """
    Processes human-in-the-loop security decision (BLOCK or ALLOW) on a flagged message:
    - Updates SQLite message security status and content
    - Updates recipient delivery and security action states
    - Updates associated SecurityEvent and Notification history
    """
    try:
        return conversation_repository.update_message_security_action(
            message_id=message_id,
            action=req.action
        )
    except ValueError as val_err:
        raise HTTPException(status_code=404, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update message security action: {str(e)}")
