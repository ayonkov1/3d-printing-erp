from typing import List, Optional
from app.repositories.inventory_repository import InventoryRepository
from app.repositories.spool_repository import SpoolRepository
from app.repositories.activity_log_repository import ActivityLogRepository
from app.services.status_service import StatusService
from app.services.activity_log_service import ActivityLogService, ActionType, EntityType
from app.models.inventory import Inventory
from app.models.user import User
from app.schemas.inventory import InventoryCreate, InventoryUpdate


class InventoryService:
    """Business logic for inventory management"""

    def __init__(
        self,
        inventory_repo: InventoryRepository,
        spool_repo: SpoolRepository,
        status_service: StatusService,
        activity_log_service: Optional[ActivityLogService] = None,
    ):
        self.inventory_repo = inventory_repo
        self.spool_repo = spool_repo
        self.status_service = status_service
        self.activity_log_service = activity_log_service

    def _log_activity(
        self,
        action_type: str,
        description: str,
        entity_id: Optional[str] = None,
        metadata: Optional[dict] = None,
        user: Optional[User] = None,
    ) -> None:
        """Helper to log activity if service is available"""
        if self.activity_log_service:
            self.activity_log_service.log(
                action_type=action_type,
                entity_type=EntityType.INVENTORY,
                entity_id=entity_id,
                description=description,
                metadata=metadata,
                user=user,
            )

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

    def add_to_inventory(
        self, data: InventoryCreate, user: Optional[User] = None
    ) -> Inventory:
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

        created = self.inventory_repo.create(new_inventory)

        # Log the activity
        spool_desc = (
            f"{spool.color.name} {spool.material.name}"
            if spool.color and spool.material
            else "spool"
        )
        self._log_activity(
            action_type=ActionType.INVENTORY_ADDED,
            description=f"Added {weight}g {spool_desc} ({spool.brand.name if spool.brand else 'Unknown'}) to inventory",
            entity_id=created.id,
            metadata={
                "spool_id": spool.id,
                "weight": weight,
                "status": data.status_name,
                "barcode": spool.barcode,
            },
            user=user,
        )

        return created

    def update_inventory(
        self, inventory_id: str, data: InventoryUpdate, user: Optional[User] = None
    ) -> Inventory:
        """Update an inventory item"""
        inventory = self.get_inventory_by_id(inventory_id)

        changes = {}
        old_weight = inventory.weight
        old_status = inventory.status.name if inventory.status else None

        if data.weight is not None:
            changes["weight"] = {"old": inventory.weight, "new": data.weight}
            inventory.weight = data.weight
        if data.is_in_use is not None:
            changes["is_in_use"] = {"old": inventory.is_in_use, "new": data.is_in_use}
            inventory.is_in_use = data.is_in_use
        if data.status_name is not None:
            status = self.status_service.find_or_create(data.status_name)
            changes["status"] = {"old": old_status, "new": data.status_name}
            inventory.status_id = status.id
        if data.custom_properties is not None:
            inventory.custom_properties = data.custom_properties

        updated = self.inventory_repo.update(inventory)

        # Log the activity
        spool = inventory.spool
        spool_desc = (
            f"{spool.color.name} {spool.material.name}"
            if spool and spool.color and spool.material
            else "spool"
        )

        # Determine action type and description
        if data.weight is not None and data.weight != old_weight:
            weight_diff = old_weight - data.weight
            if weight_diff > 0:
                description = f"Used {weight_diff:.1f}g of {spool_desc} (remaining: {data.weight}g)"
                action_type = ActionType.WEIGHT_UPDATED
            else:
                description = (
                    f"Updated {spool_desc} weight from {old_weight}g to {data.weight}g"
                )
                action_type = ActionType.INVENTORY_UPDATED
        elif data.status_name is not None and data.status_name != old_status:
            description = f"Changed {spool_desc} status from '{old_status}' to '{data.status_name}'"
            action_type = ActionType.STATUS_CHANGED
        else:
            description = f"Updated {spool_desc} inventory item"
            action_type = ActionType.INVENTORY_UPDATED

        self._log_activity(
            action_type=action_type,
            description=description,
            entity_id=inventory_id,
            metadata=changes,
            user=user,
        )

        return updated

    def delete_inventory(self, inventory_id: str, user: Optional[User] = None) -> None:
        """Remove an inventory item"""
        inventory = self.get_inventory_by_id(inventory_id)

        # Capture info before deletion
        spool = inventory.spool
        spool_desc = (
            f"{spool.color.name} {spool.material.name}"
            if spool and spool.color and spool.material
            else "spool"
        )
        weight = inventory.weight

        self.inventory_repo.delete(inventory)

        # Log the activity
        self._log_activity(
            action_type=ActionType.INVENTORY_DELETED,
            description=f"Removed {spool_desc} ({weight}g) from inventory",
            entity_id=inventory_id,
            metadata={
                "spool_id": spool.id if spool else None,
                "weight": weight,
                "barcode": spool.barcode if spool else None,
            },
            user=user,
        )

    def count_by_spool(self, spool_id: str) -> int:
        """Count how many units of a spool type are in inventory"""
        return self.inventory_repo.count_by_spool_id(spool_id)
