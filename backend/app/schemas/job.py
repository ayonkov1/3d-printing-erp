"""
Job Schemas
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class JobCreate(BaseModel):
    """Schema for creating a job"""

    job_type: str
    payload: Optional[str] = None


class JobResponse(BaseModel):
    """Schema for job response"""

    id: str
    job_type: str
    status: str
    payload: Optional[str]
    result: Optional[str]
    error_message: Optional[str]
    retry_count: int
    max_retries: int
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}
