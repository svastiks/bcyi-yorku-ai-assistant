"""Content generation templates"""
from app.templates.newsletter import NEWSLETTER_TEMPLATE
from app.templates.blog_post import BLOG_POST_TEMPLATE
from app.templates.donor_email import DONOR_EMAIL_TEMPLATE
from app.templates.social_media import SOCIAL_MEDIA_TEMPLATE
from app.templates.general import GENERAL_TEMPLATE

# Template registry
TEMPLATES = {
    'newsletter': NEWSLETTER_TEMPLATE,
    'blog_post': BLOG_POST_TEMPLATE,
    'donor_email': DONOR_EMAIL_TEMPLATE,
    'social_media': SOCIAL_MEDIA_TEMPLATE,
    'general': GENERAL_TEMPLATE,
}


def get_template(content_type: str):
    """Get template by content type"""
    return TEMPLATES.get(content_type, GENERAL_TEMPLATE)


__all__ = [
    "NEWSLETTER_TEMPLATE",
    "BLOG_POST_TEMPLATE",
    "DONOR_EMAIL_TEMPLATE",
    "SOCIAL_MEDIA_TEMPLATE",
    "GENERAL_TEMPLATE",
    "TEMPLATES",
    "get_template",
]
