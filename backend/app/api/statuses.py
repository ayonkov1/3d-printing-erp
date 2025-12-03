from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.schemas.status import StatusCreate, StatusResponse
from app.services.status_service import StatusService
from app.core.dependencies import get_status_service

router = APIRouter(prefix="/api/statuses", tags=["Statuses"])


@router.post("/", response_model=StatusResponse, status_code=201)
async def create_status(
    status_data: StatusCreate,
    service: StatusService = Depends(get_status_service),
):
    """Create a new status."""
    try:
        status = service.create_status(status_data.name)
        return status
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[StatusResponse])
async def get_statuses(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    service: StatusService = Depends(get_status_service),
):
    """Get all statuses with pagination."""
    try:
        statuses = service.get_all_statuses(skip, limit)
        return statuses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{status_id}", response_model=StatusResponse)
async def get_status(
    status_id: str,
    service: StatusService = Depends(get_status_service),
):
    """Get a single status by ID."""
    try:
        status = service.get_status_by_id(status_id)
        return status
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
