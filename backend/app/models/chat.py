"""Chat models"""
from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime


class InlineImagePart(BaseModel):
    """Base64-encoded image for inline send (e.g. from local upload)."""
    mime_type: str = Field(..., description="e.g. image/jpeg, image/png")
    data: str = Field(..., description="Base64-encoded image bytes")


class ChatMessage(BaseModel):
    """Individual chat message"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "role": "user",
                "content": "Create a newsletter about our recent youth program",
                "timestamp": "2026-01-27T10:30:00"
            }
        }


class ChatSession(BaseModel):
    """Chat session with multiple messages"""
    id: Optional[str] = Field(None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    content_type: str = Field(..., description="Content type: newsletter, blog_post, donor_email, social_media, general")
    messages: List[ChatMessage] = Field(default_factory=list)
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "content_type": "newsletter",
                "messages": [
                    {
                        "role": "user",
                        "content": "Create a newsletter",
                        "timestamp": "2026-01-27T10:30:00"
                    }
                ]
            }
        }


class CreateChatRequest(BaseModel):
    """Request to create new chat session"""
    content_type: str = Field(..., description="Type of content to generate")
    
    class Config:
        json_schema_extra = {
            "example": {
                "content_type": "newsletter"
            }
        }


class SendMessageRequest(BaseModel):
    """Request to send a message in a chat"""
    message: str = Field(..., description="User message")
    context_file_id: Optional[str] = Field(None, description="Optional Drive file ID to include as priority context (e.g. selected event summary)")
    image_drive_ids: Optional[List[str]] = Field(None, description="Google Drive file IDs of images to attach (max 2)")
    image_inline: Optional[List[InlineImagePart]] = Field(None, description="Inline base64 images from local upload (max 2)")
    include_drive_context: Optional[bool] = Field(True, description="If False, skip searching Drive for context files (faster when only using attachments)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Create a newsletter about our recent basketball tournament",
                "context_file_id": "1abc123"
            }
        }
