from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.repositories.base import BaseRepository


class InventoryRepository(BaseRepository[Inventory]):
    def __init__(self, db: Session):
        super().__init__(Inventory, db)

    def find_by_spool_id(self, spool_id: str) -> List[Inventory]:
        """Find all inventory items for a specific spool type"""
        return self.db.query(Inventory).filter(Inventory.spool_id == spool_id).all()

    def find_by_status_id(self, status_id: str) -> List[Inventory]:
        """Find all inventory items with a specific status"""
        return self.db.query(Inventory).filter(Inventory.status_id == status_id).all()

    def find_in_use(self) -> List[Inventory]:
        """Find all inventory items currently in use"""
        return self.db.query(Inventory).filter(Inventory.is_in_use == True).all()

    def count_by_spool_id(self, spool_id: str) -> int:
        """Count how many units of a spool type are in inventory"""
        return self.db.query(Inventory).filter(Inventory.spool_id == spool_id).count()
