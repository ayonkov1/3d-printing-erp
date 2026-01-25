"""
Activity Log Repository
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.activity_log import ActivityLog
from app.repositories.base import BaseRepository


class ActivityLogRepository(BaseRepository[ActivityLog]):
    def __init__(self, db: Session):
        super().__init__(ActivityLog, db)

    def get_recent(self, limit: int = 100) -> List[ActivityLog]:
        """Get most recent activity logs"""
        return (
            self.db.query(ActivityLog)
            .order_by(desc(ActivityLog.created_at))
            .limit(limit)
            .all()
        )

    def get_by_entity(
        self, entity_type: str, entity_id: str, limit: int = 50
    ) -> List[ActivityLog]:
        """Get logs for a specific entity"""
        return (
            self.db.query(ActivityLog)
            .filter(
                ActivityLog.entity_type == entity_type,
                ActivityLog.entity_id == entity_id,
            )
            .order_by(desc(ActivityLog.created_at))
            .limit(limit)
            .all()
        )

    def get_by_action_type(
        self, action_type: str, limit: int = 50
    ) -> List[ActivityLog]:
        """Get logs by action type"""
        return (
            self.db.query(ActivityLog)
            .filter(ActivityLog.action_type == action_type)
            .order_by(desc(ActivityLog.created_at))
            .limit(limit)
            .all()
        )

    def get_by_user(self, user_id: str, limit: int = 50) -> List[ActivityLog]:
        """Get logs for a specific user"""
        return (
            self.db.query(ActivityLog)
            .filter(ActivityLog.user_id == user_id)
            .order_by(desc(ActivityLog.created_at))
            .limit(limit)
            .all()
        )

    def get_for_ai_analysis(self, limit: int = 500) -> List[ActivityLog]:
        """
        Get logs formatted for AI analysis.
        Returns recent logs that are useful for generating insights.
        """
        return (
            self.db.query(ActivityLog)
            .order_by(desc(ActivityLog.created_at))
            .limit(limit)
            .all()
        )
