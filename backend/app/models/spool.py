from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import uuid


class Spool(Base):
    """
    Spool catalog/archetype - defines WHAT KIND of spool exists.
    This is a product definition/SKU, not the physical inventory.
    """

    __tablename__ = "spools"

    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Spool type data (static properties that don't change per unit)
    barcode = Column(String(100), unique=True, nullable=False, index=True)
    base_weight = Column(
        Float, nullable=False
    )  # Standard weight when full (e.g., 1000g)
    is_box = Column(Boolean, default=False)  # Is it a boxed bundle?
    thickness = Column(Float, nullable=True)  # Filament diameter (1.75mm, 2.85mm)
    spool_return = Column(
        Boolean, default=False
    )  # Does manufacturer accept empty spool returns?

    # Foreign keys to lookup tables
    material_id = Column(String, ForeignKey("materials.id"), nullable=False)
    brand_id = Column(String, ForeignKey("brands.id"), nullable=False)
    color_id = Column(String, ForeignKey("colors.id"), nullable=False)
    trade_name_id = Column(String, ForeignKey("trade_names.id"), nullable=True)
    category_id = Column(String, ForeignKey("categories.id"), nullable=True)

    # Relationships (eager loading for GET requests)
    material = relationship("Material", lazy="joined")
    brand = relationship("Brand", lazy="joined")
    color = relationship("Color", lazy="joined")
    trade_name = relationship("TradeName", lazy="joined")
    category = relationship("Category", lazy="joined")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Spool(barcode='{self.barcode}', material={self.material.name}, brand={self.brand.name})>"
