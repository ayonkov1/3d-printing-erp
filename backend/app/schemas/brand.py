# app/schemas/brand.py
from pydantic import BaseModel, Field
from datetime import datetime


class BrandCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class BrandResponse(BaseModel):
    id: str
    name: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
