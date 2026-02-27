"""Google Drive management API endpoints"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
from app.services.google_drive import GoogleDriveService
from app.services.file_sorter import FileSorter
from app.utils.auth import GoogleAuthHandler
from app.config import settings
from typing import Optional, Dict
from datetime import datetime
import json
import os

router = APIRouter()

# Store credential/state files alongside this module so the paths are stable
# regardless of the server's current working directory.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_FILE = os.path.join(BASE_DIR, "drive_credentials.json")
STATE_FILE = os.path.join(BASE_DIR, "drive_auth_state.json")


def get_oauth_credentials():
    """Load OAuth token from file; return Credentials or None."""
    if not os.path.exists(CREDENTIALS_FILE):
        return None
    try:
        with open(CREDENTIALS_FILE, "r") as f:
            data = json.load(f)
        token = data.get("token_data")
        if not token:
            return None
        creds = GoogleAuthHandler.create_credentials_from_token(token)
        creds = GoogleAuthHandler.refresh_token_if_needed(creds)
        return creds
    except Exception:
        return None


def get_drive_credentials():
    """Return OAuth credentials for Drive; raise 401 if not connected."""
    creds = get_oauth_credentials()
    if creds is None:
        raise HTTPException(status_code=401, detail="Connect Google Drive first (OAuth)")
    return creds


@router.get("/auth/url")
async def get_auth_url():
    """Return OAuth URL for user to connect their Google Drive."""
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=503, detail="OAuth not configured (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)")
    url, state, code_verifier = GoogleAuthHandler.get_authorization_url()
    with open(STATE_FILE, "w") as f:
        # Persist both state and PKCE code_verifier so the callback can
        # successfully exchange the authorization code for tokens.
        json.dump({"state": state, "code_verifier": code_verifier}, f)
    return {"url": url, "state": state}


@router.get("/auth/callback")
async def auth_callback(code: Optional[str] = None, state: Optional[str] = None):
    """Exchange code for token and store; redirect to frontend."""
    if not code or not state:
        return RedirectResponse(url=f"{settings.frontend_url}?drive_error=missing_params")
    try:
        with open(STATE_FILE, "r") as f:
            stored = json.load(f)
        stored_state = stored.get("state")
        code_verifier = stored.get("code_verifier")
        if stored_state != state:
            return RedirectResponse(url=f"{settings.frontend_url}?drive_error=invalid_state")
        # Pass the original PKCE code_verifier so Google can validate the
        # authorization code and avoid the "invalid_grant: Missing code verifier"
        # error on the token endpoint.
        token_data = GoogleAuthHandler.exchange_code_for_token(code, code_verifier=code_verifier)
        with open(CREDENTIALS_FILE, "w") as f:
            json.dump({"token_data": token_data}, f)
        if os.path.exists(STATE_FILE):
            os.remove(STATE_FILE)
    except Exception as e:
        return RedirectResponse(url=f"{settings.frontend_url}?drive_error={str(e)[:50]}")
    return RedirectResponse(url=f"{settings.frontend_url}?drive_connected=1")


@router.get("/auth/status")
async def auth_status():
    """Return whether user has connected Google Drive (OAuth)."""
    creds = get_oauth_credentials()
    return {"connected": creds is not None}


@router.post("/auth/disconnect")
async def auth_disconnect():
    """Clear stored OAuth token."""
    if os.path.exists(CREDENTIALS_FILE):
        os.remove(CREDENTIALS_FILE)
    return {"message": "Disconnected"}


@router.post("/sync")
async def sync_drive():
    """Trigger file sync from Google Drive (OAuth)."""
    try:
        credentials = get_drive_credentials()
        drive_service = GoogleDriveService(credentials)
        files = drive_service.list_files()
        return {"message": "Sync completed", "files_found": len(files), "timestamp": datetime.utcnow().isoformat()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@router.post("/sort")
async def sort_files():
    """Run file sorting algorithm - uses OAuth Drive."""
    try:
        credentials = get_drive_credentials()
        drive_service = GoogleDriveService(credentials)
        file_sorter = FileSorter(drive_service)
        
        result = file_sorter.sort_all_files()
        return {
            "message": "Sorting completed",
            "stats": {k: result[k] for k in ("total", "sorted", "skipped", "failed")},
            "files_found": result["files_found"],
            "folders_created": result["folders_created"],
            "sorted": result["sorted"],
            "skipped": result["skipped"],
            "failed": result["failed"],
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Sorting error: {error_details}")
        raise HTTPException(status_code=500, detail=f"Sorting failed: {str(e)}")


@router.get("/status")
async def get_drive_status():
    """Get Google Drive integration status (OAuth connected or not)."""
    creds = get_oauth_credentials()
    return {"authenticated": creds is not None}


@router.get("/summaries")
async def list_summaries():
    """List event summary files (from Summaries folder or name contains 'summary') for suggestions."""
    try:
        credentials = get_drive_credentials()
        drive_service = GoogleDriveService(credentials)
        folder_id = drive_service.find_folder_by_name("Summaries")
        if folder_id:
            files = drive_service.list_files(folder_id=folder_id, page_size=50)
        else:
            files = drive_service.list_files_by_name("summary", page_size=50)
        out = [
            {"id": f.id, "name": f.name, "modified_time": f.modified_time.isoformat() if f.modified_time else None}
            for f in files
            if f.mime_type != "application/vnd.google-apps.folder"
        ]
        return {"summaries": out}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list summaries: {str(e)}")


@router.get("/files")
async def list_drive_files(
    folder_id: Optional[str] = None,
    limit: int = 100,
    read_sample: Optional[str] = None
):
    """List files from Google Drive (OAuth); optional read_sample=filename returns content preview."""
    try:
        credentials = get_drive_credentials()
        drive_service = GoogleDriveService(credentials)
        files = drive_service.list_files(folder_id=folder_id, page_size=limit)

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

        out = {"files": file_list, "count": len(file_list), "file_names": [f["name"] for f in file_list]}

        if read_sample:
            match = next((f for f in files if read_sample.lower() in f.name.lower()), None)
            if match:
                content = drive_service.get_file_content(match.id)
                out["read_sample"] = {"file_name": match.name, "content_preview": (content or "")[:500]}
            else:
                out["read_sample"] = {"file_name": read_sample, "found": False}

        return out
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
