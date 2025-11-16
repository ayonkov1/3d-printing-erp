from app.repositories.material_repository import MaterialRepository
from app.models.material import Material


class MaterialService:
    """Business logic for materials"""

    def __init__(self, material_repo: MaterialRepository):
        self.material_repo = material_repo

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
