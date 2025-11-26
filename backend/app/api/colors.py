from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.schemas.color import ColorCreate, ColorResponse
from app.services.color_service import ColorService
from app.core.dependencies import get_color_service

router = APIRouter(prefix="/api/colors", tags=["Colors"])


@router.post("/", response_model=ColorResponse, status_code=201)
async def create_color(
    color_data: ColorCreate,
    service: ColorService = Depends(get_color_service),
):
    """
    Create a new color.

    Returns the created color with its ID.
    """
    try:
        color = service.create_color(color_data.name, color_data.hex_code)
        return color
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[ColorResponse])
async def get_colors(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    service: ColorService = Depends(get_color_service),
):
    """
    Get all colors with pagination.
    """
    try:
        colors = service.get_all_colors(skip, limit)
        return colors
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{color_id}", response_model=ColorResponse)
async def get_color(
    color_id: str,
    service: ColorService = Depends(get_color_service),
):
    """Get a single color by ID"""
    try:
        color = service.get_color_by_id(color_id)
        return color
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
