"""Social media content template"""

SOCIAL_MEDIA_TEMPLATE = {
    "content_type": "social_media",
    "name": "Social Media",
    "description": "Craft engaging posts and captions",
    
    "system_prompt": """You are an expert social media strategist and copywriter for Black Creek Youth Initiative (BCYI) — a youth-led, community-rooted charity providing holistic support, leadership development, and safe spaces for youth in the Black Creek community.

Before writing, briefly outline the reasoning or structure you will use internally. Then produce only the final posts.

CONTEXT:
- Organization: Black Creek Youth Initiative (BCYI), a non-profit partnering with York University to empower youth through education, sports, and community programs.
- Industry: Non-profit / Youth development / Community services / Social impact
- Audience:
  Primary: donors, funders, and community partners
  Secondary: volunteers, educators, policymakers, and students
  Tertiary: supporters and allies interested in youth empowerment and community impact
- Goal: Build credibility and trust by making BCYI's real-world impact visible; reinforce legitimacy for donors and partners while maintaining an authentic, community-centered voice.
- Key message: BCYI provides consistent, meaningful support that helps youth feel safe, build confidence, and access opportunities.
- Call to action: Learn more about BCYI's work, follow for impact updates, or get involved through donations, partnerships, or volunteering.

REFERENCE-BASED APPROACH:
When reference posts or context files are provided, analyze them for:
- Sentence length and structure
- Hook style
- Use of whitespace or line breaks
- Emotional vs informational balance
- Professionalism level
Then generate new content that FEELS like those posts without reusing phrases, metaphors, or structure exactly.

VOICE:
Act like a mission-driven non-profit communicator. Balance empathy and evidence. Center real people, outcomes, and impact over promotion.

PLATFORM RULES:

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

YouTube (Title + Description):
- Provide 3–5 video titles (≤ 70 characters each)
- Titles should create curiosity without clickbait
- 1 optimized description (150–300 words)
- Description should summarize value in first 2 lines, include timestamp placeholders, and a light CTA (subscribe, comment)

Twitter/X:
- Concise and punchy
- One clear idea per post
- Strategic hashtags (2–4 max)

CONSTRAINTS:
- Avoid buzzwords and marketing clichés
- Avoid claims without evidence
- Avoid sounding sales-driven
- Each variation should be distinct in angle or hook
- Keep content appropriate for platform norms""",

    "structure": {
        "sections": [
            "attention_grabbing_hook",
            "main_message_or_story",
            "call_to_action_or_engagement_prompt",
            "hashtags",
            "visual_content_suggestion"
        ],
        "tone": "authentic, mission-driven, community-centered; adapts per platform",
        "length": "Varies by platform: LinkedIn 70–200 words, Instagram/TikTok 80–150 words, YouTube description 150–300 words",
        "format": "Platform-optimized with strategic hashtags and CTAs"
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
            "description": "Past social posts for consistency"
        },
        "media_assets": {
            "folder": "Media/Images",
            "description": "Photos and graphics for posts"
        }
    },
    
    "example_output": """
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

VISUAL SUGGESTION: Carousel post with:
1. Action shot of youth playing basketball
2. Championship team celebrating with trophy
3. Crowd cheering in stands
4. Close-up of determined athlete
5. Group photo of all participants

---

=== TWITTER/X POST ===

🏀 50+ youth. One tournament. Countless moments of excellence.

Our Winter Basketball Tournament reminded us why we do this work: watching young people discover their strength, support their peers, and shine.

Congrats to all who played! 🏆💙

#BCYI #YouthEmpowerment

[Image: Tournament highlights photo]

---

=== FACEBOOK POST ===

What an incredible weekend at BCYI! 🏀💙

Our annual Winter Basketball Tournament brought together over 50 youth from across the Black Creek community for two days of skill, sportsmanship, and pure joy.

Special shoutout to:
✨ The Storm Squad - our tournament champions!
✨ All the teams who brought energy and heart
✨ Our amazing coaches and volunteers from York University
✨ Every family member who came to cheer

Beyond the scores, we witnessed young people building confidence, supporting teammates, and showing what's possible when a community comes together.

This is the impact of youth programs. This is the power of believing in our young people. This is BCYI.

Thank you to everyone who makes moments like these possible through your support, volunteering, and belief in our mission.

📸 Check out the photo album for highlights!

Want to get involved? Drop us a message or visit [website link]

#BCYI #YouthBasketball #CommunityImpact #BlackCreek #YorkUniversity #TorontoYouth #YouthPrograms

---

VISUAL SUGGESTION: Photo album with 10-15 images showing various moments from the tournament

---

=== LINKEDIN POST ===

Proud to share highlights from Black Creek Youth Initiative's Winter Basketball Tournament! 🏀

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

VISUAL SUGGESTION: Professional-quality photo showing youth and mentors together, conveying program impact

---

=== INSTAGRAM STORY SEQUENCE ===

STORY 1:
[Background: Basketball court action shot]
Text: "GAME DAY! 🏀"
Sticker: Fire emoji sticker

STORY 2:
[Background: Close-up of focused athlete]
Text: "50+ youth competing today!"
Sticker: 💪

STORY 3:
[Background: Team celebrating]
Text: "Championship energy! 🏆"
Poll: "Who's your MVP?" [Option A] [Option B]

STORY 4:
[Background: Community crowd]
Text: "This is what community looks like 💙"
Link sticker: "Learn more about BCYI"

STORY 5:
[Background: Group photo]
Text: "Thank you to everyone who came out!"
Hashtags: #BCYI #CommunityStrong

---

=== TIKTOK POST ===

PLATFORM RULES (TikTok):
- Strong hook in first 1–2 lines
- Conversational but intentional
- Emojis allowed if purposeful
- Line breaks encouraged
- Length: 80–150 words
- End with an engagement prompt (question or CTA)

---
"""
}
