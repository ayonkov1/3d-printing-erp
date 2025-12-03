from sqlalchemy import Column, String, DateTime
from datetime import datetime
from app.database import Base
import uuid


class Status(Base):
    __tablename__ = "statuses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
