from typing import Optional, Type
from sqlalchemy.orm import Session

from app.models.material import Material
from app.repositories.base import BaseRepository


class MaterialRepository(BaseRepository[Material]):
    def __init__(self, db: Session):
        super().__init__(Material, db)

    def find_by_name(self, name: str) -> Optional[Material]:
        """Find material by name (case-insensitive)"""
        return self.db.query(Material).filter(Material.name.ilike(name)).first()

    def find_or_create(self, name: str) -> Material:
        """Find existing material or create new one"""
        material = self.find_by_name(name)
        if material:
            return material

        new_material = Material(name=name)
        return self.create(new_material)
