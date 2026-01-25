"""
Job Repository
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import asc
from app.models.job import Job, JobStatus
from app.repositories.base import BaseRepository


class JobRepository(BaseRepository[Job]):
    def __init__(self, db: Session):
        super().__init__(Job, db)

    def get_ready_jobs(self, limit: int = 10) -> List[Job]:
        """Get jobs ready for processing (FIFO order)"""
        return (
            self.db.query(Job)
            .filter(Job.status == JobStatus.READY)
            .order_by(asc(Job.created_at))
            .limit(limit)
            .all()
        )

    def get_by_status(self, status: str, limit: int = 50) -> List[Job]:
        """Get jobs by status"""
        return (
            self.db.query(Job)
            .filter(Job.status == status)
            .order_by(asc(Job.created_at))
            .limit(limit)
            .all()
        )

    def get_recent_jobs(self, limit: int = 20) -> List[Job]:
        """Get most recent jobs regardless of status"""
        from sqlalchemy import desc

        return self.db.query(Job).order_by(desc(Job.created_at)).limit(limit).all()

    def get_failed_retryable(self) -> List[Job]:
        """Get failed jobs that can be retried"""
        return (
            self.db.query(Job)
            .filter(
                Job.status == JobStatus.FAILED,
                Job.retry_count < Job.max_retries,
            )
            .all()
        )
