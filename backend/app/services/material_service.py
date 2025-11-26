from typing import List
from app.repositories.material_repository import MaterialRepository
from app.models.material import Material


class MaterialService:
    """Business logic for materials"""

    def __init__(self, material_repo: MaterialRepository):
        self.material_repo = material_repo

    def get_all_materials(self, skip: int = 0, limit: int = 100) -> List[Material]:
        """Get all materials with pagination"""
        return self.material_repo.get_all(skip, limit)

    def get_material_by_id(self, material_id: str) -> Material:
        """Get a material by ID"""
        material = self.material_repo.get_by_id(material_id)
        if not material:
            raise ValueError(f"Material with id {material_id} not found")
        return material

    def create_material(self, name: str) -> Material:
        """Create a new material"""
        # Check if material already exists
        existing = self.material_repo.find_by_name(name)
        if existing:
            raise ValueError(f"Material '{name}' already exists")

        new_material = Material(name=name)
        return self.material_repo.create(new_material)

    def find_or_create(
        self,
        name: str,
    ) -> Material:
        """
        Find existing material by name, or create new one.

        Args:
            name: Material name+

        Returns:
            Material object (existing or newly created)
        """
        return self.material_repo.find_or_create(name)
