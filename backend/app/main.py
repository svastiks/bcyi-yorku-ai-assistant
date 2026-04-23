"""FastAPI application entry point"""
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler
from contextlib import asynccontextmanager
from app.config import settings
from app.api.routes import admin, chat, content, drive
from app.rate_limit import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("Starting up AI Content Assistant API...")
    print(
        "Rate limits (env override): "
        f"chat_message={settings.rate_limit_chat_message!r} "
        f"chat_create={settings.rate_limit_chat_create!r} "
        f"drive_sync={settings.rate_limit_drive_sync!r} "
        f"drive_sort={settings.rate_limit_drive_sort!r}"
    )
    if settings.rate_limit_reset_secret:
        print("Rate limit reset endpoint: enabled (POST /api/admin/reset-rate-limits)")
    yield
    # Shutdown
    print("Shutting down AI Content Assistant API...")


# Create FastAPI app
app = FastAPI(
    title="AI Content Assistant API",
    description="AI-powered content generation for newsletters, blog posts, donor emails, and social media",
    version="0.1.0",
    debug=settings.debug,
    lifespan=lifespan
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(content.router, prefix="/api/content", tags=["content"])
app.include_router(drive.router, prefix="/api/drive", tags=["drive"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "AI Content Assistant API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/auth/callback")
async def auth_callback_legacy(request: Request):
    """Legacy redirect: /auth/callback -> /api/drive/auth/callback (same query params)."""
    base = f"{request.url.scheme}://{request.url.netloc}"
    path = "/api/drive/auth/callback"
    q = str(request.url.query)
    return RedirectResponse(url=f"{base}{path}?{q}" if q else f"{base}{path}")
