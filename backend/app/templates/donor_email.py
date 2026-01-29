"""Donor email content template"""

DONOR_EMAIL_TEMPLATE = {
    "content_type": "donor_email",
    "name": "Donor Email",
    "description": "Express gratitude and share impact",
    
    "system_prompt": """You are a content creator for Black Creek Youth Initiative (BCYI), a non-profit organization partnering with York University to empower youth through education, sports, and community programs.

Your role is to create heartfelt donor emails that:
- Express genuine gratitude for contributions
- Show concrete impact of donations
- Share specific stories and outcomes
- Make donors feel connected to the mission
- Maintain warmth and authenticity without being overly formal
- Include appropriate calls to action (when relevant)

Donor communications should honor the gift, celebrate the impact, and strengthen the relationship between donors and BCYI's mission.""",
    
    "structure": {
        "sections": [
            "warm_greeting",
            "expression_of_gratitude",
            "specific_impact_of_donation",
            "story_or_example",
            "broader_context",
            "looking_forward",
            "closing_with_thanks"
        ],
        "tone": "grateful, warm, personal, impact-focused",
        "length": "400-700 words",
        "format": "Email with personal touch and clear impact statements"
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
    
    "example_output": """Subject: Thank You for Making a Difference at BCYI

Dear [Donor Name],

Thank you.

These two words feel too small to express how grateful we are for your recent donation of [amount] to Black Creek Youth Initiative. Your generosity is changing lives in our community, and we wanted you to see exactly how.

Because of donors like you, this month alone:
- 40 youth received after-school tutoring and mentorship
- 50 students participated in our basketball and sports programs
- 25 young people explored new skills in our digital arts workshop
- 200+ healthy meals were provided to youth and families

But numbers only tell part of the story. Let me tell you about Amara.

Amara is a 15-year-old who joined BCYI's programs last spring. She was quiet, unsure of herself, and struggling academically. Through consistent mentorship from York University student volunteers—made possible by donations like yours—Amara found her voice and her confidence.

Last week, she led a presentation at our community showcase about environmental justice, a topic she's now passionate about. Her mom told us it was the first time she'd seen Amara truly light up talking about her future.

"BCYI gave Amara a place to belong and grow," her mom shared. "We're so grateful."

We're grateful too—grateful for partners like you who make transformations like Amara's possible.

Your donation directly supports:
- Qualified mentors and program staff
- Educational materials and resources
- Safe, welcoming program spaces
- Nutritious meals and snacks
- Equipment and supplies for activities

As we look ahead to the rest of the year, we're excited about expanding our programs to reach even more youth in the Black Creek community. With continued support from caring donors like you, we know we can multiply our impact.

Thank you for believing in the potential of every young person we serve. Thank you for investing in their futures. Thank you for being part of the BCYI family.

With heartfelt gratitude,

[Name]
[Title]
Black Creek Youth Initiative

P.S. We'd love to welcome you to visit our programs in person! If you're interested in seeing the impact of your donation firsthand, please reply to this email. We'd be honored to show you around.

---
Black Creek Youth Initiative x York University
[Contact Information]
[Tax Receipt Information]"""
}
