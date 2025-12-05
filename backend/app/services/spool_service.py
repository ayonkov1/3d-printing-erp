from typing import List, Optional
from app.repositories.spool_repository import SpoolRepository
from app.services.color_service import ColorService
from app.services.brand_service import BrandService
from app.services.material_service import MaterialService
from app.services.trade_name_service import TradeNameService
from app.services.category_service import CategoryService
from app.models.spool import Spool
from app.schemas.spool import SpoolCreate, generate_barcode


class SpoolService:
    """Business logic for spool catalog with find-or-create for lookup tables"""

    def __init__(
        self,
        spool_repo: SpoolRepository,
        color_service: ColorService,
        brand_service: BrandService,
        material_service: MaterialService,
        trade_name_service: Optional[TradeNameService] = None,
        category_service: Optional[CategoryService] = None,
    ):
        self.spool_repo = spool_repo
        self.color_service = color_service
        self.brand_service = brand_service
        self.material_service = material_service
        self.trade_name_service = trade_name_service
        self.category_service = category_service

    def create_spool(self, spool_data: SpoolCreate) -> Spool:
        """
        Create new spool type in catalog with automatic find-or-create for lookup tables.

        Process:
        1. Check if barcode already exists (validation)
        2. Find or create color
        3. Find or create brand
        4. Find or create material
        5. Find or create trade_name (optional)
        6. Find or create category (optional)
        7. Create spool with all foreign keys

        Args:
            spool_data: Spool creation data

        Returns:
            Created Spool with all relationships loaded

        Raises:
            ValueError: If barcode already exists
        """
        # Generate barcode if not provided
        barcode = spool_data.barcode
        if not barcode:
            barcode = generate_barcode()
            # Ensure uniqueness (very unlikely collision but check anyway)
            while self.spool_repo.find_by_barcode(barcode):
                barcode = generate_barcode()
        else:
            # Validation: Check duplicate barcode if user provided one
            existing = self.spool_repo.find_by_barcode(barcode)
            if existing:
                raise ValueError(f"Spool with barcode '{barcode}' already exists")

        # Find or create lookup entities
        color = self.color_service.find_or_create(
            spool_data.color_name, spool_data.color_hex_code
        )

        brand = self.brand_service.find_or_create(spool_data.brand_name)

        material = self.material_service.find_or_create(spool_data.material_name)

        # Optional lookups
        trade_name_id = None
        if spool_data.trade_name and self.trade_name_service:
            trade_name = self.trade_name_service.find_or_create(spool_data.trade_name)
            trade_name_id = trade_name.id

        category_id = None
        if spool_data.category_name and self.category_service:
            category = self.category_service.find_or_create(spool_data.category_name)
            category_id = category.id

        # Create spool
        spool = Spool(
            barcode=barcode,
            base_weight=spool_data.base_weight,
            is_box=spool_data.is_box,
            thickness=spool_data.thickness,
            spool_return=spool_data.spool_return,
            material_id=material.id,
            color_id=color.id,
            brand_id=brand.id,
            trade_name_id=trade_name_id,
            category_id=category_id,
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

    def get_spool_by_barcode(self, barcode: str) -> Optional[Spool]:
        """
        Get single spool by exact barcode match.

        Returns:
            Spool if found, None otherwise
        """
        return self.spool_repo.find_by_barcode(barcode)

    def search_spools_by_barcode(self, barcode: str) -> List[Spool]:
        """
        Search spools by partial barcode match (case-insensitive).

        Returns:
            List of all matching spools
        """
        return self.spool_repo.find_by_barcode_partial(barcode)
