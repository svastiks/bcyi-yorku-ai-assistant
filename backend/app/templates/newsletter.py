"""Newsletter content template"""

NEWSLETTER_TEMPLATE = {
    "content_type": "newsletter",
    "name": "Newsletter",
    "description": "Create engaging monthly updates",
    
    "system_prompt": """You are a community communicator for a mission-driven organization.

GOAL: Summarize activity, reinforce impact, and keep the community engaged and informed. Use the context files (e.g. event summaries, past newsletters) to reflect the organization's actual name, programs, and voice.

INSTRUCTIONS:
- When reference newsletters are provided in context, analyze their structure and pacing — match the style without copying content
- Keep tone warm, informative, and community-oriented throughout
- Avoid information overload: be selective about what to highlight; every section should feel purposeful
- Use concrete details from provided context (events, programs, participant numbers, outcomes)
- Each section should have a brief, natural CTA — not forced or sales-like

OUTPUT REQUIREMENTS:
- Subject line (clear and specific to the time period or highlight)
- Short welcome intro (2–3 sentences)
- 2–4 sections with clear headers
- Brief CTA per section where relevant
- Length: 300–500 words total

VOICE:
Act like a mission-driven non-profit communicator writing to a community that already knows and cares about the organization. Warm, honest, informative — never promotional or over-enthusiastic. Use context to get the organization's name and specifics right.""",

    "structure": {
        "sections": [
            "subject_line",
            "short_welcome_intro",
            "sections_2_to_4_with_headers",
            "brief_ctas_per_section"
        ],
        "tone": "warm, informative, community-oriented — never promotional or overwhelming",
        "length": "300–500 words",
        "format": "Email-friendly with clear section headers and brief CTAs per section"
    },
    
    "context_needs": {
        "recent_events": {
            "folder": "Events",
            "days": 30,
            "description": "Recent programs and activities"
        },
        "success_stories": {
            "folder": "Impact Stories",
            "count": 2,
            "description": "Success stories and testimonials"
        },
        "previous_newsletters": {
            "folder": "Newsletters",
            "count": 3,
            "description": "Past newsletters for consistency and style"
        },
        "upcoming_events": {
            "folder": "Events",
            "future": True,
            "description": "Upcoming programs and opportunities"
        }
    },
    
    "example_output": """Subject: January 2026 - Celebrating Success This Month

Dear Community,

Happy New Year! As we step into 2026, we're excited to share the achievements and moments from the past month.

🏀 MAIN HIGHLIGHT: [Use context to describe a key event]

Last weekend, [use context for numbers and details]. Special congratulations to [use context for names or teams]!

📚 Recent Activities

- [Use context for program stats and highlights]
- [Use context]
- [Use context]

🌟 Success Story: [Use context for a named story or anonymized example]

[Use context for quote or outcome.]

📅 Coming Up

- [Use context for upcoming events and dates]

💙 How You Can Help

Your support makes stories like these possible. Consider:
- Volunteering for upcoming programs
- Donating to support [use context]
- Spreading the word in your community

Together, we're building brighter futures!

With gratitude,
[Use context for sign-off and organization name]
"""
}
