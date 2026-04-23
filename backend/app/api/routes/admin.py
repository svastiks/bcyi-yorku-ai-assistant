"""Ops-only routes (guarded by env secrets)."""
from hmac import compare_digest

from fastapi import APIRouter, HTTPException, Request

from app.config import settings
from app.rate_limit import limiter

router = APIRouter()


def _not_found() -> None:
    """Same response for missing config and bad token (avoid probing)."""
    raise HTTPException(status_code=404, detail="Not found")


@router.post("/reset-rate-limits")
@limiter.exempt
async def reset_rate_limits(request: Request) -> dict:
    """
    Clear in-memory slowapi counters for this process (shared-NAT users get a fresh bucket).

    Set ``RATE_LIMIT_RESET_SECRET`` in the environment, then call with either:
    - Query: ``POST /api/admin/reset-rate-limits?token=<secret>``
    - Header: ``X-Rate-Limit-Reset-Token: <secret>``

    Restarting the Render web service clears counters as well.
    """
    expected = (settings.rate_limit_reset_secret or "").strip()
    if not expected:
        _not_found()
    provided = (
        request.query_params.get("token")
        or request.headers.get("X-Rate-Limit-Reset-Token")
        or ""
    ).strip()
    if len(provided) != len(expected):
        _not_found()
    if not compare_digest(provided, expected):
        _not_found()
    limiter.reset()
    return {
        "ok": True,
        "message": "Rate limit counters cleared for this server instance.",
    }
