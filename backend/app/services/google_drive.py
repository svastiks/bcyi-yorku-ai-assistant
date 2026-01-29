"""Google Drive API integration service"""
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.oauth2.credentials import Credentials
from app.utils.auth import GoogleAuthHandler
from app.models.file_metadata import DriveFile
from typing import List, Optional, Dict
from datetime import datetime
import io


class GoogleDriveService:
    """Service for interacting with Google Drive API"""
    
    def __init__(self, credentials: Credentials):
        """Initialize with Google credentials"""
        self.credentials = GoogleAuthHandler.refresh_token_if_needed(credentials)
        self.service = build('drive', 'v3', credentials=self.credentials)
    
    def list_files(
        self, 
        folder_id: Optional[str] = None,
        query: Optional[str] = None,
        page_size: int = 100
    ) -> List[DriveFile]:
        """
        List files from Google Drive
        
        Args:
            folder_id: Optional folder ID to list files from
            query: Optional query string for filtering
            page_size: Number of files to retrieve per page
            
        Returns:
            List of DriveFile objects
        """
        try:
            # Build query
            query_parts = []
            if folder_id:
                query_parts.append(f"'{folder_id}' in parents")
            if query:
                query_parts.append(query)
            
            query_string = " and ".join(query_parts) if query_parts else None
            
            # List files
            results = self.service.files().list(
                q=query_string,
                pageSize=page_size,
                fields="nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, size, parents)"
            ).execute()
            
            items = results.get('files', [])
            
            # Convert to DriveFile objects
            drive_files = []
            for item in items:
                drive_file = DriveFile(
                    id=item['id'],
                    name=item['name'],
                    mime_type=item['mimeType'],
                    created_time=datetime.fromisoformat(item['createdTime'].replace('Z', '+00:00')) if 'createdTime' in item else None,
                    modified_time=datetime.fromisoformat(item['modifiedTime'].replace('Z', '+00:00')) if 'modifiedTime' in item else None,
                    size=int(item['size']) if 'size' in item else None
                )
                drive_files.append(drive_file)
            
            return drive_files
        
        except Exception as e:
            print(f"Error listing files: {str(e)}")
            return []
    
    def get_file_content(self, file_id: str) -> Optional[str]:
        """
        Get text content of a file
        
        Args:
            file_id: Google Drive file ID
            
        Returns:
            File content as string, or None if error
        """
        try:
            # Get file metadata first
            file_metadata = self.service.files().get(fileId=file_id, fields='mimeType').execute()
            mime_type = file_metadata.get('mimeType')
            
            # Export Google Docs as plain text
            if mime_type == 'application/vnd.google-apps.document':
                request = self.service.files().export_media(
                    fileId=file_id,
                    mimeType='text/plain'
                )
            elif mime_type == 'application/vnd.google-apps.spreadsheet':
                request = self.service.files().export_media(
                    fileId=file_id,
                    mimeType='text/csv'
                )
            else:
                # Download regular files
                request = self.service.files().get_media(fileId=file_id)
            
            file_buffer = io.BytesIO()
            downloader = MediaIoBaseDownload(file_buffer, request)
            
            done = False
            while not done:
                status, done = downloader.next_chunk()
            
            # Return content as string
            content = file_buffer.getvalue().decode('utf-8', errors='ignore')
            return content
        
        except Exception as e:
            print(f"Error getting file content for {file_id}: {str(e)}")
            return None
    
    def create_folder(self, name: str, parent_id: Optional[str] = None) -> Optional[str]:
        """
        Create a folder in Google Drive
        
        Args:
            name: Folder name
            parent_id: Optional parent folder ID
            
        Returns:
            Created folder ID, or None if error
        """
        try:
            file_metadata = {
                'name': name,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            
            if parent_id:
                file_metadata['parents'] = [parent_id]
            
            folder = self.service.files().create(
                body=file_metadata,
                fields='id'
            ).execute()
            
            return folder.get('id')
        
        except Exception as e:
            print(f"Error creating folder {name}: {str(e)}")
            return None
    
    def move_file(self, file_id: str, dest_folder_id: str) -> bool:
        """
        Move a file to a different folder
        
        Args:
            file_id: File ID to move
            dest_folder_id: Destination folder ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Retrieve current parents
            file = self.service.files().get(
                fileId=file_id,
                fields='parents'
            ).execute()
            
            previous_parents = ",".join(file.get('parents', []))
            
            # Move file
            self.service.files().update(
                fileId=file_id,
                addParents=dest_folder_id,
                removeParents=previous_parents,
                fields='id, parents'
            ).execute()
            
            return True
        
        except Exception as e:
            print(f"Error moving file {file_id}: {str(e)}")
            return False
    
    def find_folder_by_name(self, name: str, parent_id: Optional[str] = None) -> Optional[str]:
        """
        Find a folder by name
        
        Args:
            name: Folder name to search for
            parent_id: Optional parent folder ID
            
        Returns:
            Folder ID if found, None otherwise
        """
        try:
            query = f"name='{name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
            if parent_id:
                query += f" and '{parent_id}' in parents"
            
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name)'
            ).execute()
            
            items = results.get('files', [])
            if items:
                return items[0]['id']
            return None
        
        except Exception as e:
            print(f"Error finding folder {name}: {str(e)}")
            return None
    
    def get_or_create_folder(self, name: str, parent_id: Optional[str] = None) -> Optional[str]:
        """
        Get folder ID if exists, create if not
        
        Args:
            name: Folder name
            parent_id: Optional parent folder ID
            
        Returns:
            Folder ID
        """
        folder_id = self.find_folder_by_name(name, parent_id)
        if folder_id:
            return folder_id
        return self.create_folder(name, parent_id)
