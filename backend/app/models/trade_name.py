from sqlalchemy import Column, String, DateTime
from datetime import datetime
from app.database import Base
import uuid


class TradeName(Base):
    __tablename__ = "trade_names"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
