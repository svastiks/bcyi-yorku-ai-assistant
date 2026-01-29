"""Context retrieval service for finding relevant files from Google Drive"""
from app.services.google_drive import GoogleDriveService
from app.models.file_metadata import DriveFile
from app.database.mongodb import get_sync_database
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import re


class ContextRetriever:
    """Service for retrieving relevant context from Google Drive"""
    
    def __init__(self, drive_service: GoogleDriveService):
        """Initialize with Google Drive service"""
        self.drive_service = drive_service
        self.db = get_sync_database()
    
    def extract_keywords(self, text: str) -> List[str]:
        """
        Extract keywords from text
        
        Args:
            text: Input text
            
        Returns:
            List of keywords
        """
        # Convert to lowercase and split
        words = text.lower().split()
        
        # Remove common stop words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
            'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
            'who', 'when', 'where', 'why', 'how', 'create', 'make', 'write', 'generate'
        }
        
        keywords = [word for word in words if word not in stop_words and len(word) > 2]
        
        # Return unique keywords
        return list(set(keywords))
    
    def score_file_relevance(
        self, 
        file: DriveFile, 
        keywords: List[str],
        target_folder: Optional[str] = None
    ) -> float:
        """
        Score a file's relevance based on keywords and other factors
        
        Args:
            file: DriveFile object
            keywords: List of search keywords
            target_folder: Optional target folder name
            
        Returns:
            Relevance score (0-100)
        """
        score = 0.0
        file_name_lower = file.name.lower()
        
        # Keyword matching in filename (high weight)
        keyword_matches = sum(1 for keyword in keywords if keyword in file_name_lower)
        score += keyword_matches * 15
        
        # Folder matching (medium weight)
        if target_folder and file.folder_path:
            if target_folder.lower() in file.folder_path.lower():
                score += 20
        
        # Recency bonus (files modified in last 30 days)
        if file.modified_time:
            days_old = (datetime.now(file.modified_time.tzinfo) - file.modified_time).days
            if days_old <= 30:
                recency_score = max(0, 10 - (days_old / 3))  # Up to 10 points
                score += recency_score
        
        # File type preference (prefer text documents)
        preferred_types = [
            'application/vnd.google-apps.document',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ]
        if file.mime_type in preferred_types:
            score += 5
        
        return min(score, 100)  # Cap at 100
    
    def search_files_by_keywords(
        self,
        keywords: List[str],
        folder_name: Optional[str] = None,
        max_results: int = 10
    ) -> List[Tuple[DriveFile, float]]:
        """
        Search for files matching keywords
        
        Args:
            keywords: List of search keywords
            folder_name: Optional folder to search in
            max_results: Maximum number of results
            
        Returns:
            List of (DriveFile, score) tuples
        """
        # Get folder ID if folder name provided
        folder_id = None
        if folder_name:
            folder_id = self.drive_service.find_folder_by_name(folder_name)
        
        # List files
        files = self.drive_service.list_files(folder_id=folder_id)
        
        # Score and filter files
        scored_files = []
        for file in files:
            # Skip folders
            if file.mime_type == 'application/vnd.google-apps.folder':
                continue
            
            score = self.score_file_relevance(file, keywords, folder_name)
            
            # Only include files with score > 0
            if score > 0:
                scored_files.append((file, score))
        
        # Sort by score (descending) and limit results
        scored_files.sort(key=lambda x: x[1], reverse=True)
        return scored_files[:max_results]
    
    def get_relevant_files(
        self,
        content_type: str,
        user_query: str,
        max_files: int = 10
    ) -> List[Dict]:
        """
        Get relevant files based on content type and user query
        
        Args:
            content_type: Type of content being generated
            user_query: User's query/request
            max_files: Maximum number of files to return
            
        Returns:
            List of file dictionaries with content
        """
        # Extract keywords from query
        keywords = self.extract_keywords(user_query)
        
        # Add content-type specific keywords
        type_keywords = {
            'newsletter': ['newsletter', 'monthly', 'update', 'community'],
            'blog_post': ['blog', 'post', 'article', 'story'],
            'donor_email': ['donor', 'thank', 'donation', 'contribution'],
            'social_media': ['social', 'instagram', 'twitter', 'facebook', 'post'],
        }
        
        if content_type in type_keywords:
            keywords.extend(type_keywords[content_type])
        
        # Map content type to folder
        folder_map = {
            'newsletter': 'Newsletters',
            'blog_post': 'Blog Posts',
            'donor_email': 'Donor Emails',
            'social_media': 'Social Media',
        }
        
        target_folder = folder_map.get(content_type)
        
        # Search for relevant files
        scored_files = self.search_files_by_keywords(
            keywords=keywords,
            folder_name=target_folder,
            max_results=max_files
        )
        
        # Also search in general folders
        general_folders = ['Impact Stories', 'Events', 'Programs']
        for folder in general_folders:
            additional_files = self.search_files_by_keywords(
                keywords=keywords,
                folder_name=folder,
                max_results=max(3, max_files // 3)
            )
            scored_files.extend(additional_files)
        
        # Re-sort and limit
        scored_files.sort(key=lambda x: x[1], reverse=True)
        scored_files = scored_files[:max_files]
        
        # Retrieve file contents
        relevant_files = []
        for file, score in scored_files:
            content = self.drive_service.get_file_content(file.id)
            if content:
                # Limit content length to avoid token overflow
                max_content_length = 5000  # ~1250 tokens
                if len(content) > max_content_length:
                    content = content[:max_content_length] + "\n...(content truncated)"
                
                relevant_files.append({
                    'name': file.name,
                    'folder': file.folder_path or target_folder or 'Unknown',
                    'content': content,
                    'relevance_score': score,
                    'modified_time': file.modified_time.isoformat() if file.modified_time else None
                })
        
        return relevant_files
    
    def cache_file_metadata(self, files: List[DriveFile]):
        """
        Cache file metadata in MongoDB for faster retrieval
        
        Args:
            files: List of DriveFile objects
        """
        collection = self.db['file_metadata']
        
        for file in files:
            # Get file content preview
            content = self.drive_service.get_file_content(file.id)
            preview = content[:500] if content else None
            
            # Upsert to database
            collection.update_one(
                {'drive_file_id': file.id},
                {
                    '$set': {
                        'name': file.name,
                        'mime_type': file.mime_type,
                        'folder': file.folder_path,
                        'created_at': file.created_time,
                        'last_sorted': datetime.utcnow(),
                        'content_preview': preview
                    }
                },
                upsert=True
            )
    
    def get_recent_files(
        self,
        folder_name: str,
        days: int = 30,
        max_files: int = 5
    ) -> List[Dict]:
        """
        Get recently modified files from a folder
        
        Args:
            folder_name: Folder to search
            days: Number of days to look back
            max_files: Maximum files to return
            
        Returns:
            List of file dictionaries
        """
        folder_id = self.drive_service.find_folder_by_name(folder_name)
        if not folder_id:
            return []
        
        files = self.drive_service.list_files(folder_id=folder_id)
        
        # Filter by date
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_files = [
            f for f in files 
            if f.modified_time and f.modified_time.replace(tzinfo=None) > cutoff_date
            and f.mime_type != 'application/vnd.google-apps.folder'
        ]
        
        # Sort by modified time (descending)
        recent_files.sort(key=lambda x: x.modified_time or datetime.min, reverse=True)
        
        # Limit and get content
        result = []
        for file in recent_files[:max_files]:
            content = self.drive_service.get_file_content(file.id)
            if content:
                result.append({
                    'name': file.name,
                    'folder': folder_name,
                    'content': content[:5000],  # Limit length
                    'modified_time': file.modified_time.isoformat()
                })
        
        return result
