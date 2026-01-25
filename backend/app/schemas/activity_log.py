"""
Activity Log Schemas
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ActivityLogCreate(BaseModel):
    """Schema for creating an activity log entry"""

    action_type: str
    entity_type: str
    entity_id: Optional[str] = None
    description: str
    extra_data: Optional[str] = None
    user_id: Optional[str] = None
    user_email: Optional[str] = None


class ActivityLogResponse(BaseModel):
    """Schema for activity log response"""

    id: str
    action_type: str
    entity_type: str
    entity_id: Optional[str]
    description: str
    extra_data: Optional[str]
    user_id: Optional[str]
    user_email: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
