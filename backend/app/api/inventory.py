from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.schemas.inventory import InventoryCreate, InventoryUpdate, InventoryResponse
from app.services.inventory_service import InventoryService
from app.core.dependencies import get_inventory_service

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.post("/", response_model=InventoryResponse, status_code=201)
async def add_to_inventory(
    inventory_data: InventoryCreate,
    service: InventoryService = Depends(get_inventory_service),
):
    """
    Add a spool to inventory.
    
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
):
    """Get all inventory items with pagination."""
    try:
        inventory = service.get_all_inventory(skip, limit)
        return inventory
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/in-use", response_model=List[InventoryResponse])
async def get_in_use_inventory(
    service: InventoryService = Depends(get_inventory_service),
):
    """Get all inventory items currently in use."""
    try:
        inventory = service.get_in_use_inventory()
        return inventory
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/by-spool/{spool_id}", response_model=List[InventoryResponse])
async def get_inventory_by_spool(
    spool_id: str,
    service: InventoryService = Depends(get_inventory_service),
):
    """Get all inventory items for a specific spool type."""
    try:
        inventory = service.get_inventory_by_spool(spool_id)
        return inventory
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/count/{spool_id}")
async def count_inventory_by_spool(
    spool_id: str,
    service: InventoryService = Depends(get_inventory_service),
):
    """Count how many units of a spool type are in inventory."""
    try:
        count = service.count_by_spool(spool_id)
        return {"spool_id": spool_id, "count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{inventory_id}", response_model=InventoryResponse)
async def get_inventory_item(
    inventory_id: str,
    service: InventoryService = Depends(get_inventory_service),
):
    """Get a single inventory item by ID."""
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
):
    """Update an inventory item (weight, status, etc.)."""
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
):
    """Remove an inventory item."""
    try:
        service.delete_inventory(inventory_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
