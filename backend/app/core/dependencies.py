from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.repositories.color_repository import ColorRepository
from app.repositories.brand_repository import BrandRepository
from app.repositories.material_repository import MaterialRepository
from app.repositories.spool_repository import SpoolRepository
from app.repositories.trade_name_repository import TradeNameRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.status_repository import StatusRepository
from app.repositories.inventory_repository import InventoryRepository

from app.services.color_service import ColorService
from app.services.brand_service import BrandService
from app.services.material_service import MaterialService
from app.services.spool_service import SpoolService
from app.services.trade_name_service import TradeNameService
from app.services.category_service import CategoryService
from app.services.status_service import StatusService
from app.services.inventory_service import InventoryService


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


def get_trade_name_repository(db: Session = Depends(get_db)) -> TradeNameRepository:
    """Dependency that provides TradeNameRepository"""
    return TradeNameRepository(db)


def get_category_repository(db: Session = Depends(get_db)) -> CategoryRepository:
    """Dependency that provides CategoryRepository"""
    return CategoryRepository(db)


def get_status_repository(db: Session = Depends(get_db)) -> StatusRepository:
    """Dependency that provides StatusRepository"""
    return StatusRepository(db)


def get_inventory_repository(db: Session = Depends(get_db)) -> InventoryRepository:
    """Dependency that provides InventoryRepository"""
    return InventoryRepository(db)


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


def get_trade_name_service(
    trade_name_repo: TradeNameRepository = Depends(get_trade_name_repository),
) -> TradeNameService:
    """Dependency that provides TradeNameService"""
    return TradeNameService(trade_name_repo)


def get_category_service(
    category_repo: CategoryRepository = Depends(get_category_repository),
) -> CategoryService:
    """Dependency that provides CategoryService"""
    return CategoryService(category_repo)


def get_status_service(
    status_repo: StatusRepository = Depends(get_status_repository),
) -> StatusService:
    """Dependency that provides StatusService"""
    return StatusService(status_repo)


def get_spool_service(
    spool_repo: SpoolRepository = Depends(get_spool_repository),
    color_service: ColorService = Depends(get_color_service),
    brand_service: BrandService = Depends(get_brand_service),
    material_service: MaterialService = Depends(get_material_service),
    trade_name_service: TradeNameService = Depends(get_trade_name_service),
    category_service: CategoryService = Depends(get_category_service),
) -> SpoolService:
    """Dependency that provides SpoolService with all its dependencies."""
    return SpoolService(
        spool_repo,
        color_service,
        brand_service,
        material_service,
        trade_name_service,
        category_service,
    )


def get_inventory_service(
    inventory_repo: InventoryRepository = Depends(get_inventory_repository),
    spool_repo: SpoolRepository = Depends(get_spool_repository),
    status_service: StatusService = Depends(get_status_service),
) -> InventoryService:
    """Dependency that provides InventoryService with all its dependencies."""
    return InventoryService(inventory_repo, spool_repo, status_service)
