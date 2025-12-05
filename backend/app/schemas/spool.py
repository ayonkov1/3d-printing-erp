from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid


# Nested schemas for relationships
class ColorNested(BaseModel):
    id: str
    name: str
    hex_code: str

    model_config = {"from_attributes": True}


class BrandNested(BaseModel):
    id: str
    name: str

    model_config = {"from_attributes": True}


class MaterialNested(BaseModel):
    id: str
    name: str

    model_config = {"from_attributes": True}


class TradeNameNested(BaseModel):
    id: str
    name: str

    model_config = {"from_attributes": True}


class CategoryNested(BaseModel):
    id: str
    name: str

    model_config = {"from_attributes": True}


def generate_barcode() -> str:
    """Generate a unique barcode with SPL prefix"""
    short_id = uuid.uuid4().hex[:8].upper()
    return f"SPL{short_id}"


# Create schema (what user sends to create a spool type)
class SpoolCreate(BaseModel):
    """Schema for creating a spool type in the catalog"""

    barcode: Optional[str] = Field(None, min_length=1, max_length=100, description="Barcode - auto-generated if not provided")
    base_weight: float = Field(
        ..., gt=0, description="Standard weight when full (e.g., 1000g)"
    )
    is_box: bool = False
    thickness: Optional[float] = Field(
        None, gt=0, description="Filament diameter (1.75mm, 2.85mm)"
    )
    spool_return: bool = False

    # Lookup table data (names, not IDs!)
    color_name: str = Field(..., min_length=1)
    color_hex_code: str = Field(default="#000000", pattern="^#[0-9A-Fa-f]{6}$")
    brand_name: str = Field(..., min_length=1)
    material_name: str = Field(..., min_length=1)
    trade_name: Optional[str] = Field(None, min_length=1)
    category_name: Optional[str] = Field(None, min_length=1)


# Response schema (what API returns)
class SpoolResponse(BaseModel):
    """Schema for spool type response from catalog"""

    id: str
    barcode: str
    base_weight: float
    is_box: bool
    thickness: Optional[float]
    spool_return: bool

    # Nested relationships (full objects, not just IDs!)
    color: ColorNested
    brand: BrandNested
    material: MaterialNested
    trade_name: Optional[TradeNameNested]
    category: Optional[CategoryNested]

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
