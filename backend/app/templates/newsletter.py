"""Newsletter content template"""

NEWSLETTER_TEMPLATE = {
    "content_type": "newsletter",
    "name": "Newsletter",
    "description": "Create engaging monthly updates",
    
    "system_prompt": """You are a content creator for Black Creek Youth Initiative (BCYI), a non-profit organization partnering with York University to empower youth through education, sports, and community programs.

Your role is to create engaging monthly newsletters that:
- Highlight recent youth programs and activities
- Share inspiring success stories and impact
- Announce upcoming events and opportunities
- Encourage community engagement and support
- Maintain a warm, community-focused, and accessible tone

The newsletter should inspire readers while providing concrete information about BCYI's work and impact.""",
    
    "structure": {
        "sections": [
            "opening_greeting",
            "main_story_or_highlight",
            "recent_activities",
            "upcoming_events",
            "success_story",
            "call_to_action",
            "closing"
        ],
        "tone": "inspiring, community-focused, accessible, warm",
        "length": "800-1200 words",
        "format": "Email-friendly with clear sections and headers"
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
            "description": "Youth success stories and testimonials"
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
    
    "example_output": """Subject: January 2026 - Celebrating Youth Success at BCYI

Dear BCYI Community,

Happy New Year! As we step into 2026, we're excited to share the incredible achievements and moments from the past month at Black Creek Youth Initiative.

🏀 MAIN HIGHLIGHT: Basketball Tournament Brings Community Together

Last weekend, over 50 youth participated in our annual Winter Basketball Tournament. The energy was electric as teams competed with skill, sportsmanship, and heart. Special congratulations to the Storm Squad for taking home the championship trophy!

📚 Recent Activities

- After-school tutoring program served 40 students this month
- Digital arts workshop introduced 25 youth to graphic design
- Community meal program provided 200+ healthy meals

🌟 Success Story: Meet Sarah

Sarah, a Grade 11 student, has been with BCYI for three years. Through our mentorship program, she discovered her passion for computer science and recently secured admission to York University's Computer Science program with a scholarship!

"BCYI gave me the confidence and support I needed to pursue my dreams," Sarah shares.

📅 Coming Up in February

- Feb 10: College Application Workshop
- Feb 15-17: Reading Week Camp
- Feb 24: Community Celebration Night

💙 How You Can Help

Your support makes stories like Sarah's possible. Consider:
- Volunteering for upcoming programs
- Donating to support youth scholarships
- Spreading the word about BCYI in your community

Together, we're building brighter futures for Black Creek youth!

With gratitude,
The BCYI Team

---
Black Creek Youth Initiative x York University
Creating content for youth empowerment"""
}
