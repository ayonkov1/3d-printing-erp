"""
Activity Log Model

Tracks all operations in the system for audit trail and AI analysis.
"""

from sqlalchemy import Column, String, DateTime, Text
from datetime import datetime
from app.database import Base
import uuid


class ActivityLog(Base):
    """
    Activity log entry - records all significant operations in the system.
    Used for audit trail and as input for AI insights generation.
    """

    __tablename__ = "activity_logs"

    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Action details
    action_type = Column(String(50), nullable=False, index=True)
    # Examples: "spool_created", "inventory_added", "inventory_updated",
    # "inventory_deleted", "status_changed", "weight_updated"

    entity_type = Column(String(50), nullable=False, index=True)
    # Examples: "spool", "inventory", "color", "brand", "material"

    entity_id = Column(String, nullable=True)
    # ID of the affected entity (spool_id, inventory_id, etc.)

    # Human-readable description
    description = Column(Text, nullable=False)
    # Example: "User admin added 1000g Blue PLA spool to inventory"

    # Additional context as JSON string
    extra_data = Column(Text, nullable=True)
    # Store extra details like old/new values, quantities, etc.

    # Who performed the action
    user_id = Column(String, nullable=True, index=True)
    user_email = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<ActivityLog(action='{self.action_type}', entity='{self.entity_type}', description='{self.description[:50]}...')>"
