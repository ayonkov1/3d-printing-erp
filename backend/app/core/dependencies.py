from typing import Generator, Callable
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
from app.repositories.activity_log_repository import ActivityLogRepository
from app.repositories.job_repository import JobRepository
from app.repositories.insight_repository import InsightRepository

from app.services.color_service import ColorService
from app.services.brand_service import BrandService
from app.services.material_service import MaterialService
from app.services.spool_service import SpoolService
from app.services.trade_name_service import TradeNameService
from app.services.category_service import CategoryService
from app.services.status_service import StatusService
from app.services.inventory_service import InventoryService
from app.services.activity_log_service import ActivityLogService
from app.services.ai_insights_service import AIInsightsService
from app.services.dashboard_service import DashboardService

# Import authorization components
from app.core.authorization import Action, authorize
from app.models.user import User


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


def get_activity_log_repository(db: Session = Depends(get_db)) -> ActivityLogRepository:
    """Dependency that provides ActivityLogRepository"""
    return ActivityLogRepository(db)


def get_job_repository(db: Session = Depends(get_db)) -> JobRepository:
    """Dependency that provides JobRepository"""
    return JobRepository(db)


def get_insight_repository(db: Session = Depends(get_db)) -> InsightRepository:
    """Dependency that provides InsightRepository"""
    return InsightRepository(db)


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


def get_activity_log_service(
    activity_log_repo: ActivityLogRepository = Depends(get_activity_log_repository),
) -> ActivityLogService:
    """Dependency that provides ActivityLogService"""
    return ActivityLogService(activity_log_repo)


def get_spool_service(
    spool_repo: SpoolRepository = Depends(get_spool_repository),
    color_service: ColorService = Depends(get_color_service),
    brand_service: BrandService = Depends(get_brand_service),
    material_service: MaterialService = Depends(get_material_service),
    trade_name_service: TradeNameService = Depends(get_trade_name_service),
    category_service: CategoryService = Depends(get_category_service),
    activity_log_service: ActivityLogService = Depends(get_activity_log_service),
) -> SpoolService:
    """Dependency that provides SpoolService with all its dependencies."""
    return SpoolService(
        spool_repo,
        color_service,
        brand_service,
        material_service,
        trade_name_service,
        category_service,
        activity_log_service,
    )


def get_inventory_service(
    inventory_repo: InventoryRepository = Depends(get_inventory_repository),
    spool_repo: SpoolRepository = Depends(get_spool_repository),
    status_service: StatusService = Depends(get_status_service),
    activity_log_service: ActivityLogService = Depends(get_activity_log_service),
) -> InventoryService:
    """Dependency that provides InventoryService with all its dependencies."""
    return InventoryService(
        inventory_repo, spool_repo, status_service, activity_log_service
    )


def get_ai_insights_service(
    activity_log_repo: ActivityLogRepository = Depends(get_activity_log_repository),
    insight_repo: InsightRepository = Depends(get_insight_repository),
    job_repo: JobRepository = Depends(get_job_repository),
    inventory_repo: InventoryRepository = Depends(get_inventory_repository),
) -> AIInsightsService:
    """Dependency that provides AIInsightsService"""
    return AIInsightsService(
        activity_log_repo=activity_log_repo,
        insight_repo=insight_repo,
        job_repo=job_repo,
        inventory_repo=inventory_repo,
    )


def get_dashboard_service(
    inventory_repo: InventoryRepository = Depends(get_inventory_repository),
    activity_log_repo: ActivityLogRepository = Depends(get_activity_log_repository),
    insight_repo: InsightRepository = Depends(get_insight_repository),
    job_repo: JobRepository = Depends(get_job_repository),
) -> DashboardService:
    """Dependency that provides DashboardService"""
    return DashboardService(
        inventory_repo=inventory_repo,
        activity_log_repo=activity_log_repo,
        insight_repo=insight_repo,
        job_repo=job_repo,
    )


# =============================================================================
# Authorization Dependencies
# =============================================================================
# These provide a clean, declarative way to enforce authorization in endpoints.
# Import get_current_user here to avoid circular imports in endpoints.


def get_current_user_dependency():
    """
    Lazy import to avoid circular dependency.
    Returns the get_current_user function from auth_service.
    """
    from app.services.auth_service import get_current_user

    return get_current_user


def require_action(action: Action) -> Callable:
    """
    Factory that creates a dependency requiring a specific action.

    Usage:
        @router.post("/items")
        async def create_item(
            user: User = Depends(require_action(Action.WRITE_INVENTORY))
        ):
            # User is guaranteed to have WRITE_INVENTORY permission
            ...

    This pattern keeps authorization:
    - Declarative (you see what's required in the signature)
    - Centralized (policy is in authorization.py)
    - Auditable (all checks are logged)
    """
    from app.services.auth_service import get_current_user

    async def dependency(user: User = Depends(get_current_user)) -> User:
        authorize(user, action)
        return user

    return dependency


def require_read_inventory() -> Callable:
    """Dependency that requires read:inventory permission."""
    return require_action(Action.READ_INVENTORY)


def require_write_inventory() -> Callable:
    """Dependency that requires write:inventory permission."""
    return require_action(Action.WRITE_INVENTORY)


def require_delete_inventory() -> Callable:
    """Dependency that requires delete:inventory permission."""
    return require_action(Action.DELETE_INVENTORY)


def require_read_catalog() -> Callable:
    """Dependency that requires read:catalog permission."""
    return require_action(Action.READ_CATALOG)


def require_write_catalog() -> Callable:
    """Dependency that requires write:catalog permission."""
    return require_action(Action.WRITE_CATALOG)


def require_delete_catalog() -> Callable:
    """Dependency that requires delete:catalog permission."""
    return require_action(Action.DELETE_CATALOG)


def require_admin() -> Callable:
    """Dependency that requires admin role (via manage:settings permission)."""
    return require_action(Action.MANAGE_SETTINGS)
