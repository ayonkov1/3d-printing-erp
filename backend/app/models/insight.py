"""
Insight Model

Stores AI-generated insights for the dashboard.
"""

from sqlalchemy import Column, String, DateTime, Text
from datetime import datetime
from app.database import Base
import uuid


class Insight(Base):
    """
    AI-generated insight - cached predictions and recommendations.
    """

    __tablename__ = "insights"

    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # The insight content from AI
    content = Column(Text, nullable=False)

    # Source job ID (for traceability)
    job_id = Column(String, nullable=True, index=True)

    # Generation method
    generated_by = Column(String(50), nullable=False, default="openai")
    # "openai", "scheduled", "manual"

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<Insight(id='{self.id}', created='{self.created_at}')>"
