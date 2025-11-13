from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import uuid


class Spool(Base):
    __tablename__ = "spools"

    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Spool data
    barcode = Column(String(100), unique=True, nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    is_box = Column(Boolean, default=False)
    weight = Column(Float, nullable=False)
    thickness = Column(Float, nullable=True)
    spool_return = Column(Boolean, default=False)
    is_in_use = Column(Boolean, default=False)
    status = Column(
        String(50), default="in_stock"
    )  # in_stock, in_use, depleted, ordered
    custom_properties = Column(String, nullable=True)

    # Foreign keys
    material_id = Column(String, ForeignKey("materials.id"), nullable=False)
    brand_id = Column(String, ForeignKey("brands.id"), nullable=False)
    color_id = Column(String, ForeignKey("colors.id"), nullable=False)

    # Relationships (eager loading for GET requests)
    material = relationship("Material", lazy="joined")
    brand = relationship("Brand", lazy="joined")
    color = relationship("Color", lazy="joined")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Spool(barcode='{self.barcode}', material={self.material.name})>"
