"""
Job Model

Tracks background jobs for async processing (e.g., AI insight generation).
"""

from sqlalchemy import Column, String, DateTime, Text, Integer
from datetime import datetime
from app.database import Base
import uuid


class JobStatus:
    """Job status constants"""

    READY = "ready"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class JobType:
    """Job type constants"""

    GENERATE_INSIGHTS = "generate_insights"


class Job(Base):
    """
    Background job entry - queued tasks to be processed by the worker.
    """

    __tablename__ = "jobs"

    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Job type (determines which handler processes it)
    job_type = Column(String(50), nullable=False, index=True)

    # Job status
    status = Column(String(20), nullable=False, default=JobStatus.READY, index=True)

    # Payload - JSON string with job-specific data
    payload = Column(Text, nullable=True)

    # Result - JSON string with job output
    result = Column(Text, nullable=True)

    # Error message if job failed
    error_message = Column(Text, nullable=True)

    # Retry tracking
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=2)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Job(type='{self.job_type}', status='{self.status}')>"

    def can_retry(self) -> bool:
        """Check if job can be retried"""
        return self.retry_count < self.max_retries
