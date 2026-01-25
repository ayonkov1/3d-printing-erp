"""
Scheduler Service

APScheduler-based scheduler for periodic tasks.
"""

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.database import SessionLocal
from app.repositories.job_repository import JobRepository
from app.models.job import Job, JobStatus, JobType

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = AsyncIOScheduler()


def create_daily_insights_job() -> None:
    """
    Create a job for daily insights generation.
    This is called by the scheduler at 6 AM daily.
    """
    logger.info("Creating scheduled daily insights job")

    db = SessionLocal()
    try:
        job_repo = JobRepository(db)
        job = Job(
            job_type=JobType.GENERATE_INSIGHTS,
            status=JobStatus.READY,
        )
        job_repo.create(job)
        logger.info(f"Created daily insights job: {job.id}")
    except Exception as e:
        logger.error(f"Failed to create daily insights job: {str(e)}")
    finally:
        db.close()


def setup_scheduler() -> None:
    """
    Configure and start the scheduler.
    Schedules daily insights generation at 6 AM.
    """
    # Schedule daily insights job at 6:00 AM
    scheduler.add_job(
        create_daily_insights_job,
        trigger=CronTrigger(hour=6, minute=0),
        id="daily_insights_job",
        name="Generate Daily AI Insights",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Scheduler started - Daily insights job scheduled for 6:00 AM")


def shutdown_scheduler() -> None:
    """Shutdown the scheduler gracefully"""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler shutdown")
