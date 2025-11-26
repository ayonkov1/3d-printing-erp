# app/schemas/material.py
from pydantic import BaseModel, Field
from datetime import datetime


class MaterialCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class MaterialResponse(BaseModel):
    id: str
    name: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
