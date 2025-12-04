import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.core.dependencies import get_db

# Import models to register them with Base
from app.models.color import Color
from app.models.brand import Brand
from app.models.material import Material
from app.models.spool import Spool
from app.models.inventory import Inventory
from app.models.status import Status
from app.models.category import Category
from app.models.trade_name import TradeName

# Test database (PostgreSQL test database)
SQLALCHEMY_TEST_DATABASE_URL = (
    # TODO: 4. Use a separate test database
    "postgresql://erp_user:erp_password@localhost:5432/erp_db"
)

engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create tables once for all tests at session start, drop at session end"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create fresh database session for each test and clean data after"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Clean all data but keep tables
        db = TestingSessionLocal()
        try:
            for table in reversed(Base.metadata.sorted_tables):
                db.execute(table.delete())
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()


@pytest.fixture
def color_repository(db):
    """Fixture that provides ColorRepository"""
    from app.repositories.color_repository import ColorRepository

    return ColorRepository(db)


@pytest.fixture
def color_service(color_repository):
    """Fixture that provides ColorService"""
    from app.services.color_service import ColorService

    return ColorService(color_repository)


@pytest.fixture
def brand_service(db):
    """Fixture that provides BrandService"""
    from app.repositories.brand_repository import BrandRepository
    from app.services.brand_service import BrandService

    brand_repo = BrandRepository(db)
    return BrandService(brand_repo)


@pytest.fixture
def material_service(db):
    """Fixture that provides MaterialService"""
    from app.repositories.material_repository import MaterialRepository
    from app.services.material_service import MaterialService

    material_repo = MaterialRepository(db)
    return MaterialService(material_repo)


@pytest.fixture
def trade_name_service(db):
    """Fixture that provides TradeNameService"""
    from app.repositories.trade_name_repository import TradeNameRepository
    from app.services.trade_name_service import TradeNameService

    trade_name_repo = TradeNameRepository(db)
    return TradeNameService(trade_name_repo)


@pytest.fixture
def category_service(db):
    """Fixture that provides CategoryService"""
    from app.repositories.category_repository import CategoryRepository
    from app.services.category_service import CategoryService

    category_repo = CategoryRepository(db)
    return CategoryService(category_repo)


@pytest.fixture
def status_service(db):
    """Fixture that provides StatusService"""
    from app.repositories.status_repository import StatusRepository
    from app.services.status_service import StatusService

    status_repo = StatusRepository(db)
    return StatusService(status_repo)


@pytest.fixture
def spool_service(db, color_service, material_service, brand_service, trade_name_service, category_service):
    """Fixture that provides SpoolService with all dependencies"""
    from app.repositories.spool_repository import SpoolRepository
    from app.services.spool_service import SpoolService

    spool_repo = SpoolRepository(db)

    return SpoolService(
        spool_repo, 
        color_service, 
        material_service, 
        brand_service,
        trade_name_service,
        category_service
    )


@pytest.fixture
def inventory_service(db, spool_service, status_service):
    """Fixture that provides InventoryService with all dependencies"""
    from app.repositories.inventory_repository import InventoryRepository
    from app.repositories.spool_repository import SpoolRepository
    from app.services.inventory_service import InventoryService

    inventory_repo = InventoryRepository(db)
    spool_repo = SpoolRepository(db)

    return InventoryService(inventory_repo, spool_repo, status_service)
