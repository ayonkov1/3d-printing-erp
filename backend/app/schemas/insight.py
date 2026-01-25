"""
Insight Schemas
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class InsightResponse(BaseModel):
    """Schema for insight response"""

    id: str
    content: str
    job_id: Optional[str]
    generated_by: str
    created_at: datetime

    model_config = {"from_attributes": True}
