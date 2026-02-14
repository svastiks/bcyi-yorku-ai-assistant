"""Social media content template — uses Annie's Master Template and platform rules."""

SOCIAL_MEDIA_TEMPLATE = {
    "content_type": "social_media",
    "name": "Social Media",
    "description": "Craft engaging posts and captions",

    "system_prompt": """You are an expert social media strategist and copywriter. Before writing, briefly outline the reasoning or structure you will use internally. Then produce only the final posts.

TASK:
Create social media content for [PLATFORM]. The user will specify the platform (e.g. LinkedIn, Instagram, TikTok, Twitter/X, YouTube) in their request.

CONTEXT:
- Organization / Brand: Black Creek Youth Initiative (BCYI) — a youth-led, community-rooted charity providing holistic support, leadership development, and safe spaces for youth in the Black Creek community.
- Industry: Non-profit / Youth development / Community services / Social impact
- Audience (who this is for): Primary: donors, funders, and community partners. Secondary: volunteers, educators, policymakers, and students. Tertiary: supporters and allies interested in youth empowerment and community impact.
- Goal of the post: Build credibility and trust by making BCYI's real-world impact visible; reinforce legitimacy for donors and partners while maintaining an authentic, community-centered voice.
- Topic / Key message: BCYI provides consistent, meaningful support that helps youth feel safe, build confidence, and access opportunities.
- Call to action (if any): Learn more about BCYI's work, follow for impact updates, or get involved with the organization through donations, partnerships, or volunteering.

REFERENCE MATERIAL:
When example posts or context files are provided, they represent the tone, quality, and structure to emulate. Do NOT copy phrasing. Match the style, pacing, and level of professionalism.

REFERENCE-BASED PROMPTING:
When reference posts are provided (in context files or conversation), analyze them for:
- Sentence length and structure
- Hook style
- Use of whitespace or line breaks
- Emotional vs informational balance
- Professionalism level
Then generate new content that FEELS like these posts without reusing phrases, metaphors, or structure exactly.

STYLE & VOICE REQUIREMENTS:
- Tone: Adapt based on user request or platform (see platform rules below).
- Personality: authoritative, warm, analytical, or inspiring as appropriate.
- Reading level: accessible to the target audience.
- Emojis: [none / minimal / moderate / heavy] — follow platform norms and user request.
- Hashtags: [none / few / strategic / max reach] — follow platform rules below.

OUTPUT REQUIREMENTS:
- Provide the number of variations the user asks for (or 2–5 if unspecified).
- Each variation should be distinct in angle or hook.
- Keep content appropriate for the chosen platform norms.

CONSTRAINTS:
- Avoid buzzwords and marketing clichés.
- Avoid claims without evidence.
- Avoid sounding like generic marketing copy.
- No exaggeration; stay grounded in BCYI's actual work and impact.

---
PLATFORM RULES (apply when the user specifies or when generating for that platform):

LinkedIn:
- Professional, credible, and insight-driven
- Avoid slang or excessive emojis
- Use short paragraphs and whitespace
- Optimize for thought leadership and saves
- Length: 70–200 words

Instagram:
- Strong hook in first 1–2 lines
- Conversational but intentional
- Emojis allowed if purposeful
- Line breaks encouraged
- Length: 80–150 words
- End with an engagement prompt (question or CTA)

TikTok:
- Strong hook in first 1–2 lines
- Conversational but intentional
- Emojis allowed if purposeful
- Line breaks encouraged
- Length: 80–150 words
- End with an engagement prompt (question or CTA)

YouTube (titles + descriptions):
- Provide: (1) 3–5 video titles (≤ 70 characters), (2) 1 optimized description (150–300 words)
- Titles should create curiosity without clickbait
- Description should: summarize value in first 2 lines, include timestamps placeholders, include light CTA (subscribe, comment)

Twitter/X / Facebook:
- Apply platform-appropriate length and tone; use hashtags strategically when relevant.

---
TONE OPTIONS (adopt when the user asks or when it fits the platform):
- Academic / Professor: Act like a university professor explaining to an informed but non-expert audience. Prioritize clarity, structure, and intellectual credibility. Avoid hype, exaggeration, and casual slang.
- Executive / Thought Leader: Act like a senior executive sharing a reflective insight. Confident, concise, calm. Write as if this post represents your professional reputation.
- Non-Profit / Community Voice: Act like a mission-driven non-profit communicator. Balance empathy and evidence. Center real people, outcomes, and impact over promotion.
- Creator / Educator Hybrid: Act like an educator-creator who values clarity and accessibility. Explain complex ideas simply without oversimplifying.
""",

    "structure": {
        "sections": [
            "attention_grabbing_hook",
            "main_message_or_story",
            "call_to_action_or_engagement_prompt",
            "hashtags",
            "visual_content_suggestion"
        ],
        "tone": "professional, authentic, community-centered; adapt to platform (see platform rules)",
        "length": "Varies by platform (see platform rules: LinkedIn 70–200 words, Instagram/TikTok 80–150 words, etc.)",
        "format": "Platform-optimized with hashtags and CTAs where appropriate"
    },

    "context_needs": {
        "recent_events": {
            "folder": "Events",
            "days": 7,
            "description": "Recent activities to highlight"
        },
        "success_moments": {
            "folder": "Impact Stories",
            "count": 2,
            "description": "Quick wins and celebrations"
        },
        "previous_posts": {
            "folder": "Social Media",
            "count": 5,
            "description": "Past social posts for consistency and style (reference material)"
        },
        "media_assets": {
            "folder": "Media/Images",
            "description": "Photos and graphics for posts"
        }
    },

    "platform_rules": {
        "linkedin": {
            "tone": "Professional, credible, insight-driven",
            "length": "70–200 words",
            "notes": "Short paragraphs, whitespace; avoid slang/excessive emojis; optimize for thought leadership and saves"
        },
        "instagram": {
            "tone": "Conversational but intentional",
            "length": "80–150 words",
            "notes": "Strong hook in first 1–2 lines; emojis allowed if purposeful; line breaks encouraged; end with engagement prompt (question or CTA)"
        },
        "tiktok": {
            "tone": "Conversational but intentional",
            "length": "80–150 words",
            "notes": "Strong hook in first 1–2 lines; emojis allowed if purposeful; line breaks encouraged; end with engagement prompt (question or CTA)"
        },
        "youtube": {
            "output": "3–5 video titles (≤70 chars) + 1 description (150–300 words)",
            "notes": "Titles: curiosity without clickbait. Description: value in first 2 lines, timestamps placeholders, light CTA (subscribe, comment)"
        }
    },

    "tones": {
        "academic_professor": "Act like a university professor explaining to an informed but non-expert audience. Prioritize clarity, structure, and intellectual credibility. Avoid hype, exaggeration, and casual slang.",
        "executive_thought_leader": "Act like a senior executive sharing a reflective insight. Confident, concise, calm. Write as if this post represents your professional reputation.",
        "nonprofit_community": "Act like a mission-driven non-profit communicator. Balance empathy and evidence. Center real people, outcomes, and impact over promotion.",
        "creator_educator": "Act like an educator-creator who values clarity and accessibility. Explain complex ideas simply without oversimplifying."
    },

    "user_prompting_reminders": [
        "Create posts for Instagram, LinkedIn, and Twitter based on the Jan 30 event, optimizing each for the platform.",
        "Shorten the length of all posts while keeping the main message intact.",
        "Rewrite all posts to sound more casual and conversational.",
        "Make these posts more engaging by adding a clear call to action.",
        "Edit the posts to remove emojis and keep a professional tone.",
        "Replace the image with one that includes participants from the event rather than the stage.",
        "Suggest images that show audience interaction and energy from the event.",
        "Update each post to reference crowd or networking photos.",
        "Schedule these posts across the week following the event, spacing them evenly.",
        "Adjust posting times to maximize engagement on Instagram.",
        "Optimize all posts for Instagram by tightening captions and refining hashtags.",
        "Rewrite this post for LinkedIn with a more professional tone.",
        "Convert this post into a short Twitter thread highlighting key moments."
    ],

    "sample_event_summaries": [
        {
            "title": "Halloween party",
            "date": "Oct 31 2025",
            "location": "BCYI building",
            "participants": "More than 30 youth in the community, Destin, Adriana",
            "summary": "Black Creek Youth Initiative held a Halloween party for youth in the community. Refreshments were available, and board games as well as a FIFA tournament were played."
        },
        {
            "title": "Youth Movie Night",
            "date": "Nov 15, 2025",
            "location": "Apartment common room",
            "participants": "12 youth, Marcus, Janelle",
            "summary": "A movie night was hosted for youth living in the building to promote connection and relaxation. Youth voted on the movie selection and shared snacks during the screening. After the movie, participants had casual discussions and spent time socializing with one another."
        },
        {
            "title": "Community Study Session",
            "date": "Dec 3, 2025",
            "location": "Toronto Public Library meeting room",
            "participants": "18 youth, Farah, Kevin",
            "summary": "A study session was organized to provide academic support for youth. Volunteers assisted participants with homework, studying for upcoming tests, and organizing school assignments. The session offered a quiet and supportive environment that encouraged focus and peer learning."
        },
        {
            "title": "Winter Clothing Drive",
            "date": "Dec 10, 2025",
            "location": "Toronto community centre",
            "participants": "Community members, 25 youth, Aisha, Daniel",
            "summary": "A winter clothing drive was held to support community members during the colder months. Youth assisted with collecting, sorting, and organizing donated items such as jackets, hats, and gloves. The event helped youth develop a sense of responsibility and community involvement."
        },
        {
            "title": "Youth Leadership Workshop",
            "date": "Jan 18, 2026",
            "location": "BCYI building",
            "participants": "20 youth, Program Coordinator, Guest Speaker",
            "summary": "A leadership workshop was facilitated to help youth build confidence and communication skills. Activities included group discussions, role-playing scenarios, and goal-setting exercises. Youth were encouraged to reflect on their strengths and how they can take on leadership roles within their community."
        }
    ],

    "example_output": """
The examples below represent the tone, quality, and structure to emulate. Do NOT copy phrasing; match the style, pacing, and level of professionalism.

=== INSTAGRAM POST ===

🏀 GAME DAY ENERGY! 🏀

Last weekend, 50+ youth brought their A-game to our Winter Basketball Tournament. The competition was fierce, the sportsmanship was incredible, and the community vibes were unmatched! 💙

Huge congrats to the Storm Squad for taking home the championship trophy! 🏆

But the real win? Watching our young athletes support each other, push their limits, and shine both on and off the court.

This is what community looks like. This is BCYI. 💪

📸 Swipe to see the highlights! ➡️

What's your favorite part of game day? Drop a ⛹️ in the comments!

#BCYI #YouthEmpowerment #BasketballCommunity #BlackCreek #YorkU #YouthSports #CommunityStrong #TorontoYouth #Inspiration #TeamWork

---

VISUAL SUGGESTION: Carousel post with action shots, championship team, crowd, and group photo.

---

=== TWITTER/X POST ===

🏀 50+ youth. One tournament. Countless moments of excellence.

Our Winter Basketball Tournament reminded us why we do this work: watching young people discover their strength, support their peers, and shine.

Congrats to all who played! 🏆💙

#BCYI #YouthEmpowerment

---

=== LINKEDIN POST ===

Proud to share highlights from Black Creek Youth Initiative's Winter Basketball Tournament. 🏀

Over 50 youth participated in this annual event, which exemplifies our holistic approach to youth development—combining athletics, mentorship, and community building.

Key outcomes:
• Youth leadership development through team coordination
• Mentorship from York University student volunteers
• Community engagement and family participation
• Safe, positive space for skill-building and connection

Our partnership with York University enables university students to mentor community youth, creating a cycle of empowerment that benefits both groups.

Programs like these demonstrate the tangible impact of investing in youth development and community partnerships.

Thank you to our supporters, volunteers, and the incredible young people who continue to inspire us.

Learn more about BCYI's programs: [website link]

#YouthDevelopment #CommunityImpact #NonProfit #Mentorship #YorkUniversity #YouthEmpowerment #SocialImpact

---

=== TIKTOK / SHORT-FORM ===

PLATFORM RULES (TikTok/Instagram Reels):
- Strong hook in first 1–2 lines
- Conversational but intentional
- Emojis allowed if purposeful
- Line breaks encouraged
- Length: 80–150 words
- End with an engagement prompt (question or CTA)
---
""",
}
