from typing import List
from app.repositories.status_repository import StatusRepository
from app.models.status import Status


class StatusService:
    """Business logic for statuses"""

    def __init__(self, status_repo: StatusRepository):
        self.status_repo = status_repo

    def get_all_statuses(self, skip: int = 0, limit: int = 100) -> List[Status]:
        """Get all statuses with pagination"""
        return self.status_repo.get_all(skip, limit)

    def get_status_by_id(self, status_id: str) -> Status:
        """Get a status by ID"""
        status = self.status_repo.get_by_id(status_id)
        if not status:
            raise ValueError(f"Status with id {status_id} not found")
        return status

    def create_status(self, name: str) -> Status:
        """Create a new status"""
        existing = self.status_repo.find_by_name(name)
        if existing:
            raise ValueError(f"Status '{name}' already exists")

        new_status = Status(name=name)
        return self.status_repo.create(new_status)

    def find_or_create(self, name: str) -> Status:
        return self.status_repo.find_or_create(name)

    def find_by_name(self, name: str) -> Status:
        status = self.status_repo.find_by_name(name)
        if not status:
            raise ValueError(f"Status '{name}' not found")
        return status
