"""Google Drive management API endpoints"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse, Response
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from app.services.google_drive import GoogleDriveService
from app.services.file_sorter import FileSorter
from app.utils.auth import GoogleAuthHandler
from app.config import settings
from typing import Optional, Dict, Tuple
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
    except Exception:
        return None
    try:
        creds = GoogleAuthHandler.refresh_token_if_needed(creds)
    except Exception:
        return None
    try:
        if not creds.valid:
            return None
    except Exception:
        return None
    return creds


def _drive_token_probe(creds) -> Tuple[bool, bool]:
    """
    Hit Drive API once. Returns (ok, should_delete_stored_credentials).
    If Google rejects the token (401), drop the local file so the UI matches reality.
    """
    try:
        service = build("drive", "v3", credentials=creds, cache_discovery=False)
        service.files().list(pageSize=1, fields="files(id)").execute()
        return True, False
    except HttpError as e:
        code = getattr(e.resp, "status", None) if e.resp is not None else None
        try:
            code_int = int(code) if code is not None else None
        except (TypeError, ValueError):
            code_int = None
        if code_int == 401:
            return False, True
        return False, False
    except Exception:
        return False, False


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
    """Return whether Drive is usable — stored token must pass a real Drive API call."""
    creds = get_oauth_credentials()
    if creds is None:
        return {"connected": False}
    ok, purge = _drive_token_probe(creds)
    if not ok and purge:
        try:
            if os.path.exists(CREDENTIALS_FILE):
                os.remove(CREDENTIALS_FILE)
        except OSError:
            pass
        return {"connected": False}
    if not ok:
        return {"connected": False}
    return {"connected": True}


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


# Max size for images listed for attachment (5MB) - avoids huge files for AI vision
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024


@router.get("/images")
async def list_drive_images(limit: int = 200, max_size_mb: Optional[float] = None):
    """List image files from Google Drive, sorted by modified time (newest first)."""
    try:
        credentials = get_drive_credentials()
        drive_service = GoogleDriveService(credentials)
        max_bytes = int(max_size_mb * 1024 * 1024) if max_size_mb is not None else MAX_IMAGE_SIZE_BYTES
        images = drive_service.list_images(page_size=min(limit, 200), max_size_bytes=max_bytes)
        return {
            "images": [
                {
                    "id": f.id,
                    "name": f.name,
                    "mime_type": f.mime_type,
                    "created_time": f.created_time.isoformat() if f.created_time else None,
                    "modified_time": f.modified_time.isoformat() if f.modified_time else None,
                    "size": f.size,
                }
                for f in images
            ],
            "count": len(images),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list images: {str(e)}")


@router.get("/images/latest")
async def get_latest_drive_image():
    """Get the most recently modified image in Google Drive (by modifiedTime)."""
    try:
        credentials = get_drive_credentials()
        drive_service = GoogleDriveService(credentials)
        images = drive_service.list_images(page_size=1, max_size_bytes=MAX_IMAGE_SIZE_BYTES)
        if not images:
            return {"image": None, "message": "No images found in Drive"}
        img = images[0]
        return {
            "image": {
                "id": img.id,
                "name": img.name,
                "mime_type": img.mime_type,
                "modified_time": img.modified_time.isoformat() if img.modified_time else None,
                "size": img.size,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get latest image: {str(e)}")


@router.get("/images/{file_id}/preview")
async def get_drive_image_preview(file_id: str):
    """Return image bytes for preview (e.g. in Drive picker). Uses OAuth to fetch from Drive.
    Client should pass ?mtime=<modified_time> so browser cache invalidates when file changes."""
    try:
        credentials = get_drive_credentials()
        drive_service = GoogleDriveService(credentials)
        raw = drive_service.get_file_bytes(file_id)
        if not raw:
            raise HTTPException(status_code=404, detail="Image not found or not readable")
        mime = drive_service.get_file_mime_type(file_id) or "image/jpeg"
        if not mime.startswith("image/"):
            mime = "image/jpeg"
        return Response(
            content=raw,
            media_type=mime,
            headers={
                "Cache-Control": "private, max-age=86400",  # 24h; URL should include ?mtime= for invalidation
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load preview: {str(e)}")
