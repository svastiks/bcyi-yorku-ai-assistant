"""Donor email content template"""

DONOR_EMAIL_TEMPLATE = {
    "content_type": "donor_email",
    "name": "Donor Email",
    "description": "Express gratitude and share impact",
    
    "system_prompt": """You are a mission-driven communicator for a non-profit or community organization.

GOAL: Build trust, show impact, and encourage continued or new donor support. Use the context files (e.g. event summaries, impact stories) to reflect the organization's actual name, programs, and outcomes.

INSTRUCTIONS:
- When reference donor emails are provided in context, analyze them for tone, warmth, and pacing — then match that style without copying phrasing
- Balance emotional storytelling with concrete, evidence-based impact
- Write in a respectful, appreciative voice that honors the donor relationship
- Avoid sales-heavy language; this is a relationship communication, not a pitch
- Center real people, outcomes, and specific program details over general claims
- Express genuine gratitude for contributions and make donors feel connected to the mission

OUTPUT REQUIREMENTS:
- Subject line (≤ 60 characters)
- Email body (150–300 words)
- Clear CTA near the end (donate, read more, attend, or reply)
- Professional sign-off

VOICE:
Act like a mission-driven non-profit communicator. Balance empathy and evidence. Every sentence should either deepen trust or demonstrate real-world impact. Use context to get the organization's name and specifics right.""",

    "structure": {
        "sections": [
            "subject_line",
            "warm_greeting",
            "expression_of_gratitude",
            "specific_impact_story_or_example",
            "broader_program_context",
            "clear_call_to_action",
            "professional_sign_off"
        ],
        "tone": "grateful, warm, respectful, impact-focused — never sales-heavy",
        "length": "150–300 words (email body)",
        "format": "Email format with subject line ≤ 60 characters and professional sign-off"
    },
    
    "context_needs": {
        "recent_impact": {
            "folder": "Impact Stories",
            "count": 2,
            "description": "Recent success stories showing donation impact"
        },
        "program_outcomes": {
            "folder": "Programs",
            "description": "Current program results and metrics"
        },
        "previous_donor_emails": {
            "folder": "Donor Emails",
            "count": 2,
            "description": "Past donor communications for consistency"
        }
    },
    
    "example_output": """Subject: Thank You for Making a Difference

Dear [Donor Name],

Thank you.

These two words feel too small to express how grateful we are for your recent donation of [amount]. Your generosity is changing lives in our community, and we wanted you to see exactly how.

Because of donors like you, this month alone:
- [Use context for program stats and outcomes]
- [Use context]
- [Use context]

But numbers only tell part of the story. Let me tell you about [use context for a named or anonymized story].

[Use context for a specific impact story and quote if available.]

We're grateful too—grateful for partners like you who make transformations like these possible.

Your donation directly supports:
- [Use context for what donations fund]
- [Use context]

As we look ahead, we're excited about [use context for upcoming plans]. With continued support from caring donors like you, we know we can multiply our impact.

Thank you for believing in the potential of every person we serve. Thank you for investing in their futures. Thank you for being part of our community.

With heartfelt gratitude,

[Name]
[Title]
[Use context for organization name]

P.S. We'd love to welcome you to visit our programs in person! If you're interested in seeing the impact of your donation firsthand, please reply to this email.

---
[Use context for organization name and contact / tax receipt information]
"""
}
