from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import create_tables
from app.seed import seed_database
from app.api import spools
from app.api import materials
from app.api import brands
from app.api import colors
from app.api import trade_names
from app.api import categories
from app.api import statuses
from app.api import inventory
from app.api import auth
from app.api import users
from app.api import dashboard

# Import models to register them with Base
from app.models.color import Color
from app.models.brand import Brand
from app.models.material import Material
from app.models.spool import Spool
from app.models.trade_name import TradeName
from app.models.category import Category
from app.models.status import Status
from app.models.inventory import Inventory
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.models.job import Job
from app.models.insight import Insight

# Import worker and scheduler
from app.services.job_worker import job_worker
from app.services.scheduler import setup_scheduler, shutdown_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    create_tables()
    print("✅ Database tables created")
    seed_database()

    # Start background worker and scheduler
    job_worker.start()
    print("✅ Job worker started")
    setup_scheduler()
    print("✅ Scheduler started (daily insights at 6:00 AM)")

    yield

    # Shutdown
    job_worker.stop()
    shutdown_scheduler()
    print("✅ Background services stopped")


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
app.include_router(spools.router)
app.include_router(materials.router)
app.include_router(brands.router)
app.include_router(colors.router)
app.include_router(trade_names.router)
app.include_router(categories.router)
app.include_router(statuses.router)
app.include_router(inventory.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(dashboard.router)


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }
