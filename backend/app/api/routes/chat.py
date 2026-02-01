"""Chat API endpoints"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from app.models.chat import ChatSession, CreateChatRequest, SendMessageRequest, ChatMessage
from app.models.content import GeneratedContent
from app.services.gemini_client import GeminiClient
from app.services.prompt_builder import PromptBuilder
from app.services.context_retriever import ContextRetriever
from app.services.google_drive import GoogleDriveService
from app.utils.auth import GoogleAuthHandler
from datetime import datetime
from typing import Optional, Dict
import json
import os
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


@router.post("/create", response_model=dict)
async def create_chat(request: CreateChatRequest):
    """Create a new chat session"""
    try:
        chat_id = str(uuid4())
        chat_session = ChatSession(
            content_type=request.content_type,
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
async def send_message(
    chat_id: str,
    request: SendMessageRequest,
    gemini_client: GeminiClient = Depends(get_gemini_client)
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
            content=request.message,
            timestamp=datetime.utcnow()
        )
        
        chat["messages"].append({
            "role": user_message.role,
            "content": user_message.content,
            "timestamp": user_message.timestamp.isoformat()
        })
        
        # Get context from Drive via OAuth (if connected)
        context_files = []
        try:
            from app.api.routes.drive import get_oauth_credentials
            creds = get_oauth_credentials()
            if creds:
                drive_service = GoogleDriveService(creds)
                context_retriever = ContextRetriever(drive_service)
                content_type = chat.get('content_type', 'general')
                context_files = context_retriever.get_relevant_files(
                    content_type=content_type,
                    user_query=request.message,
                    max_files=10
                )
        except Exception as e:
            print(f"Context from Drive: {e}")
        
        # Build prompt
        content_type = chat.get('content_type', 'general')
        chat_history = chat.get('messages', [])
        
        prompt = PromptBuilder.build_prompt(
            content_type=content_type,
            user_input=request.message,
            context_files=context_files,
            chat_history=chat_history
        )
        
        # Generate response
        try:
            ai_response = gemini_client.generate_with_retry(prompt)
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
