from sqlalchemy import Column, String, DateTime
from datetime import datetime
from app.database import Base
import uuid


class Color(Base):
    __tablename__ = "colors"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    name = Column(String(100), unique=True, nullable=False)
    hex_code = Column(String(7), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return (
            f"<Color(id={self.id[:8]}..., name='{self.name}', hex='{self.hex_code}')>"
        )
