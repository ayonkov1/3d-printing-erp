from typing import Optional
from sqlalchemy.orm import Session

from app.models.status import Status
from app.repositories.base import BaseRepository


class StatusRepository(BaseRepository[Status]):
    def __init__(self, db: Session):
        super().__init__(Status, db)

    def find_by_name(self, name: str) -> Optional[Status]:
        """Find status by name (case-insensitive)"""
        return self.db.query(Status).filter(Status.name.ilike(name)).first()

    def find_or_create(self, name: str) -> Status:
        """Find existing status or create new one"""
        status = self.find_by_name(name)
        if status:
            return status

        new_status = Status(name=name)
        return self.create(new_status)
