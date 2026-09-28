import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.database import engine, Base
from app.db.schema_helper import upgrade_user_columns
import app.db.models  # Ensures models are imported for metadata creation
from app.routers import health, auth, users, skills, evidence, discover, requests, exchanges

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skillloop.main")

# Ensure uploads directory structure exists
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(os.path.join(UPLOADS_DIR, "avatars"), exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for table creation on startup."""
    logger.info("Initializing SkillLoop Database Tables...")
    try:
        Base.metadata.create_all(bind=engine)
        upgrade_user_columns(engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
    yield
    logger.info("SkillLoop API shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Campus Skill-Exchange Platform API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(health.router)  # Also expose /health at root level for flexibility
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(skills.router, prefix=settings.API_V1_STR)
app.include_router(evidence.router, prefix=settings.API_V1_STR)
app.include_router(discover.router, prefix=settings.API_V1_STR)
app.include_router(requests.router, prefix=settings.API_V1_STR)
app.include_router(exchanges.router, prefix=settings.API_V1_STR)

# Mount uploads directory for user avatars and media
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/")
def root():
    return {
        "message": "Welcome to Synapse Campus Skill-Exchange Platform API",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
        "version": settings.VERSION,
    }
