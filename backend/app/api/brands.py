from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.schemas.brand import BrandCreate, BrandResponse
from app.services.brand_service import BrandService
from app.core.dependencies import get_brand_service

router = APIRouter(prefix="/api/brands", tags=["Brands"])


@router.post("/", response_model=BrandResponse, status_code=201)
async def create_brand(
    brand_data: BrandCreate,
    service: BrandService = Depends(get_brand_service),
):
    """
    Create a new brand.

    Returns the created brand with its ID.
    """
    try:
        brand = service.create_brand(brand_data.name)
        return brand
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[BrandResponse])
async def get_brands(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    service: BrandService = Depends(get_brand_service),
):
    """
    Get all brands with pagination.
    """
    try:
        brands = service.get_all_brands(skip, limit)
        return brands
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{brand_id}", response_model=BrandResponse)
async def get_brand(
    brand_id: str,
    service: BrandService = Depends(get_brand_service),
):
    """Get a single brand by ID"""
    try:
        brand = service.get_brand_by_id(brand_id)
        return brand
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
