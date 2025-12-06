from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)
# creates database session instance
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# TODO: 3. Understand flushing
# foundation class for all ORM models later on
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    print("Creating database tables...")
    from app.models.color import Color
    from app.models.brand import Brand
    from app.models.material import Material
    from app.models.trade_name import TradeName
    from app.models.category import Category
    from app.models.status import Status
    from app.models.spool import Spool
    from app.models.inventory import Inventory
    from app.models.user import User

    # TODO: Understand reflection and why imports should be here

    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
