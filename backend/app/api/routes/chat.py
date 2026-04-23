"""Chat API endpoints"""
from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import StreamingResponse
from app.models.chat import ChatSession, CreateChatRequest, SendMessageRequest, ChatMessage
from app.models.content import GeneratedContent
from app.services.gemini_client import GeminiClient
from app.services.prompt_builder import PromptBuilder
from app.services.context_retriever import ContextRetriever
from app.services.google_drive import GoogleDriveService
from app.utils.auth import GoogleAuthHandler
from app.config import settings
from app.rate_limit import limiter
from datetime import datetime
from typing import Optional, Dict, List, Tuple
import base64
import json
import os
import re
from uuid import uuid4

router = APIRouter()

# Local storage file for chat sessions
LOCAL_STORAGE_FILE = "chat_storage.json"

# Helper function to read from local storage
def read_local_storage() -> Dict:
    if not os.path.exists(LOCAL_STORAGE_FILE):
        return {"chats": {}}
    with open(LOCAL_STORAGE_FILE, "r") as file:
        return json.load(file)

# Helper function to write to local storage
def write_local_storage(data: Dict):
    with open(LOCAL_STORAGE_FILE, "w") as file:
        json.dump(data, file, indent=2, default=str)


async def get_drive_service() -> Optional[GoogleDriveService]:
    """Get Google Drive service if credentials available"""
    # In production, retrieve credentials from database per user
    # For now, return None and handle gracefully
    return None


async def get_gemini_client() -> GeminiClient:
    """Get Gemini client"""
    return GeminiClient()


# Max images per message (same as frontend limit)
MAX_IMAGES_PER_MESSAGE = 2

# Phrases that mean "use the latest image from Drive"
LATEST_IMAGE_PATTERNS = [
    r"\blatest\s+image\b",
    r"\bmost\s+recent\s+image\b",
    r"\blast\s+image\b",
    r"\btake\s+the\s+latest\s+image\b",
    r"\buse\s+the\s+latest\s+image\b",
    r"\buse\s+the\s+most\s+recent\s+image\b",
    r"\bget\s+the\s+latest\s+image\b",
    r"\bfrom\s+the\s+latest\s+image\b",
]


def _wants_latest_image(message: str) -> bool:
    """Return True if the user message asks for the latest image from Drive."""
    lower = message.lower().strip()
    return any(re.search(p, lower, re.IGNORECASE) for p in LATEST_IMAGE_PATTERNS)


def _resolve_image_parts(
    request: SendMessageRequest,
    drive_service: Optional[GoogleDriveService],
) -> List[Tuple[bytes, str]]:
    """
    Resolve all image parts for this request: inline base64 + drive ids + latest image.
    Returns list of (bytes, mime_type), max MAX_IMAGES_PER_MESSAGE.
    """
    out: List[Tuple[bytes, str]] = []
    drive_ids: List[str] = list(request.image_drive_ids or [])

    # If user asked for "latest image" and Drive is connected, prepend latest image id
    if drive_service and _wants_latest_image(request.message):
        try:
            images = drive_service.list_images(page_size=1, max_size_bytes=5 * 1024 * 1024)
            if images:
                drive_ids.insert(0, images[0].id)
        except Exception as e:
            print(f"Resolve latest image: {e}")

    # Dedupe drive ids and cap
    seen = set()
    unique_drive_ids = []
    for fid in drive_ids:
        if fid not in seen and len(unique_drive_ids) < MAX_IMAGES_PER_MESSAGE:
            seen.add(fid)
            unique_drive_ids.append(fid)

    # 1) Inline images (base64)
    for part in request.image_inline or []:
        if len(out) >= MAX_IMAGES_PER_MESSAGE:
            break
        try:
            raw = base64.b64decode(part.data)
            mime = part.mime_type or "image/jpeg"
            if mime not in ("image/jpeg", "image/png", "image/gif", "image/webp", "image/heif", "image/heic"):
                mime = "image/jpeg"
            out.append((raw, mime))
        except Exception as e:
            print(f"Skip inline image: {e}")

    # 2) Drive images (fetch bytes + mime)
    if drive_service:
        for fid in unique_drive_ids:
            if len(out) >= MAX_IMAGES_PER_MESSAGE:
                break
            try:
                raw = drive_service.get_file_bytes(fid)
                if not raw:
                    continue
                mime = drive_service.get_file_mime_type(fid) or "image/jpeg"
                if mime not in (
                    "image/jpeg", "image/png", "image/gif", "image/webp",
                    "image/heif", "image/heic", "image/bmp", "image/svg+xml",
                ):
                    mime = "image/jpeg"
                out.append((raw, mime))
            except Exception as e:
                print(f"Skip drive image {fid}: {e}")

    return out[:MAX_IMAGES_PER_MESSAGE]


