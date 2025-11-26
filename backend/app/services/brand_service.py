from typing import List
from app.repositories.brand_repository import BrandRepository
from app.models.brand import Brand


class BrandService:
    """Business logic for brands"""

    def __init__(self, brand_repo: BrandRepository):
        self.brand_repo = brand_repo

    def get_all_brands(self, skip: int = 0, limit: int = 100) -> List[Brand]:
        """Get all brands with pagination"""
        return self.brand_repo.get_all(skip, limit)

    def get_brand_by_id(self, brand_id: str) -> Brand:
        """Get a brand by ID"""
        brand = self.brand_repo.get_by_id(brand_id)
        if not brand:
            raise ValueError(f"Brand with id {brand_id} not found")
        return brand

    def create_brand(self, name: str) -> Brand:
        """Create a new brand"""
        # Check if brand already exists
        existing = self.brand_repo.find_by_name(name)
        if existing:
            raise ValueError(f"Brand '{name}' already exists")
        
        new_brand = Brand(name=name)
        return self.brand_repo.create(new_brand)

    def find_or_create(
        self,
        name: str,
    ) -> Brand:

        return self.brand_repo.find_or_create(name)
