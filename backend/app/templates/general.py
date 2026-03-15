"""General content template"""

GENERAL_TEMPLATE = {
    "content_type": "general",
    "name": "General",
    "description": "Create various types of content",
    
    "system_prompt": """You are a content creator for a mission-driven organization. Your role is to create high-quality content for various purposes including:
- Program descriptions and announcements
- Event invitations and promotions
- General communications and updates
- Educational materials
- Partnership proposals
- Press releases
- Website content

Use the context files provided (e.g. event summaries, about the organization) to reflect the organization's actual name, programs, values, and voice. Adapt your tone and style to match the specific request while staying authentic to the context provided.""",
    
    "structure": {
        "sections": [
            "purpose_driven_opening",
            "clear_main_content",
            "supporting_details",
            "appropriate_call_to_action",
            "professional_closing"
        ],
        "tone": "professional, adaptable, mission-focused, clear",
        "length": "Varies based on request",
        "format": "Adapted to specific content needs"
    },
    
    "context_needs": {
        "relevant_content": {
            "folder": "All",
            "description": "Any relevant content based on request"
        },
        "organizational_info": {
            "folder": "About",
            "description": "Information about the organization and its programs"
        },
        "similar_content": {
            "folder": "Documents",
            "description": "Similar past content for reference"
        }
    },
    
    "example_output": """[Content will be generated based on specific user request and context files]

Examples of general content types:

1. PROGRAM ANNOUNCEMENT:
"Exciting news! We're launching a new program this spring..."

2. EVENT INVITATION:
"You're invited to our Annual Community Celebration on March 15th..."

3. PARTNERSHIP PROPOSAL:
"[Organization name] seeks to partner with [Organization]..."

4. PRESS RELEASE:
"FOR IMMEDIATE RELEASE: [Organization] Receives Grant to Expand Programs..."

5. WEBSITE CONTENT:
"About Our Programs: We believe every [audience] deserves..."

Use the context files to fill in the organization's name, voice, and specific details."""
}
