"""Chat models"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


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
    id: Optional[str] = Field(None, alias="_id")
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
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Create a newsletter about our recent basketball tournament"
            }
        }
