"""
Inventory API Endpoints

Authorization is enforced using the centralized authorization module:
- READ endpoints require: read:inventory permission (all roles)
- WRITE endpoints require: write:inventory permission (member, admin)
- DELETE endpoints require: delete:inventory permission (admin only)
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryResponse
from app.services.inventory_service import InventoryService
from app.core.dependencies import (
    get_inventory_service,
    require_action,
)
from app.core.authorization import Action
from app.models.user import User

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.post("/", response_model=InventoryResponse, status_code=201)
async def add_to_inventory(
    inventory_data: InventoryCreate,
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(require_action(Action.WRITE_INVENTORY)),
):
    """
    Add a spool to inventory.

    Requires: write:inventory permission (member or admin role)
    
    Provide the spool_id (from the catalog) to add a physical unit to inventory.
    If weight is not provided, it defaults to the spool's base_weight.
    """
    try:
        inventory = service.add_to_inventory(inventory_data)
        return inventory
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[InventoryResponse])
async def get_inventory(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(require_action(Action.READ_INVENTORY)),
):
    """
    Get all inventory items with pagination.
    
    Requires: read:inventory permission (all authenticated users)
    """
    try:
        inventory = service.get_all_inventory(skip, limit)
        return inventory
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/in-use", response_model=List[InventoryResponse])
async def get_in_use_inventory(
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(require_action(Action.READ_INVENTORY)),
):
    """
    Get all inventory items currently in use.
    
    Requires: read:inventory permission (all authenticated users)
    """
    try:
        inventory = service.get_in_use_inventory()
        return inventory
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/by-spool/{spool_id}", response_model=List[InventoryResponse])
async def get_inventory_by_spool(
    spool_id: str,
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(require_action(Action.READ_INVENTORY)),
):
    """
    Get all inventory items for a specific spool type.
    
    Requires: read:inventory permission (all authenticated users)
    """
    try:
        inventory = service.get_inventory_by_spool(spool_id)
        return inventory
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/count/{spool_id}")
async def count_inventory_by_spool(
    spool_id: str,
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(require_action(Action.READ_INVENTORY)),
):
    """
    Count how many units of a spool type are in inventory.
    
    Requires: read:inventory permission (all authenticated users)
    """
    try:
        count = service.count_by_spool(spool_id)
        return {"spool_id": spool_id, "count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{inventory_id}", response_model=InventoryResponse)
async def get_inventory_item(
    inventory_id: str,
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(require_action(Action.READ_INVENTORY)),
):
    """
    Get a single inventory item by ID.
    
    Requires: read:inventory permission (all authenticated users)
    """
    try:
        inventory = service.get_inventory_by_id(inventory_id)
        return inventory
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.patch("/{inventory_id}", response_model=InventoryResponse)
async def update_inventory_item(
    inventory_id: str,
    update_data: InventoryUpdate,
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(require_action(Action.WRITE_INVENTORY)),
):
    """
    Update an inventory item (weight, status, etc.).
    
    Requires: write:inventory permission (member or admin role)
    """
    try:
        inventory = service.update_inventory(inventory_id, update_data)
        return inventory
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{inventory_id}", status_code=204)
async def delete_inventory_item(
    inventory_id: str,
    service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(require_action(Action.DELETE_INVENTORY)),
):
    """
    Remove an inventory item.
    
    Requires: delete:inventory permission (admin only)
    """
    try:
        service.delete_inventory(inventory_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
