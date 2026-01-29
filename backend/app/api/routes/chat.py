"""Chat API endpoints"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from app.models.chat import ChatSession, CreateChatRequest, SendMessageRequest, ChatMessage
from app.models.content import GeneratedContent
from app.database.mongodb import get_database
from app.services.gemini_client import GeminiClient
from app.services.prompt_builder import PromptBuilder
from app.services.context_retriever import ContextRetriever
from app.services.google_drive import GoogleDriveService
from app.utils.auth import GoogleAuthHandler
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from typing import Optional
import json
import traceback

router = APIRouter()


async def get_drive_service() -> Optional[GoogleDriveService]:
    """Get Google Drive service if credentials available"""
    # In production, retrieve credentials from database per user
    # For now, return None and handle gracefully
    return None


async def get_gemini_client() -> GeminiClient:
    """Get Gemini client"""
    return GeminiClient()


@router.post("/create", response_model=dict)
async def create_chat(
    request: CreateChatRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new chat session"""
    try:
        chat_session = ChatSession(
            content_type=request.content_type,
            created_at=datetime.utcnow(),
            messages=[]
        )
        
        # Insert into database
        result = await db.chats.insert_one(chat_session.model_dump(by_alias=True, exclude={'id'}))
        
        return {
            "chat_id": str(result.inserted_id),
            "content_type": chat_session.content_type,
            "created_at": chat_session.created_at.isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create chat: {str(e)}")


@router.get("/{chat_id}", response_model=dict)
async def get_chat(
    chat_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get chat session by ID"""
    try:
        if not ObjectId.is_valid(chat_id):
            raise HTTPException(status_code=400, detail="Invalid chat ID")
        
        chat = await db.chats.find_one({"_id": ObjectId(chat_id)})
        
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Convert ObjectId to string
        chat['_id'] = str(chat['_id'])
        
        return chat
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chat: {str(e)}")


@router.post("/{chat_id}/message", response_model=dict)
async def send_message(
    chat_id: str,
    request: SendMessageRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    gemini_client: GeminiClient = Depends(get_gemini_client)
):
    """Send a message in a chat and get AI response"""
    try:
        if not ObjectId.is_valid(chat_id):
            raise HTTPException(status_code=400, detail="Invalid chat ID")
        
        # Get chat session
        chat = await db.chats.find_one({"_id": ObjectId(chat_id)})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Add user message
        user_message = ChatMessage(
            role="user",
            content=request.message,
            timestamp=datetime.utcnow()
        )
        
        await db.chats.update_one(
            {"_id": ObjectId(chat_id)},
            {"$push": {"messages": user_message.model_dump()}}
        )
        
        # Get context files from Google Drive
        context_files = []
        try:
            # Get Drive credentials from database (if user has authenticated)
            creds_doc = await db.credentials.find_one({"type": "google_drive"})
            
            if creds_doc and creds_doc.get('token_data'):
                # User has authenticated with Google Drive - retrieve context
                # Create credentials and Drive service
                token_data = creds_doc.get('token_data')
                credentials = GoogleAuthHandler.create_credentials_from_token(token_data)
                drive_service = GoogleDriveService(credentials)
                
                # Initialize context retriever
                context_retriever = ContextRetriever(drive_service)
                
                # Get content type for targeted retrieval
                content_type = chat.get('content_type', 'general')
                
                # Retrieve relevant files based on user query and content type
                context_files = context_retriever.get_relevant_files(
                    content_type=content_type,
                    user_query=request.message,
                    max_files=10  # Limit to top 10 most relevant files
                )
                
                print(f"Retrieved {len(context_files)} context files from Google Drive")
            else:
                print("No Google Drive credentials found - generating without context")
        except Exception as e:
            print(f"Could not retrieve context files: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            # Continue without context - better to generate something than fail
        
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
        
        await db.chats.update_one(
            {"_id": ObjectId(chat_id)},
            {"$push": {"messages": assistant_message.model_dump()}}
        )
        
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
async def list_chats(
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """List recent chat sessions"""
    try:
        cursor = db.chats.find().sort("created_at", -1).limit(limit)
        chats = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for chat in chats:
            chat['_id'] = str(chat['_id'])
        
        return chats
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list chats: {str(e)}")


@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a chat session"""
    try:
        if not ObjectId.is_valid(chat_id):
            raise HTTPException(status_code=400, detail="Invalid chat ID")
        
        result = await db.chats.delete_one({"_id": ObjectId(chat_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        return {"message": "Chat deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete chat: {str(e)}")
