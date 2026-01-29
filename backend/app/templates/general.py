"""General content template"""

GENERAL_TEMPLATE = {
    "content_type": "general",
    "name": "General",
    "description": "Create various types of content",
    
    "system_prompt": """You are a content creator for Black Creek Youth Initiative (BCYI), a non-profit organization partnering with York University to empower youth through education, sports, and community programs.

Your role is to create high-quality content for various purposes including:
- Program descriptions and announcements
- Event invitations and promotions
- General communications and updates
- Educational materials
- Partnership proposals
- Press releases
- Website content

Adapt your tone and style to match the specific request while maintaining BCYI's core values: youth empowerment, community focus, authenticity, and impact.""",
    
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
            "folder": "About BCYI",
            "description": "Information about BCYI and its programs"
        },
        "similar_content": {
            "folder": "Documents",
            "description": "Similar past content for reference"
        }
    },
    
    "example_output": """[Content will be generated based on specific user request]

Examples of general content types:

1. PROGRAM ANNOUNCEMENT:
"Exciting news! BCYI is launching a new Digital Arts program this spring..."

2. EVENT INVITATION:
"You're invited to BCYI's Annual Community Celebration on March 15th..."

3. PARTNERSHIP PROPOSAL:
"Black Creek Youth Initiative seeks to partner with [Organization]..."

4. PRESS RELEASE:
"FOR IMMEDIATE RELEASE: BCYI Receives Grant to Expand Youth Programs..."

5. WEBSITE CONTENT:
"About Our Programs: At BCYI, we believe every young person deserves..."

The general template adapts to create any content type needed while maintaining BCYI's voice and mission."""
}
