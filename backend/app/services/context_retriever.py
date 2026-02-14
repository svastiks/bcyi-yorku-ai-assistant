"""Context retrieval service for finding relevant files from Google Drive"""
from app.services.google_drive import GoogleDriveService
from app.models.file_metadata import DriveFile
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import re


class ContextRetriever:
    """Service for retrieving relevant context from Google Drive"""
    
    def __init__(self, drive_service: GoogleDriveService):
        """Initialize with Google Drive service"""
        self.drive_service = drive_service
    
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
    
    def _filename_like_tokens(self, text: str) -> List[str]:
        """Extract tokens that look like filenames (underscore, or quoted)."""
        tokens = []
        words = text.strip().split()
        for w in words:
            w = w.strip('.,!?;:"\'')
            if "_" in w and len(w) > 2:
                tokens.append(w.lower())
            if w.startswith('"') and w.endswith('"') and len(w) > 2:
                tokens.append(w[1:-1].lower())
        return list(dict.fromkeys(tokens))

    def _content_search_terms(self, user_query: str, keywords: List[str], max_terms: int = 5) -> List[str]:
        """Terms to run fullText search on: time-like (2pm, 5pm), numbers, and longer keywords."""
        terms = []
        words = re.findall(r"[a-zA-Z0-9]+(?:\s*[-–]\s*[a-zA-Z0-9]+)?|[a-zA-Z0-9]+", user_query)
        for w in words:
            w = w.strip().lower()
            if len(w) < 2:
                continue
            if re.search(r"\d", w):
                terms.append(w)
        for k in sorted(keywords, key=len, reverse=True):
            if k not in terms and len(k) > 2:
                terms.append(k)
        return list(dict.fromkeys(terms))[:max_terms]

    def search_files_by_keywords(
        self,
        keywords: List[str],
        folder_name: Optional[str] = None,
        files: Optional[List[DriveFile]] = None,
        max_results: int = 10
    ) -> List[Tuple[DriveFile, float]]:
        """Search for files matching keywords. Pass files= to search a pre-fetched list."""
        if files is None:
            folder_id = self.drive_service.find_folder_by_name(folder_name) if folder_name else None
            files = self.drive_service.list_files(folder_id=folder_id)
        scored_files = []
        for file in files:
            if file.mime_type == "application/vnd.google-apps.folder":
                continue
            score = self.score_file_relevance(file, keywords, folder_name)
            if score > 0:
                scored_files.append((file, score))
        scored_files.sort(key=lambda x: x[1], reverse=True)
        return scored_files[:max_results]

    def get_relevant_files(
        self,
        content_type: str,
        user_query: str,
        max_files: int = 10
    ) -> List[Dict]:
        """Get relevant files: filename match, then fullText content search, then keyword-by-name over root + subfolders."""
        keywords = self.extract_keywords(user_query)
        type_keywords = {
            'newsletter': ['newsletter', 'monthly', 'update', 'community'],
            'blog_post': ['blog', 'post', 'article', 'story'],
            'donor_email': ['donor', 'thank', 'donation', 'contribution'],
            'social_media': ['social', 'instagram', 'twitter', 'facebook', 'post'],
        }
        if content_type in type_keywords:
            keywords.extend(type_keywords[content_type])

        relevant_files = []
        seen_ids = set()

        # 1) Explicit filename match: user said "use test_event_summary" etc.
        for token in self._filename_like_tokens(user_query):
            by_name = self.drive_service.list_files_by_name(token)
            if not by_name and "_" in token:
                by_name = self.drive_service.list_files_by_name(token.replace("_", " "))
            for file in by_name:
                if file.id in seen_ids or file.mime_type == "application/vnd.google-apps.folder":
                    continue
                seen_ids.add(file.id)
                content = self.drive_service.get_file_content(file.id)
                if content:
                    if len(content) > 5000:
                        content = content[:5000] + "\n...(truncated)"
                    relevant_files.append({
                        'name': file.name,
                        'folder': file.folder_path or 'Drive',
                        'content': content,
                        'relevance_score': 100.0,
                        'modified_time': file.modified_time.isoformat() if file.modified_time else None
                    })
                    if len(relevant_files) >= max_files:
                        return relevant_files

        # 2) Content search: fullText for terms like "2pm", "5pm", "summary", "time"
        for term in self._content_search_terms(user_query, keywords, max_terms=5):
            if len(relevant_files) >= max_files:
                break
            try:
                by_content = self.drive_service.list_files_by_content(term, page_size=10)
                for file in by_content:
                    if file.id in seen_ids or file.mime_type == "application/vnd.google-apps.folder":
                        continue
                    seen_ids.add(file.id)
                    content = self.drive_service.get_file_content(file.id)
                    if content:
                        if len(content) > 5000:
                            content = content[:5000] + "\n...(truncated)"
                        relevant_files.append({
                            'name': file.name,
                            'folder': file.folder_path or 'Drive',
                            'content': content,
                            'relevance_score': 85.0,
                            'modified_time': file.modified_time.isoformat() if file.modified_time else None
                        })
                        if len(relevant_files) >= max_files:
                            break
            except Exception:
                continue

        # 3) Keyword search over root + all immediate subfolders (by name)
        all_files = self.drive_service.list_root_and_subfolder_files()
        scored = self.search_files_by_keywords(keywords=keywords, files=all_files, max_results=max_files)
        for file, score in scored:
            if file.id in seen_ids:
                continue
            seen_ids.add(file.id)
            content = self.drive_service.get_file_content(file.id)
            if content:
                if len(content) > 5000:
                    content = content[:5000] + "\n...(truncated)"
                relevant_files.append({
                    'name': file.name,
                    'folder': file.folder_path or 'Drive',
                    'content': content,
                    'relevance_score': score,
                    'modified_time': file.modified_time.isoformat() if file.modified_time else None
                })
            if len(relevant_files) >= max_files:
                break

        return relevant_files
    
    def cache_file_metadata(self, files: List[DriveFile]):
        """
        Cache file metadata (currently disabled - no database)
        
        Args:
            files: List of DriveFile objects
        """
        # Database removed - this is a no-op now
        pass
    
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
