from typing import List
from app.repositories.spool_repository import SpoolRepository
from app.services.color_service import ColorService
from app.services.brand_service import BrandService
from app.services.material_service import MaterialService
from app.models.spool import Spool
from app.schemas.spool import SpoolCreate


class SpoolService:
    """Business logic for spools with find-or-create for lookup tables"""

    def __init__(
        self,
        spool_repo: SpoolRepository,
        color_service: ColorService,
        brand_service: BrandService,
        material_service: MaterialService,
    ):
        self.spool_repo = spool_repo
        self.color_service = color_service
        self.brand_service = brand_service
        self.material_service = material_service

    def create_spool(self, spool_data: SpoolCreate) -> Spool:
        """
        Create new spool with automatic find-or-create for lookup tables.

        Process:
        1. Check if barcode already exists (validation)
        2. Find or create color
        3. Find or create brand
        4. Find or create material
        5. Create spool with all foreign keys

        Args:
            spool_data: Spool creation data

        Returns:
            Created Spool with all relationships loaded

        Raises:
            ValueError: If barcode already exists
        """
        # Validation: Check duplicate barcode
        existing = self.spool_repo.find_by_barcode(spool_data.barcode)
        if existing:
            raise ValueError(
                f"Spool with barcode '{spool_data.barcode}' already exists"
            )

        # Find or create lookup entities
        color = self.color_service.find_or_create(
            spool_data.color_name, spool_data.color_hex_code
        )

        brand = self.brand_service.find_or_create(spool_data.brand_name)

        material = self.material_service.find_or_create(spool_data.material_name)

        # Create spool
        spool = Spool(
            barcode=spool_data.barcode,
            quantity=spool_data.quantity,
            is_box=spool_data.is_box,
            weight=spool_data.weight,
            thickness=spool_data.thickness,
            spool_return=spool_data.spool_return,
            status=spool_data.status,
            custom_properties=spool_data.custom_properties,
            material_id=material.id,
            color_id=color.id,
            brand_id=brand.id,
        )

        return self.spool_repo.create(spool)

    def get_all_spools(self, skip: int = 0, limit: int = 100) -> List[Spool]:
        """
        Get all spools with relationships loaded.

        Returns spools with color, brand, and material data included.
        """
        return self.spool_repo.get_all_with_relations(skip, limit)

    def get_spool_by_id(self, spool_id: str) -> Spool:
        """
        Get single spool by ID.

        Raises:
            ValueError: If spool not found
        """
        spool = self.spool_repo.get_by_id(spool_id)
        if not spool:
            raise ValueError(f"Spool with id '{spool_id}' not found")
        return spool
