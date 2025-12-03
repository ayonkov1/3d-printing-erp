from typing import List, Optional
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.spool_repository import SpoolRepository
from app.services.status_service import StatusService
from app.models.inventory import Inventory
from app.schemas.inventory import InventoryCreate, InventoryUpdate


class InventoryService:
    """Business logic for inventory management"""

    def __init__(
        self,
        inventory_repo: InventoryRepository,
        spool_repo: SpoolRepository,
        status_service: StatusService,
    ):
        self.inventory_repo = inventory_repo
        self.spool_repo = spool_repo
        self.status_service = status_service

    def get_all_inventory(self, skip: int = 0, limit: int = 100) -> List[Inventory]:
        """Get all inventory items with pagination"""
        return self.inventory_repo.get_all(skip, limit)

    def get_inventory_by_id(self, inventory_id: str) -> Inventory:
        """Get an inventory item by ID"""
        inventory = self.inventory_repo.get_by_id(inventory_id)
        if not inventory:
            raise ValueError(f"Inventory item with id {inventory_id} not found")
        return inventory

    def get_inventory_by_spool(self, spool_id: str) -> List[Inventory]:
        """Get all inventory items for a specific spool type"""
        return self.inventory_repo.find_by_spool_id(spool_id)

    def get_in_use_inventory(self) -> List[Inventory]:
        """Get all inventory items currently in use"""
        return self.inventory_repo.find_in_use()

    def add_to_inventory(self, data: InventoryCreate) -> Inventory:
        """Add a spool to inventory"""
        # Verify spool exists
        spool = self.spool_repo.get_by_id(data.spool_id)
        if not spool:
            raise ValueError(f"Spool type with id {data.spool_id} not found")

        # Find or create status
        status = self.status_service.find_or_create(data.status_name)

        # Use spool's base_weight if weight not provided
        weight = data.weight if data.weight is not None else spool.base_weight

        new_inventory = Inventory(
            spool_id=data.spool_id,
            weight=weight,
            is_in_use=data.is_in_use,
            status_id=status.id,
            custom_properties=data.custom_properties,
        )

        return self.inventory_repo.create(new_inventory)

    def update_inventory(self, inventory_id: str, data: InventoryUpdate) -> Inventory:
        """Update an inventory item"""
        inventory = self.get_inventory_by_id(inventory_id)

        if data.weight is not None:
            inventory.weight = data.weight
        if data.is_in_use is not None:
            inventory.is_in_use = data.is_in_use
        if data.status_name is not None:
            status = self.status_service.find_or_create(data.status_name)
            inventory.status_id = status.id
        if data.custom_properties is not None:
            inventory.custom_properties = data.custom_properties

        return self.inventory_repo.update(inventory)

    def delete_inventory(self, inventory_id: str) -> None:
        """Remove an inventory item"""
        inventory = self.get_inventory_by_id(inventory_id)
        self.inventory_repo.delete(inventory)

    def count_by_spool(self, spool_id: str) -> int:
        """Count how many units of a spool type are in inventory"""
        return self.inventory_repo.count_by_spool_id(spool_id)
