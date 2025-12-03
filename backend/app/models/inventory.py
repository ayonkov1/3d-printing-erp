from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import uuid


class Inventory(Base):
    __tablename__ = "inventory"

    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Foreign key to spool catalog
    spool_id = Column(String, ForeignKey("spools.id"), nullable=False)

    # Instance-specific data
    weight = Column(Float, nullable=False)  # Current weight (decreases as used)
    is_in_use = Column(Boolean, default=False)  # Is it loaded in a printer?
    custom_properties = Column(String, nullable=True)  # Per-item notes

    # Status FK
    status_id = Column(String, ForeignKey("statuses.id"), nullable=False)

    # Relationships (eager loading)
    spool = relationship("Spool", lazy="joined")
    status = relationship("Status", lazy="joined")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Inventory(spool_id='{self.spool_id}', weight={self.weight}, status={self.status.name})>"
