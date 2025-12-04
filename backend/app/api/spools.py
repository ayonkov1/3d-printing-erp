from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.schemas.spool import SpoolCreate, SpoolResponse
from app.services.spool_service import SpoolService
from app.core.dependencies import get_spool_service

router = APIRouter(prefix="/api/spools", tags=["Spools"])


@router.post("/", response_model=SpoolResponse, status_code=201)
async def create_spool(
    spool_data: SpoolCreate,
    service: SpoolService = Depends(get_spool_service),  # DI magic!
):
    """
    Create new spool with automatic find-or-create for lookup tables.

    Process:
    - If color doesn't exist, creates it
    - If brand doesn't exist, creates it
    - If material doesn't exist, creates it
    - Creates the spool

    Returns complete spool data with nested relationships.
    """
    try:
        spool = service.create_spool(spool_data)
        return spool
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[SpoolResponse])
async def get_spools(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    barcode: Optional[str] = Query(None, description="Filter by exact barcode match"),
    service: SpoolService = Depends(get_spool_service),
):
    """
    Get all spools with pagination.

    Optionally filter by barcode for exact match lookup.
    Returns spools with complete nested data (color, brand, material).
    Perfect for displaying in a table view.
    """
    try:
        if barcode:
            spool = service.get_spool_by_barcode(barcode)
            return [spool] if spool else []
        spools = service.get_all_spools(skip, limit)
        return spools
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{spool_id}", response_model=SpoolResponse)
async def get_spool(spool_id: str, service: SpoolService = Depends(get_spool_service)):
    """Get single spool by ID"""
    try:
        spool = service.get_spool_by_id(spool_id)
        return spool
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
