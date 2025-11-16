from app.repositories.brand_repository import BrandRepository
from app.models.brand import Brand


class BrandService:
    """Business logic for materials"""

    def __init__(self, brand_repo: BrandRepository):
        self.brand_repo = brand_repo

    def find_or_create(
        self,
        name: str,
    ) -> Brand:

        return self.brand_repo.find_or_create(name)
