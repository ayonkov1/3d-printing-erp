# app/schemas/color.py
from pydantic import BaseModel, Field
from datetime import datetime


class ColorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    hex_code: str = Field(..., pattern="^#[0-9A-Fa-f]{6}$")  # Validates hex format


class ColorResponse(BaseModel):
    id: str
    name: str
    hex_code: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
