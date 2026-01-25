"""
Dashboard Service

Service for aggregating dashboard data.
"""

from typing import Optional, List
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.activity_log_repository import ActivityLogRepository
from app.repositories.insight_repository import InsightRepository
from app.repositories.job_repository import JobRepository
from app.models.activity_log import ActivityLog
from app.models.insight import Insight
from app.models.job import Job
from app.schemas.dashboard import InventoryStats


class DashboardService:
    """Service for dashboard data aggregation"""

    def __init__(
        self,
        inventory_repo: InventoryRepository,
        activity_log_repo: ActivityLogRepository,
        insight_repo: InsightRepository,
        job_repo: Optional[JobRepository] = None,
    ):
        self.inventory_repo = inventory_repo
        self.activity_log_repo = activity_log_repo
        self.insight_repo = insight_repo
        self.job_repo = job_repo

    def get_inventory_stats(self) -> InventoryStats:
        """Get inventory statistics for dashboard"""
        inventory_items = self.inventory_repo.get_all(limit=10000)

        total_spools = len(inventory_items)
        total_weight = sum(item.weight for item in inventory_items)
        spools_in_use = sum(1 for item in inventory_items if item.is_in_use)

        # Low stock: items with weight < 20% of their spool's base weight
        low_stock_count = 0
        for item in inventory_items:
            if item.spool and item.spool.base_weight:
                threshold = item.spool.base_weight * 0.2
                if item.weight < threshold:
                    low_stock_count += 1

        return InventoryStats(
            total_spools=total_spools,
            total_weight=round(total_weight, 2),
            spools_in_use=spools_in_use,
            low_stock_count=low_stock_count,
        )

    def get_recent_activity(self, limit: int = 20) -> List[ActivityLog]:
        """Get recent activity logs for dashboard"""
        return self.activity_log_repo.get_recent(limit)

    def get_latest_insight(self) -> Optional[Insight]:
        """Get the most recent AI insight"""
        return self.insight_repo.get_latest()

    def get_insights_history(self, limit: int = 10) -> List[Insight]:
        """Get historical insights"""
        return self.insight_repo.get_recent(limit)

    def get_recent_jobs(self, limit: int = 20) -> List[Job]:
        """Get recent jobs for dashboard"""
        if self.job_repo:
            return self.job_repo.get_recent_jobs(limit)
        return []

    def delete_insight(self, insight_id: str) -> bool:
        """Delete an insight by ID"""
        insight = self.insight_repo.get_by_id(insight_id)
        if insight:
            self.insight_repo.delete(insight)
            return True
        return False
