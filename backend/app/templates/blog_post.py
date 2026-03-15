"""Blog post content template"""

BLOG_POST_TEMPLATE = {
    "content_type": "blog_post",
    "name": "Blog Post",
    "description": "Write impactful stories",
    
    "system_prompt": """You are a thoughtful writer and communicator for a mission-driven organization.

GOAL: Inform, reflect, and position the organization as thoughtful and impact-driven. Use the context files (e.g. event summaries, impact stories) to reflect the organization's actual name, programs, and voice.

INSTRUCTIONS:
- When reference blog posts are provided in context, mirror their pacing and depth — match the style without copying phrasing or structure exactly
- Blend narrative moments with insight or reflection; do not write purely informational or purely emotional content
- Maintain clarity and accessibility — avoid academic jargon, write for a community, partner, and donor audience
- Center real people, real outcomes, and specific program details from the context
- Each section should earn its place: no filler, no generic statements without specifics

OUTPUT REQUIREMENTS:
- Title (clear, specific, not generic)
- Introduction with a clear hook that draws the reader in
- 2–4 short body sections with subheadings
- Closing paragraph that reinforces the organization's purpose and leaves the reader with something to carry
- Length: 600–900 words

VOICE:
Act like a mission-driven non-profit communicator. Balance empathy and evidence. Write as someone who genuinely knows this community — not an outside observer describing it. Use context to get names, programs, and details right.""",

    "structure": {
        "sections": [
            "title",
            "introduction_with_hook",
            "body_sections_2_to_4",
            "closing_paragraph_reinforcing_purpose"
        ],
        "tone": "authentic, thoughtful, reflective, accessible — never generic or jargon-heavy",
        "length": "600–900 words",
        "format": "Blog-style with subheadings and narrative flow; blend story with insight"
    },
    
    "context_needs": {
        "related_stories": {
            "folder": "Impact Stories",
            "count": 3,
            "description": "Similar stories for context and inspiration"
        },
        "program_details": {
            "folder": "Programs",
            "description": "Information about relevant programs"
        },
        "previous_blogs": {
            "folder": "Blog Posts",
            "count": 2,
            "description": "Past blog posts for style consistency"
        },
        "testimonials": {
            "folder": "Testimonials",
            "description": "Quotes and testimonials from community"
        }
    },
    
    "example_output": """# [Use context for a specific, compelling title]

*[Subtitle that sets the tone]*

[Use context for opening: a person, moment, or scene that hooks the reader. E.g. "Three years ago, [Name] walked into [program/place] for the first time..."]

## [Section heading]

[Use context for story and quotes. Mirror the pacing of reference blog posts if provided.]

## [Section heading]

[Use context for program details, structure, and impact. Include specific elements from context.]

## [Section heading]

[Use context for a turning point or outcome—grades, confidence, leadership, etc.]

## [Section heading]

[Use context for how the person gives back or what they do now.]

## [Section heading]

[Use context to tie the story to the broader mission and community.]

## [Closing section]

[Use context for next steps, quote, or call to action.]

---

*Stories like these are possible because of community support. Learn more about how you can get involved at [use context for organization name].*

**Tags:** [Use context for relevant tags]
"""
}
