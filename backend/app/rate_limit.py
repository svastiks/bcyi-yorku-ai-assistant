"""Shared SlowAPI limiter (per real client IP behind proxies)."""
from fastapi import Request
from slowapi import Limiter


def get_real_ip(request: Request) -> str:
    """Prefer X-Forwarded-For when running behind Render / other reverse proxies."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


limiter = Limiter(key_func=get_real_ip, headers_enabled=True)
