from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.repositories.color_repository import ColorRepository

from app.repositories.brand_repository import BrandRepository
from app.repositories.material_repository import MaterialRepository
from app.repositories.spool_repository import SpoolRepository
from app.services.color_service import ColorService

from app.services.brand_service import BrandService
from app.services.material_service import MaterialService
from app.services.spool_service import SpoolService


# Database session dependency
def get_db() -> Generator[Session, None, None]:
    """Dependency that provides database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Repository dependencies
def get_color_repository(db: Session = Depends(get_db)) -> ColorRepository:
    """Dependency that provides ColorRepository"""
    return ColorRepository(db)


def get_spool_repository(db: Session = Depends(get_db)) -> SpoolRepository:
    return SpoolRepository(db)


def get_brand_repository(db: Session = Depends(get_db)) -> BrandRepository:
    """Dependency that provides BrandRepository"""
    return BrandRepository(db)


def get_material_repository(db: Session = Depends(get_db)) -> MaterialRepository:
    """Dependency that provides MaterialRepository"""
    return MaterialRepository(db)


# Service dependencies
def get_color_service(
    color_repo: ColorRepository = Depends(get_color_repository),
) -> ColorService:
    """Dependency that provides ColorService"""
    return ColorService(color_repo)


def get_brand_service(
    brand_repo: BrandRepository = Depends(get_brand_repository),
) -> BrandService:
    """Dependency that provides BrandService"""
    return BrandService(brand_repo)


def get_material_service(
    material_repo: MaterialRepository = Depends(get_material_repository),
) -> MaterialService:
    """Dependency that provides MaterialService"""
    return MaterialService(material_repo)


def get_spool_service(
    spool_repo: SpoolRepository = Depends(get_spool_repository),
    color_service: ColorService = Depends(get_color_service),
    brand_service: BrandService = Depends(get_brand_repository),
    material_service: MaterialService = Depends(get_material_repository),
) -> SpoolService:
    """
    Dependency that provides SpoolService with all its dependencies.

    This is where the magic happens - FastAPI automatically resolves
    the entire dependency tree!
    """
    return SpoolService(spool_repo, color_service, brand_service, material_service)
