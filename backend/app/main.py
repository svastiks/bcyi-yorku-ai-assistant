"""FastAPI application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.api.routes import chat, content, drive
from app.database.mongodb import MongoDB


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("Starting up BCYI AI Assistant API...")
    await MongoDB.connect()
    yield
    # Shutdown
    print("Shutting down BCYI AI Assistant API...")
    await MongoDB.close()


# Create FastAPI app
app = FastAPI(
    title="BCYI x YorkU AI Assistant API",
    description="AI-powered content generation for Black Creek Youth Initiative",
    version="0.1.0",
    debug=settings.debug,
    lifespan=lifespan
)

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


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "BCYI x YorkU AI Assistant API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
