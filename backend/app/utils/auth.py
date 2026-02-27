"""Google OAuth authentication utilities"""
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from app.config import settings
from typing import Optional, Dict
import json
import os


class GoogleAuthHandler:
    """Handle Google OAuth 2.0 authentication"""
    
    # Scopes for Google Drive (read + write for sort)
    SCOPES = ['https://www.googleapis.com/auth/drive']
    
    @staticmethod
    def create_flow() -> Flow:
        """Create OAuth flow"""
        client_config = {
            "web": {
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uris": [settings.google_redirect_uri],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }
        
        flow = Flow.from_client_config(
            client_config,
            scopes=GoogleAuthHandler.SCOPES,
            redirect_uri=settings.google_redirect_uri
        )
        
        return flow
    
    @staticmethod
    def get_authorization_url() -> tuple[str, str, str]:
        """
        Get authorization URL for OAuth flow.

        Returns:
            Tuple of (authorization_url, state, code_verifier)
        """
        flow = GoogleAuthHandler.create_flow()
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        # google-auth-oauthlib now enables PKCE by default and generates a
        # code_verifier internally. We must persist this value across the
        # redirect so that the token exchange can succeed.
        code_verifier = getattr(flow, "code_verifier", "")
        return authorization_url, state, code_verifier
    
    @staticmethod
    def exchange_code_for_token(code: str, code_verifier: Optional[str] = None) -> Dict:
        """
        Exchange authorization code for access token.

        Args:
            code: Authorization code returned from Google.
            code_verifier: PKCE code verifier that was used when generating
                the authorization URL. If provided, it will be attached to
                the flow before exchanging the code for tokens.
        """
        flow = GoogleAuthHandler.create_flow()
        if code_verifier:
            # Attach the original PKCE verifier so Google can validate the
            # code challenge that was sent during the authorization step.
            setattr(flow, "code_verifier", code_verifier)
        flow.fetch_token(code=code)
        
        credentials = flow.credentials
        return {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
    
    @staticmethod
    def create_credentials_from_token(token_dict: Dict) -> Credentials:
        """Create Credentials object from token dictionary"""
        return Credentials(
            token=token_dict.get('token'),
            refresh_token=token_dict.get('refresh_token'),
            token_uri=token_dict.get('token_uri'),
            client_id=token_dict.get('client_id'),
            client_secret=token_dict.get('client_secret'),
            scopes=token_dict.get('scopes')
        )
    
    @staticmethod
    def refresh_token_if_needed(credentials: Credentials) -> Credentials:
        """Refresh token if expired"""
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
        return credentials
    
    @staticmethod
    def credentials_to_dict(credentials: Credentials) -> Dict:
        """Convert Credentials to dictionary for storage"""
        return {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
    