@router.post("/create", response_model=dict)
@limiter.limit(settings.rate_limit_chat_create)
async def create_chat(
    request: Request, response: Response, payload: CreateChatRequest
):
    """Create a new chat session"""
    try:
        chat_id = str(uuid4())
        chat_session = ChatSession(
            content_type=payload.content_type,
            created_at=datetime.utcnow(),
            messages=[]
        )
        
        # Store in local storage
        data = read_local_storage()
        data["chats"][chat_id] = {
            "content_type": chat_session.content_type,
            "created_at": chat_session.created_at.isoformat(),
            "messages": []
        }
        write_local_storage(data)
        
        return {
            "chat_id": chat_id,
            "content_type": chat_session.content_type,
            "created_at": chat_session.created_at.isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create chat: {str(e)}")


@router.get("/{chat_id}", response_model=dict)
async def get_chat(chat_id: str):
    """Get chat session by ID"""
    try:
        data = read_local_storage()
        chat = data.get("chats", {}).get(chat_id)
        
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        return {
            "chat_id": chat_id,
            **chat
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chat: {str(e)}")


@router.post("/{chat_id}/message", response_model=dict)
@limiter.limit(settings.rate_limit_chat_message)
async def send_message(
    request: Request,
    response: Response,
    chat_id: str,
    payload: SendMessageRequest,
    gemini_client: GeminiClient = Depends(get_gemini_client),
):
    """Send a message in a chat and get AI response"""
    try:
        # Get chat session
        data = read_local_storage()
        chat = data.get("chats", {}).get(chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Add user message
        user_message = ChatMessage(
            role="user",
            content=payload.message,
            timestamp=datetime.utcnow()
        )
        
        chat["messages"].append({
            "role": user_message.role,
            "content": user_message.content,
            "timestamp": user_message.timestamp.isoformat()
        })
        
        # Drive service (for context and image resolution)
        drive_service = None
        context_files = []
        try:
            from app.api.routes.drive import get_oauth_credentials
            creds = get_oauth_credentials()
            if creds:
                try:
                    drive_service = GoogleDriveService(creds)
                except Exception as e:
                    print(f"Chat context: Drive service init failed: {e}")
            if not drive_service:
                print("Chat context: Drive not connected (no OAuth credentials)")
            else:
                include_drive_context = getattr(
                    payload, "include_drive_context", True
                )
                has_selected_file = bool(getattr(payload, "context_file_id", None))
                # Explicit summary pill: always load when user picked a file (not gated by Search Drive toggle).
                if has_selected_file:
                    try:
                        content = drive_service.get_file_content(payload.context_file_id)
                    except Exception as e:
                        print(f"Chat context: get_file_content failed: {e}")
                        content = None
                    if content:
                        if len(content) > 8000:
                            content = content[:8000] + "\n...(truncated)"
                        context_files.append({
                            "name": "Selected event summary",
                            "folder": "Drive",
                            "content": content,
                            "relevance_score": 100.0,
                            "modified_time": None,
                        })
                # Automatic Drive search (heavy): gated by client toggle and server flag.
                drive_auto_search = (
                    settings.drive_context_search_enabled
                    and include_drive_context
                    and not has_selected_file
                )
                if drive_auto_search:
                    try:
                        context_retriever = ContextRetriever(drive_service)
                        content_type = chat.get('content_type', 'general')
                        retrieved = context_retriever.get_relevant_files(
                            content_type=content_type,
                            user_query=payload.message,
                            max_files=10
                        )
                        seen_names = {c.get("name") for c in context_files}
                        for c in retrieved:
                            if c.get("name") not in seen_names:
                                context_files.append(c)
                                seen_names.add(c.get("name"))
                    except Exception as e:
                        print(f"Chat context: get_relevant_files failed: {e}")
                    if not context_files and ("use " in payload.message.lower() or "from drive" in payload.message.lower() or "print " in payload.message.lower()):
                        print(f"Chat context: no files found for query (name search + keyword over root/subfolders)")
        except Exception as e:
            print(f"Context from Drive: {e}")

        # Resolve image parts (inline + drive ids + "latest image" intent)
        image_parts = _resolve_image_parts(payload, drive_service)
        
        # Build prompt
        content_type = chat.get('content_type', 'general')
        chat_history = chat.get('messages', [])
        
        prompt = PromptBuilder.build_prompt(
            content_type=content_type,
            user_input=payload.message,
            context_files=context_files,
            chat_history=chat_history
        )
        
        # Generate response (with optional image parts for vision)
        try:
            ai_response = gemini_client.generate_with_retry(
                prompt, image_parts=image_parts if image_parts else None
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
        
        # Add assistant message
        assistant_message = ChatMessage(
            role="assistant",
            content=ai_response,
            timestamp=datetime.utcnow()
        )
        
        chat["messages"].append({
            "role": assistant_message.role,
            "content": assistant_message.content,
            "timestamp": assistant_message.timestamp.isoformat()
        })
        
        # Save updated chat
        data["chats"][chat_id] = chat
        write_local_storage(data)
        
        return {
            "message": ai_response,
            "context_files_used": len(context_files),
            "timestamp": assistant_message.timestamp.isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")
    except BaseException as e:
        print(f"Send message unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/", response_model=list)
async def list_chats(limit: int = 20):
    """List recent chat sessions"""
    try:
        data = read_local_storage()
        chats = data.get("chats", {})
        
        # Convert to list and add chat_id
        chat_list = []
        for chat_id, chat_data in chats.items():
            chat_list.append({
                "chat_id": chat_id,
                **chat_data
            })
        
        # Sort by created_at (most recent first)
        chat_list.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        # Limit results
        return chat_list[:limit]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list chats: {str(e)}")


@router.delete("/{chat_id}")
async def delete_chat(chat_id: str):
    """Delete a chat session"""
    try:
        data = read_local_storage()
        chats = data.get("chats", {})
        
        if chat_id not in chats:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        del chats[chat_id]
        data["chats"] = chats
        write_local_storage(data)
        
        return {"message": "Chat deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete chat: {str(e)}")
