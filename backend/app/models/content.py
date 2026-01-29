"""Content generation models"""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ContentType(str, Enum):
    """Available content types"""
    NEWSLETTER = "newsletter"
    BLOG_POST = "blog_post"
    DONOR_EMAIL = "donor_email"
    SOCIAL_MEDIA = "social_media"
    GENERAL = "general"


class GeneratedContent(BaseModel):
    """Generated content response"""
    content: str = Field(..., description="Generated content")
    content_type: str = Field(..., description="Type of content generated")
    context_files_used: Optional[int] = Field(None, description="Number of context files used")
    
    class Config:
        json_schema_extra = {
            "example": {
                "content": "# January Newsletter\n\nDear Community Members...",
                "content_type": "newsletter",
                "context_files_used": 5
            }
        }
