"""Content generation API endpoints"""
from fastapi import APIRouter, HTTPException
from app.models.content import ContentType
from app.templates import TEMPLATES
from typing import List, Dict

router = APIRouter()


@router.get("/types", response_model=List[Dict])
async def get_content_types():
    """Get available content types"""
    try:
        content_types = []
        
        for content_type, template in TEMPLATES.items():
            content_types.append({
                "id": content_type,
                "name": template.get('name', content_type),
                "description": template.get('description', ''),
                "icon": _get_icon_for_type(content_type)
            })
        
        return content_types
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get content types: {str(e)}")


@router.get("/types/{content_type}", response_model=Dict)
async def get_content_type_details(content_type: str):
    """Get details for a specific content type"""
    try:
        if content_type not in TEMPLATES:
            raise HTTPException(status_code=404, detail="Content type not found")
        
        template = TEMPLATES[content_type]
        
        return {
            "id": content_type,
            "name": template.get('name', content_type),
            "description": template.get('description', ''),
            "structure": template.get('structure', {}),
            "example": template.get('example_output', ''),
            "icon": _get_icon_for_type(content_type)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get content type: {str(e)}")


def _get_icon_for_type(content_type: str) -> str:
    """Get emoji icon for content type"""
    icons = {
        'newsletter': '📧',
        'blog_post': '✍️',
        'donor_email': '💝',
        'social_media': '📱',
        'general': '💬'
    }
    return icons.get(content_type, '📄')
