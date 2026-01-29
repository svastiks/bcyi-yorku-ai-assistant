"""Prompt builder service for constructing AI prompts with context"""
from app.templates import get_template
from typing import List, Dict, Optional


class PromptBuilder:
    """Service for building prompts with templates, context, and conversation history"""
    
    @staticmethod
    def format_chat_history(messages: List[Dict]) -> str:
        """
        Format chat history for inclusion in prompt
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            
        Returns:
            Formatted chat history string
        """
        if not messages:
            return "No previous conversation."
        
        formatted = []
        for msg in messages[-5:]:  # Only include last 5 messages
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
            formatted.append(f"{role.upper()}: {content}")
        
        return "\n".join(formatted)
    
    @staticmethod
    def format_context_files(context_files: List[Dict]) -> str:
        """
        Format context files for inclusion in prompt
        
        Args:
            context_files: List of file dictionaries with 'name', 'folder', 'content'
            
        Returns:
            Formatted context string
        """
        if not context_files:
            return "No relevant context files found."
        
        formatted = []
        for i, file_data in enumerate(context_files, 1):
            name = file_data.get('name', 'Unknown')
            folder = file_data.get('folder', 'Unknown')
            content = file_data.get('content', '')
            relevance = file_data.get('relevance_score', 0)
            
            formatted.append(f"""
--- CONTEXT FILE {i} ---
File: {name}
Folder: {folder}
Relevance: {relevance:.1f}/100

Content:
{content}

--- END CONTEXT FILE {i} ---
""")
        
        return "\n".join(formatted)
    
    @staticmethod
    def build_prompt(
        content_type: str,
        user_input: str,
        context_files: Optional[List[Dict]] = None,
        chat_history: Optional[List[Dict]] = None
    ) -> str:
        """
        Build complete prompt for AI generation
        
        Args:
            content_type: Type of content to generate
            user_input: User's request/query
            context_files: Optional list of relevant files with content
            chat_history: Optional conversation history
            
        Returns:
            Complete prompt string
        """
        # Get template for content type
        template = get_template(content_type)
        
        # Format context and history
        context_text = PromptBuilder.format_context_files(context_files or [])
        history_text = PromptBuilder.format_chat_history(chat_history or [])
        
        # Get template details
        system_prompt = template.get('system_prompt', '')
        structure = template.get('structure', {})
        
        # Build the complete prompt
        prompt = f"""{system_prompt}

===== CONTEXT FROM ORGANIZATION FILES =====

Below are relevant files from BCYI's Google Drive that provide context for your response. Use this information to create authentic, specific content that reflects the organization's actual work and impact.

{context_text}

===== END CONTEXT =====

===== PREVIOUS CONVERSATION =====

{history_text}

===== END CONVERSATION =====

===== CONTENT STRUCTURE GUIDELINES =====

Content Type: {template.get('name', content_type)}
Tone: {structure.get('tone', 'professional')}
Length: {structure.get('length', 'appropriate for purpose')}
Format: {structure.get('format', 'clear and organized')}

Sections to include: {', '.join(structure.get('sections', []))}

===== END GUIDELINES =====

===== USER REQUEST =====

{user_input}

===== END REQUEST =====

===== INSTRUCTIONS =====

Based on the context files, conversation history, and content structure guidelines above, create high-quality {content_type.replace('_', ' ')} content that:

1. Uses specific details and examples from the context files
2. Maintains authenticity to BCYI's voice and mission
3. Follows the structural guidelines for this content type
4. Addresses the user's specific request
5. Is ready to use with minimal editing

If the user's request is unclear, create the best possible content based on the available context and typical needs for this content type.

Generate the content now:

===== END INSTRUCTIONS =====
"""
        
        return prompt
    
    @staticmethod
    def build_simple_prompt(user_input: str, content_type: str = 'general') -> str:
        """
        Build a simple prompt without context files (fallback)
        
        Args:
            user_input: User's request
            content_type: Type of content
            
        Returns:
            Simple prompt string
        """
        template = get_template(content_type)
        system_prompt = template.get('system_prompt', '')
        
        prompt = f"""{system_prompt}

USER REQUEST:
{user_input}

Generate appropriate content for this request following BCYI's mission and voice.
"""
        
        return prompt
    
    @staticmethod
    def estimate_token_count(text: str) -> int:
        """
        Rough estimation of token count (4 chars ≈ 1 token)
        
        Args:
            text: Input text
            
        Returns:
            Estimated token count
        """
        return len(text) // 4
    
    @staticmethod
    def trim_context_to_token_limit(
        context_files: List[Dict],
        max_tokens: int = 20000
    ) -> List[Dict]:
        """
        Trim context files to fit within token limit
        
        Args:
            context_files: List of context files
            max_tokens: Maximum tokens for context
            
        Returns:
            Trimmed list of context files
        """
        if not context_files:
            return []
        
        # Sort by relevance score (descending)
        sorted_files = sorted(
            context_files,
            key=lambda x: x.get('relevance_score', 0),
            reverse=True
        )
        
        # Add files until token limit reached
        trimmed_files = []
        current_tokens = 0
        
        for file_data in sorted_files:
            content = file_data.get('content', '')
            file_tokens = PromptBuilder.estimate_token_count(content)
            
            if current_tokens + file_tokens <= max_tokens:
                trimmed_files.append(file_data)
                current_tokens += file_tokens
            else:
                # Try to add partial content
                remaining_tokens = max_tokens - current_tokens
                remaining_chars = remaining_tokens * 4
                
                if remaining_chars > 500:  # Only add if meaningful content
                    truncated_file = file_data.copy()
                    truncated_file['content'] = content[:remaining_chars] + "\n...(truncated)"
                    trimmed_files.append(truncated_file)
                
                break
        
        return trimmed_files
