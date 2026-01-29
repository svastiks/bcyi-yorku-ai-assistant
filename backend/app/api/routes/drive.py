"""Google Drive management API endpoints"""
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import RedirectResponse
from app.services.google_drive import GoogleDriveService
from app.services.file_sorter import FileSorter
from app.utils.auth import GoogleAuthHandler
from app.database.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, Dict
from datetime import datetime

router = APIRouter()


@router.get("/auth")
async def initiate_auth():
    """Initiate Google Drive OAuth flow"""
    try:
        authorization_url, state = GoogleAuthHandler.get_authorization_url()
        
        # In production, store state in session/database for verification
        
        return {
            "authorization_url": authorization_url,
            "state": state
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initiate auth: {str(e)}")


@router.get("/auth/callback")
async def auth_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Handle OAuth callback"""
    try:
        # Exchange code for token
        token_data = GoogleAuthHandler.exchange_code_for_token(code, state)
        
        # Store token in database
        # In production, associate with user account
        await db.credentials.update_one(
            {"type": "google_drive"},
            {
                "$set": {
                    "token_data": token_data,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return {
            "message": "Authentication successful",
            "redirect_to": "/api/drive/status"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@router.post("/sync")
async def sync_drive(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Trigger file sync from Google Drive"""
    try:
        # Get credentials
        creds_doc = await db.credentials.find_one({"type": "google_drive"})
        if not creds_doc:
            raise HTTPException(status_code=401, detail="Not authenticated with Google Drive")
        
        token_data = creds_doc.get('token_data')
        credentials = GoogleAuthHandler.create_credentials_from_token(token_data)
        
        # Create Drive service
        drive_service = GoogleDriveService(credentials)
        
        # List all files
        files = drive_service.list_files()
        
        # Store sync status
        await db.sync_status.update_one(
            {"type": "drive_sync"},
            {
                "$set": {
                    "last_sync": datetime.utcnow(),
                    "files_found": len(files),
                    "status": "completed"
                }
            },
            upsert=True
        )
        
        return {
            "message": "Sync completed",
            "files_found": len(files),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@router.post("/sort")
async def sort_files(
    source_folder_id: Optional[str] = None,
    parent_folder_id: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Run file sorting algorithm"""
    try:
        # Get credentials
        creds_doc = await db.credentials.find_one({"type": "google_drive"})
        if not creds_doc:
            raise HTTPException(status_code=401, detail="Not authenticated with Google Drive")
        
        token_data = creds_doc.get('token_data')
        credentials = GoogleAuthHandler.create_credentials_from_token(token_data)
        
        # Create services
        drive_service = GoogleDriveService(credentials)
        file_sorter = FileSorter(drive_service)
        
        # Sort files
        stats = file_sorter.sort_all_files(
            source_folder_id=source_folder_id,
            parent_for_organization=parent_folder_id
        )
        
        # Store sorting status
        await db.sync_status.update_one(
            {"type": "file_sorting"},
            {
                "$set": {
                    "last_sort": datetime.utcnow(),
                    "stats": stats,
                    "status": "completed"
                }
            },
            upsert=True
        )
        
        return {
            "message": "Sorting completed",
            "stats": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sorting failed: {str(e)}")


@router.get("/status")
async def get_drive_status(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get Google Drive integration status"""
    try:
        # Check authentication
        creds_doc = await db.credentials.find_one({"type": "google_drive"})
        authenticated = creds_doc is not None
        
        # Get sync status
        sync_doc = await db.sync_status.find_one({"type": "drive_sync"})
        last_sync = sync_doc.get('last_sync') if sync_doc else None
        
        # Get sorting status
        sort_doc = await db.sync_status.find_one({"type": "file_sorting"})
        last_sort = sort_doc.get('last_sort') if sort_doc else None
        
        return {
            "authenticated": authenticated,
            "last_sync": last_sync.isoformat() if last_sync else None,
            "last_sort": last_sort.isoformat() if last_sort else None,
            "sync_stats": sync_doc.get('stats') if sync_doc else None,
            "sort_stats": sort_doc.get('stats') if sort_doc else None
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")


@router.get("/files")
async def list_drive_files(
    folder_id: Optional[str] = None,
    limit: int = 100,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """List files from Google Drive"""
    try:
        # Get credentials
        creds_doc = await db.credentials.find_one({"type": "google_drive"})
        if not creds_doc:
            raise HTTPException(status_code=401, detail="Not authenticated with Google Drive")
        
        token_data = creds_doc.get('token_data')
        credentials = GoogleAuthHandler.create_credentials_from_token(token_data)
        
        # Create Drive service
        drive_service = GoogleDriveService(credentials)
        
        # List files
        files = drive_service.list_files(folder_id=folder_id, page_size=limit)
        
        # Convert to dict
        file_list = []
        for file in files:
            file_list.append({
                "id": file.id,
                "name": file.name,
                "mime_type": file.mime_type,
                "created_time": file.created_time.isoformat() if file.created_time else None,
                "modified_time": file.modified_time.isoformat() if file.modified_time else None,
                "size": file.size
            })
        
        return {
            "files": file_list,
            "count": len(file_list)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")


@router.get("/sorting-rules")
async def get_sorting_rules():
    """Get current file sorting rules"""
    from app.services.file_sorter import SORTING_RULES
    
    return {
        "rules": SORTING_RULES,
        "description": "Hardcoded rules for organizing files into folders"
    }
