from typing import Optional, Type
from sqlalchemy.orm import Session

from app.models.brand import Brand
from app.repositories.base import BaseRepository


class BrandRepository(BaseRepository[Brand]):
    def __init__(self, db: Session):
        super().__init__(Brand, db)

    def find_by_name(self, name: str) -> Optional[Brand]:
        """Find brand by name (case-insensitive)"""
        return self.db.query(Brand).filter(Brand.name.ilike(name)).first()

    def find_or_create(self, name: str) -> Brand:
        """Find existing brand or create new one"""
        brand = self.find_by_name(name)
        if brand:
            return brand

        new_brand = Brand(name=name)
        return self.create(new_brand)
