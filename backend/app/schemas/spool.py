from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# Nested schemas for
# TODO: 5. Create nested schemas as DTOs for relationships
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


# Create schema (what user sends)
class SpoolCreate(BaseModel):
    barcode: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(default=1, ge=1)
    is_box: bool = False
    weight: float = Field(..., gt=0)
    thickness: Optional[float] = Field(None, gt=0)
    spool_return: bool = False
    status: str = Field(
        default="in_stock", pattern="^(in_stock|in_use|depleted|ordered)$"
    )
    custom_properties: Optional[str] = None

    # Lookup table data (names, not IDs!)
    color_name: str = Field(..., min_length=1)
    color_hex_code: str = Field(default="#000000", pattern="^#[0-9A-Fa-f]{6}$")
    brand_name: str = Field(..., min_length=1)
    material_name: str = Field(..., min_length=1)


# Response schema (what API returns)
class SpoolResponse(BaseModel):
    id: str
    barcode: str
    quantity: int
    is_box: bool
    weight: float
    thickness: Optional[float]
    spool_return: bool
    is_in_use: bool
    status: str
    custom_properties: Optional[str]

    # Nested relationships (full objects, not just IDs!)
    color: ColorNested
    brand: BrandNested
    material: MaterialNested

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
