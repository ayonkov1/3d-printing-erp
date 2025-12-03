from typing import Optional
from sqlalchemy.orm import Session

from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    def __init__(self, db: Session):
        super().__init__(Category, db)

    def find_by_name(self, name: str) -> Optional[Category]:
        """Find category by name (case-insensitive)"""
        return self.db.query(Category).filter(Category.name.ilike(name)).first()

    def find_or_create(self, name: str) -> Category:
        """Find existing category or create new one"""
        category = self.find_by_name(name)
        if category:
            return category

        new_category = Category(name=name)
        return self.create(new_category)
