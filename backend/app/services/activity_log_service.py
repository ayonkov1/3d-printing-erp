"""
Activity Log Service

Service for logging all operations in the system.
"""

import json
from typing import Optional, List
from app.repositories.activity_log_repository import ActivityLogRepository
from app.models.activity_log import ActivityLog
from app.models.user import User


class ActionType:
    """Constants for action types"""

    # Spool actions
    SPOOL_CREATED = "spool_created"
    SPOOL_UPDATED = "spool_updated"
    SPOOL_DELETED = "spool_deleted"

    # Inventory actions
    INVENTORY_ADDED = "inventory_added"
    INVENTORY_UPDATED = "inventory_updated"
    INVENTORY_DELETED = "inventory_deleted"
    WEIGHT_UPDATED = "weight_updated"
    STATUS_CHANGED = "status_changed"

    # Lookup table actions
    COLOR_CREATED = "color_created"
    BRAND_CREATED = "brand_created"
    MATERIAL_CREATED = "material_created"


class EntityType:
    """Constants for entity types"""

    SPOOL = "spool"
    INVENTORY = "inventory"
    COLOR = "color"
    BRAND = "brand"
    MATERIAL = "material"
    STATUS = "status"


class ActivityLogService:
    """Service for managing activity logs"""

    def __init__(self, activity_log_repo: ActivityLogRepository):
        self.activity_log_repo = activity_log_repo

    def log(
        self,
        action_type: str,
        entity_type: str,
        description: str,
        entity_id: Optional[str] = None,
        metadata: Optional[dict] = None,
        user: Optional[User] = None,
    ) -> ActivityLog:
        """
        Log an activity.

        Args:
            action_type: Type of action (use ActionType constants)
            entity_type: Type of entity affected (use EntityType constants)
            description: Human-readable description
            entity_id: ID of the affected entity
            metadata: Additional context as dict (will be JSON serialized)
            user: User who performed the action

        Returns:
            Created ActivityLog entry
        """
        log_entry = ActivityLog(
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            description=description,
            metadata=json.dumps(metadata) if metadata else None,
            user_id=user.id if user else None,
            user_email=user.email if user else None,
        )
        return self.activity_log_repo.create(log_entry)

    def get_recent(self, limit: int = 100) -> List[ActivityLog]:
        """Get recent activity logs"""
        return self.activity_log_repo.get_recent(limit)

    def get_by_entity(
        self, entity_type: str, entity_id: str, limit: int = 50
    ) -> List[ActivityLog]:
        """Get logs for a specific entity"""
        return self.activity_log_repo.get_by_entity(entity_type, entity_id, limit)

    def get_for_ai_analysis(self, limit: int = 500) -> List[ActivityLog]:
        """Get logs formatted for AI analysis"""
        return self.activity_log_repo.get_for_ai_analysis(limit)

    def format_logs_for_ai(self, logs: List[ActivityLog]) -> str:
        """
        Format logs into a text format suitable for AI analysis.

        Returns a JSON-like string with log entries for the AI to analyze.
        """
        formatted_logs = []
        for log in logs:
            entry = {
                "timestamp": log.created_at.isoformat(),
                "action": log.action_type,
                "entity": log.entity_type,
                "description": log.description,
            }
            if log.metadata:
                try:
                    entry["details"] = json.loads(log.metadata)
                except json.JSONDecodeError:
                    entry["details"] = log.metadata
            formatted_logs.append(entry)

        return json.dumps(formatted_logs, indent=2)
