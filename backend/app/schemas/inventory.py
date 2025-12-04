# app/schemas/inventory.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

from app.schemas.spool import SpoolResponse
from app.schemas.status import StatusResponse


class InventoryCreate(BaseModel):
    """Schema for adding a spool to inventory"""

    spool_id: str = Field(..., description="ID of the spool type from catalog")
    weight: Optional[float] = Field(
        None,
        gt=0,
        description="Current weight. If not provided, uses spool's base_weight",
    )
    is_in_use: bool = Field(
        default=False, description="Is it currently loaded in a printer?"
    )
    status_name: str = Field(
        default="in_stock",
        description="Status name (e.g., in_stock, in_use, depleted, ordered)",
    )
    custom_properties: Optional[str] = Field(
        None, description="Per-item notes/metadata"
    )


class InventoryUpdate(BaseModel):
    """Schema for updating an inventory item"""

    weight: Optional[float] = Field(None, gt=0)
    is_in_use: Optional[bool] = None
    status_name: Optional[str] = None
    custom_properties: Optional[str] = None


class InventoryResponse(BaseModel):
    """Schema for inventory item response"""

    id: str
    weight: float
    is_in_use: bool
    custom_properties: Optional[str]

    # Nested relationships
    spool: SpoolResponse
    status: StatusResponse

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
