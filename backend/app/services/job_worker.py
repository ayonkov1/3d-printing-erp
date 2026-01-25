"""
Job Worker Service

Background worker that processes jobs from the queue.
"""

import asyncio
import logging
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.job import Job, JobStatus, JobType
from app.repositories.job_repository import JobRepository
from app.repositories.activity_log_repository import ActivityLogRepository
from app.repositories.insight_repository import InsightRepository
from app.repositories.inventory_repository import InventoryRepository
from app.services.ai_insights_service import AIInsightsService

logger = logging.getLogger(__name__)


class JobWorker:
    """Background worker for processing jobs"""

    def __init__(self):
        self._running = False
        self._task: Optional[asyncio.Task] = None

    def _get_db(self) -> Session:
        """Get a new database session"""
        return SessionLocal()

    async def process_job(self, job: Job, db: Session) -> None:
        """
        Process a single job.

        Args:
            job: The job to process
            db: Database session
        """
        job_repo = JobRepository(db)

        # Mark as processing
        job.status = JobStatus.PROCESSING
        job.started_at = datetime.utcnow()
        job_repo.update(job)

        try:
            if job.job_type == JobType.GENERATE_INSIGHTS:
                await self._process_insights_job(job, db)
            else:
                raise ValueError(f"Unknown job type: {job.job_type}")

            # Mark as completed
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            job_repo.update(job)
            logger.info(f"Job {job.id} completed successfully")

        except Exception as e:
            logger.error(f"Job {job.id} failed: {str(e)}")
            job.retry_count += 1

            if job.can_retry():
                # Reset to ready for retry
                job.status = JobStatus.READY
                job.error_message = f"Retry {job.retry_count}: {str(e)}"
                logger.info(
                    f"Job {job.id} will be retried (attempt {job.retry_count}/{job.max_retries})"
                )
            else:
                # Mark as failed
                job.status = JobStatus.FAILED
                job.error_message = str(e)
                job.completed_at = datetime.utcnow()
                logger.error(
                    f"Job {job.id} failed permanently after {job.retry_count} retries"
                )

            job_repo.update(job)

    async def _process_insights_job(self, job: Job, db: Session) -> None:
        """Process an insights generation job"""
        activity_log_repo = ActivityLogRepository(db)
        insight_repo = InsightRepository(db)
        job_repo = JobRepository(db)
        inventory_repo = InventoryRepository(db)

        ai_service = AIInsightsService(
            activity_log_repo=activity_log_repo,
            insight_repo=insight_repo,
            job_repo=job_repo,
            inventory_repo=inventory_repo,
        )

        insight = await ai_service.generate_insight(
            job_id=job.id,
            generated_by="scheduled",
        )

        job.result = f"Generated insight: {insight.id}"

    async def _worker_loop(self) -> None:
        """Main worker loop that polls for jobs"""
        logger.info("Job worker started")

        while self._running:
            db = self._get_db()
            try:
                job_repo = JobRepository(db)
                ready_jobs = job_repo.get_ready_jobs(limit=1)

                if ready_jobs:
                    job = ready_jobs[0]
                    logger.info(f"Processing job {job.id} (type: {job.job_type})")
                    await self.process_job(job, db)
                else:
                    # No jobs, wait before polling again
                    await asyncio.sleep(5)

            except Exception as e:
                logger.error(f"Worker loop error: {str(e)}")
                await asyncio.sleep(10)
            finally:
                db.close()

    def start(self) -> None:
        """Start the worker in the background"""
        if self._running:
            logger.warning("Worker already running")
            return

        self._running = True
        self._task = asyncio.create_task(self._worker_loop())
        logger.info("Job worker scheduled to start")

    def stop(self) -> None:
        """Stop the worker"""
        self._running = False
        if self._task:
            self._task.cancel()
            self._task = None
        logger.info("Job worker stopped")


# Global worker instance
job_worker = JobWorker()
