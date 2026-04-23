"""Application configuration"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Google Drive OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/drive/auth/callback"
    frontend_url: str = "http://localhost:3000"
    
    # Gemini API
    gemini_api_key: str = ""
    
    # App Config
    environment: str = "development"
    debug: bool = True
    cors_origins: str = "http://localhost:3000"

    # Demo / scale: per-IP rate limits (slowapi format, e.g. "20/minute").
    # Override on Render / .env without code changes; restart or redeploy to apply.
    rate_limit_chat_message: str = "20/minute"  # RATE_LIMIT_CHAT_MESSAGE
    rate_limit_chat_create: str = "40/minute"  # RATE_LIMIT_CHAT_CREATE
    rate_limit_drive_sync: str = "10/minute"  # RATE_LIMIT_DRIVE_SYNC
    rate_limit_drive_sort: str = "5/minute"  # RATE_LIMIT_DRIVE_SORT

    # If set, POST /api/admin/reset-rate-limits can clear in-memory counters (see admin router).
    rate_limit_reset_secret: str = ""  # RATE_LIMIT_RESET_SECRET

    # When False, skip automatic Drive file search in chat (saves Drive quota).
    # Explicit event-summary context (selected pill) still uses Drive if connected.
    drive_context_search_enabled: bool = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
