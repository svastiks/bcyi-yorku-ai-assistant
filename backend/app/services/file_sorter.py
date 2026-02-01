"""File sorting service for organizing Google Drive files"""
from app.services.google_drive import GoogleDriveService
from app.models.file_metadata import DriveFile
from typing import Dict, List, Optional
from datetime import datetime
import re


# Folder set: Blog Posts, Annual Reports, Documents, Summaries, Photos, Videos, Newsletters, Social Media, Spreadsheets, Unsorted
SORTING_RULES = {
    'blog_posts': {
        'patterns': ['blog_', 'article_', 'post_', 'blog-', 'article-', 'post-'],
        'folder': 'Blog Posts',
        'keywords': ['blog', 'article', 'post']
    },
    'annual_reports': {
        'patterns': ['annual_report', 'annual-report', 'annualreport', 'yearly_report'],
        'folder': 'Annual Reports',
        'keywords': ['annual report', 'year in review', 'yearly report']
    },
    'summaries': {
        'patterns': ['summary_', 'summary-', 'summaries_', 'summaries-'],
        'folder': 'Summaries',
        'keywords': ['summary', 'summaries', 'executive summary', 'meeting summary']
    },
    'newsletters': {
        'patterns': ['newsletter_', 'monthly_update', 'newsletter-', 'monthly-update'],
        'folder': 'Newsletters',
        'keywords': ['newsletter', 'monthly update', 'community update']
    },
    'social_media': {
        'patterns': ['sm_', 'instagram_', 'twitter_', 'facebook_', 'linkedin_', 'social_', 'social-'],
        'folder': 'Social Media',
        'keywords': ['instagram', 'twitter', 'facebook', 'social media', 'tweet']
    },
    'photos': {
        'mime_types': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        'folder': 'Photos'
    },
    'videos': {
        'mime_types': ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
        'folder': 'Videos'
    },
    'documents': {
        'mime_types': [
            'application/vnd.google-apps.document',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'application/pdf'
        ],
        'folder': 'Documents'
    },
    'spreadsheets': {
        'mime_types': [
            'application/vnd.google-apps.spreadsheet',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ],
        'folder': 'Spreadsheets'
    }
}


class FileSorter:
    """Service for sorting and organizing Google Drive files"""
    
    def __init__(self, drive_service: GoogleDriveService):
        """Initialize with Google Drive service"""
        self.drive_service = drive_service
        self.folder_cache: Dict[str, str] = {}  # Cache folder IDs
    
    def analyze_file(self, file: DriveFile) -> Optional[str]:
        """
        Analyze a file and determine target folder
        
        Args:
            file: DriveFile object
            
        Returns:
            Target folder name, or None if no match
        """
        file_name_lower = file.name.lower()
        
        # Check each rule
        for rule_name, rule_config in SORTING_RULES.items():
            # Check MIME type rules first (for media files)
            if 'mime_types' in rule_config:
                if file.mime_type in rule_config['mime_types']:
                    return rule_config['folder']
            
            # Check filename patterns
            if 'patterns' in rule_config:
                for pattern in rule_config['patterns']:
                    if pattern.lower() in file_name_lower:
                        return rule_config['folder']
            
            # Check keywords (more flexible matching)
            if 'keywords' in rule_config:
                for keyword in rule_config['keywords']:
                    if keyword.lower() in file_name_lower:
                        return rule_config['folder']
        
        # No match found - return general folder
        return 'Unsorted'
    
    def create_folder_structure(self, parent_id: Optional[str] = None) -> Dict[str, str]:
        """
        Create organized folder structure in Google Drive
        
        Args:
            parent_id: Optional parent folder ID to create structure under
            
        Returns:
            Dictionary mapping folder names to their IDs
        """
        folder_map = {}
        
        # Collect all unique folder paths
        folder_paths = set()
        for rule_config in SORTING_RULES.values():
            folder_paths.add(rule_config['folder'])
        folder_paths.add('Unsorted')  # Add default folder
        
        # Create folders
        for folder_path in sorted(folder_paths):
            # Handle nested folders (e.g., "Media/Images")
            parts = folder_path.split('/')
            current_parent = parent_id
            
            for part in parts:
                # Build full path for caching
                if current_parent:
                    cache_key = f"{current_parent}/{part}"
                else:
                    cache_key = part
                
                # Check if already created
                if cache_key in self.folder_cache:
                    current_parent = self.folder_cache[cache_key]
                else:
                    # Create or get folder
                    folder_id = self.drive_service.get_or_create_folder(part, current_parent)
                    if folder_id:
                        self.folder_cache[cache_key] = folder_id
                        folder_map[folder_path] = folder_id
                        current_parent = folder_id
        
        return folder_map
    
    def sort_file(self, file: DriveFile, folder_map: Dict[str, str]) -> bool:
        """
        Sort a single file into appropriate folder
        
        Args:
            file: DriveFile object
            folder_map: Dictionary mapping folder names to IDs
            
        Returns:
            True if file was moved, False otherwise
        """
        target_folder = self.analyze_file(file)
        
        if target_folder and target_folder in folder_map:
            dest_folder_id = folder_map[target_folder]
            success = self.drive_service.move_file(file.id, dest_folder_id)
            
            if success:
                print(f"Sorted '{file.name}' -> {target_folder}")
                return True
            else:
                print(f"Failed to sort '{file.name}'")
                return False
        
        return False
    
    def sort_all_files(
        self, 
        source_folder_id: Optional[str] = None,
        parent_for_organization: Optional[str] = None
    ) -> Dict:
        """Sort all files; returns stats plus files_found, folders_created, sorted, skipped, failed."""
        folder_map = self.create_folder_structure(parent_for_organization)
        files = self.drive_service.list_files(folder_id=source_folder_id)

        files_found = [{"name": f.name, "mime_type": f.mime_type} for f in files]
        folders_created = list(folder_map.keys())
        sorted_list: List[Dict] = []
        skipped_list: List[Dict] = []
        failed_list: List[Dict] = []

        for file in files:
            if file.mime_type == 'application/vnd.google-apps.folder':
                skipped_list.append({"name": file.name, "reason": "folder"})
                continue
            target_folder = self.analyze_file(file)
            if target_folder and target_folder in folder_map:
                success = self.drive_service.move_file(file.id, folder_map[target_folder])
                if success:
                    sorted_list.append({"name": file.name, "target_folder": target_folder})
                else:
                    failed_list.append({"name": file.name})
            else:
                failed_list.append({"name": file.name, "reason": target_folder or "no rule"})

        stats = {
            "total": len(files),
            "sorted": len(sorted_list),
            "skipped": len(skipped_list),
            "failed": len(failed_list),
        }
        return {
            **stats,
            "files_found": files_found,
            "folders_created": folders_created,
            "sorted": sorted_list,
            "skipped": skipped_list,
            "failed": failed_list,
        }
    
    def get_sorting_rules(self) -> Dict:
        """Get current sorting rules for display"""
        return SORTING_RULES
