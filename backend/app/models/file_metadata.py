"""Google Drive file metadata models"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DriveFile(BaseModel):
    """Google Drive file information"""
    id: str = Field(..., description="Google Drive file ID")
    name: str = Field(..., description="File name")
    mime_type: str = Field(..., description="MIME type")
    created_time: Optional[datetime] = None
    modified_time: Optional[datetime] = None
    size: Optional[int] = None
    folder_path: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "1abc123",
                "name": "newsletter_january_2026.docx",
                "mime_type": "application/vnd.google-apps.document",
                "created_time": "2026-01-15T10:30:00",
                "modified_time": "2026-01-20T14:20:00",
                "folder_path": "Newsletters"
            }
        }


class FileMetadata(BaseModel):
    """Cached file metadata in MongoDB"""
    id: Optional[str] = Field(None, alias="_id")
    drive_file_id: str = Field(..., description="Google Drive file ID")
    name: str = Field(..., description="File name")
    folder: Optional[str] = Field(None, description="Organized folder name")
    mime_type: str = Field(..., description="MIME type")
    created_at: Optional[datetime] = None
    last_sorted: Optional[datetime] = None
    content_preview: Optional[str] = Field(None, description="First 500 chars of content")
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "drive_file_id": "1abc123",
                "name": "newsletter_january_2026.docx",
                "folder": "Newsletters",
                "mime_type": "application/vnd.google-apps.document",
                "content_preview": "January Newsletter: This month we..."
            }
        }
