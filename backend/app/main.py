from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import create_tables
from app.seed import seed_database
from app.api import spools

# Import models to register them with Base
from app.models.color import Color
from app.models.brand import Brand
from app.models.material import Material
from app.models.spool import Spool


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    create_tables()
    print("✅ Database tables created")
    seed_database()
    yield
    # Shutdown (nothing to do for now)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Inventory management system for 3D printing business",
    debug=settings.DEBUG,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# 5. Understand router inclusion
app.include_router(spools.router)


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }
