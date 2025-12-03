from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.schemas.category import CategoryCreate, CategoryResponse
from app.services.category_service import CategoryService
from app.core.dependencies import get_category_service

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.post("/", response_model=CategoryResponse, status_code=201)
async def create_category(
    category_data: CategoryCreate,
    service: CategoryService = Depends(get_category_service),
):
    """Create a new category."""
    try:
        category = service.create_category(category_data.name)
        return category
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[CategoryResponse])
async def get_categories(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    service: CategoryService = Depends(get_category_service),
):
    """Get all categories with pagination."""
    try:
        categories = service.get_all_categories(skip, limit)
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: str,
    service: CategoryService = Depends(get_category_service),
):
    """Get a single category by ID."""
    try:
        category = service.get_category_by_id(category_id)
        return category
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
