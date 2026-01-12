from sqlalchemy import Column, String, DateTime, Boolean, Enum as SQLEnum
from datetime import datetime
from app.database import Base
import uuid
import enum


class UserRole(str, enum.Enum):
    """
    User roles for RBAC authorization.
    
    - ADMIN: Full access to all resources and settings
    - MANAGER: Can manage users and resources
    - USER: Can read/write inventory and catalog items
    - VIEWER: Read-only access to inventory and catalog
    """
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    USER = "USER"
    VIEWER = "VIEWER"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(
        SQLEnum(UserRole, native_enum=False, length=20),
        nullable=False,
        default=UserRole.USER,
        index=True
    )
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
