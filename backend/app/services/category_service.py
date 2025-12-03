from typing import List
from app.repositories.category_repository import CategoryRepository
from app.models.category import Category


class CategoryService:
    """Business logic for categories"""

    def __init__(self, category_repo: CategoryRepository):
        self.category_repo = category_repo

    def get_all_categories(self, skip: int = 0, limit: int = 100) -> List[Category]:
        """Get all categories with pagination"""
        return self.category_repo.get_all(skip, limit)

    def get_category_by_id(self, category_id: str) -> Category:
        """Get a category by ID"""
        category = self.category_repo.get_by_id(category_id)
        if not category:
            raise ValueError(f"Category with id {category_id} not found")
        return category

    def create_category(self, name: str) -> Category:
        """Create a new category"""
        existing = self.category_repo.find_by_name(name)
        if existing:
            raise ValueError(f"Category '{name}' already exists")

        new_category = Category(name=name)
        return self.category_repo.create(new_category)

    def find_or_create(self, name: str) -> Category:
        return self.category_repo.find_or_create(name)
