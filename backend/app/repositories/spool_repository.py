from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.spool import Spool
from app.repositories.base import BaseRepository


class SpoolRepository(BaseRepository[Spool]):
    def __init__(self, db: Session):
        super().__init__(Spool, db)

    def find_by_barcode(self, barcode: str) -> Optional[Spool]:
        """Find spool by barcode"""
        return self.db.query(Spool).filter(Spool.barcode == barcode).first()

    def get_all_with_relations(self, skip: int = 0, limit: int = 100) -> List[Spool]:
        """Get all spools with eager-loaded relationships"""
        # Already configured in model with lazy="joined"
        return self.get_all(skip, limit)
