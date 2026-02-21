"""Blog post content template"""

BLOG_POST_TEMPLATE = {
    "content_type": "blog_post",
    "name": "Blog Post",
    "description": "Write impactful stories",
    
    "system_prompt": """You are a thoughtful writer and communicator for Black Creek Youth Initiative (BCYI), a non-profit organization partnering with York University to empower youth through education, sports, and community programs.

GOAL: Inform, reflect, and position BCYI as a thoughtful and impact-driven organization.

INSTRUCTIONS:
- When reference blog posts are provided in context, mirror their pacing and depth — match the style without copying phrasing or structure exactly
- Blend narrative moments with insight or reflection; do not write purely informational or purely emotional content
- Maintain clarity and accessibility — avoid academic jargon, write for a community, partner, and donor audience
- Center real people, real outcomes, and specific program details
- Each section should earn its place: no filler, no generic statements about youth empowerment without specifics

OUTPUT REQUIREMENTS:
- Title (clear, specific, not generic)
- Introduction with a clear hook that draws the reader in
- 2–4 short body sections with subheadings
- Closing paragraph that reinforces BCYI's purpose and leaves the reader with something to carry
- Length: 600–900 words

VOICE:
Act like a mission-driven non-profit communicator. Balance empathy and evidence. Write as someone who genuinely knows this community — not an outside observer describing it.""",

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
    
    "example_output": """# From the Court to the Classroom: How Basketball Changed Everything

*A story about community, mentorship, and finding your path*

Three years ago, Marcus walked into the BCYI gymnasium for the first time. At 14, he was struggling in school, disconnected from his community, and unsure about his future. Today, at 17, he's a youth mentor, a straight-A student, and heading to York University on a scholarship.

His journey wasn't just about basketball—it was about finding a community that believed in him.

## The Beginning

"I only came because my mom made me," Marcus admits with a laugh. "I thought it would be boring. I was wrong."

That first day at BCYI's after-school basketball program, Marcus met Coach James, a York University student volunteer who would become his mentor. But more importantly, he found a space where showing up mattered, where effort was celebrated, and where someone noticed when you weren't there.

## More Than a Game

BCYI's programs are deliberately designed to extend beyond the activity itself. Basketball practice includes:
- Academic check-ins and homework support
- Life skills workshops on communication and goal-setting
- Mentorship from university student volunteers
- Leadership opportunities for older youth

For Marcus, these elements combined to create something transformative. "Coach James would always ask about school first, basketball second," he explains. "It made me realize that people cared about my whole future, not just whether I could make a shot."

## The Turning Point

During Marcus's second year in the program, his grades were slipping. Instead of criticism, he found support. BCYI connected him with tutoring, and Coach James helped him create a study schedule that worked with basketball practice.

"That's when I learned that struggling doesn't mean failing," Marcus says. "It means you need a better game plan."

His grades improved. His confidence grew. And something unexpected happened—Marcus started mentoring younger kids in the program.

## Paying It Forward

Now a senior youth mentor at BCYI, Marcus spends three afternoons a week helping younger students with homework and running basketball drills. He's living proof of the program's impact and the power of youth leadership.

"These kids remind me of me," he shares. "I want them to know what's possible. I want to be their Coach James."

## The Bigger Picture

Marcus's story is one of many at BCYI, but it illustrates a crucial truth: youth need more than programs—they need community, consistency, and people who see their potential.

The partnership between BCYI and York University creates a unique ecosystem where university students mentor community youth, who then become mentors themselves. It's a cycle of empowerment that ripples through the Black Creek community.

## Looking Ahead

This fall, Marcus will begin his studies at York University, majoring in Education. His goal? To become a teacher and coach, bringing the lessons he learned at BCYI to even more young people.

"BCYI gave me a second chance," Marcus reflects. "Now I want to spend my life giving that to others."

---

*Stories like Marcus's are possible because of community support. Learn more about how you can get involved at Black Creek Youth Initiative.*

**Tags:** Youth Empowerment, Mentorship, Basketball, Education, Community Impact"""
}
