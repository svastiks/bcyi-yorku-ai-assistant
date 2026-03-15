"""Google Gemini API client for content generation"""
from google import genai
from google.genai import types
from app.config import settings
from typing import Optional, Generator, Dict, List, Tuple
import time


class GeminiClient:
    """Client for interacting with Google Gemini API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini client
        
        Args:
            api_key: Optional API key (uses settings if not provided)
        """
        self.api_key = api_key or settings.gemini_api_key
        self.client = genai.Client(api_key=self.api_key)
        
        # Use Gemini 2.5 Flash - latest and most efficient model
        self.model_id = 'models/gemini-2.5-flash'
        
        # Generation config
        self.generation_config = types.GenerateContentConfig(
            temperature=0.7,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
        )
        
        # Safety settings (allow all content for non-profit use case)
        self.safety_settings = [
            types.SafetySetting(
                category='HARM_CATEGORY_HARASSMENT',
                threshold='BLOCK_NONE'
            ),
            types.SafetySetting(
                category='HARM_CATEGORY_HATE_SPEECH',
                threshold='BLOCK_NONE'
            ),
            types.SafetySetting(
                category='HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold='BLOCK_NONE'
            ),
            types.SafetySetting(
                category='HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold='BLOCK_NONE'
            ),
        ]
    
    def generate_content(
        self,
        prompt: str,
        stream: bool = False,
        image_parts: Optional[List[Tuple[bytes, str]]] = None,
    ) -> str:
        """
        Generate content from prompt. Optionally include image parts (bytes, mime_type).
        
        Args:
            prompt: Input prompt (text)
            stream: Whether to stream response
            image_parts: Optional list of (image_bytes, mime_type) for multimodal input
            
        Returns:
            Generated text content
        """
        try:
            if image_parts:
                return self._generate_multimodal(prompt, image_parts, stream=stream)
            if stream:
                return self._generate_streaming(prompt)
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=self.generation_config,
            )
            return response.text
        except Exception as e:
            print(f"Error generating content: {str(e)}")
            raise

    def _generate_multimodal(
        self,
        prompt: str,
        image_parts: List[Tuple[bytes, str]],
        stream: bool = False,
    ) -> str:
        """Build contents with text + image parts and generate."""
        parts = []
        for img_bytes, mime_type in image_parts:
            parts.append(types.Part.from_bytes(data=img_bytes, mime_type=mime_type))
        parts.append(types.Part.from_text(text=prompt))
        contents = types.Content(role="user", parts=parts)
        if stream:
            out = []
            for chunk in self.client.models.generate_content_stream(
                model=self.model_id,
                contents=contents,
                config=self.generation_config,
            ):
                if chunk.text:
                    out.append(chunk.text)
            return "".join(out)
        response = self.client.models.generate_content(
            model=self.model_id,
            contents=contents,
            config=self.generation_config,
        )
        return response.text
    
    def _generate_streaming(self, prompt: str) -> Generator[str, None, None]:
        """
        Generate content with streaming
        
        Args:
            prompt: Input prompt
            
        Yields:
            Chunks of generated text
        """
        try:
            response = self.client.models.generate_content_stream(
                model=self.model_id,
                contents=prompt,
                config=self.generation_config
            )
            
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        
        except Exception as e:
            print(f"Error in streaming generation: {str(e)}")
            yield f"Error: {str(e)}"
    
    def generate_with_retry(
        self,
        prompt: str,
        max_retries: int = 3,
        retry_delay: int = 2,
        image_parts: Optional[List[Tuple[bytes, str]]] = None,
    ) -> str:
        """
        Generate content with retry logic. Supports optional image parts for vision.
        """
        last_error = None
        for attempt in range(max_retries):
            try:
                return self.generate_content(
                    prompt, stream=False, image_parts=image_parts
                )
            except Exception as e:
                last_error = e
                print(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    retry_delay *= 2
        raise Exception(f"Failed after {max_retries} attempts: {str(last_error)}")
    
    def count_tokens(self, text: str) -> int:
        """
        Count tokens in text
        
        Args:
            text: Input text
            
        Returns:
            Token count
        """
        try:
            result = self.client.models.count_tokens(
                model=self.model_id,
                contents=text
            )
            return result.total_tokens
        except Exception as e:
            print(f"Error counting tokens: {str(e)}")
            # Fallback to rough estimation
            return len(text) // 4
    
    def check_prompt_length(self, prompt: str, max_tokens: int = 30000) -> Dict:
        """
        Check if prompt is within token limits
        
        Args:
            prompt: Input prompt
            max_tokens: Maximum allowed tokens
            
        Returns:
            Dictionary with token count and whether it's within limit
        """
        token_count = self.count_tokens(prompt)
        
        return {
            'token_count': token_count,
            'max_tokens': max_tokens,
            'within_limit': token_count <= max_tokens,
            'percentage': (token_count / max_tokens) * 100
        }
    
    async def generate_async(self, prompt: str) -> str:
        """
        Generate content asynchronously (future implementation)
        
        Args:
            prompt: Input prompt
            
        Returns:
            Generated text content
        """
        # For now, wrap sync method
        # Future: Use proper async implementation
        return self.generate_content(prompt, stream=False)
