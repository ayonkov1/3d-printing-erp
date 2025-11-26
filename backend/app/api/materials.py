from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.schemas.material import MaterialCreate, MaterialResponse
from app.services.material_service import MaterialService
from app.core.dependencies import get_material_service

router = APIRouter(prefix="/api/materials", tags=["Materials"])


@router.post("/", response_model=MaterialResponse, status_code=201)
async def create_material(
    material_data: MaterialCreate,
    service: MaterialService = Depends(get_material_service),
):
    """
    Create a new material.

    Returns the created material with its ID.
    """
    try:
        material = service.create_material(material_data.name)
        return material
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[MaterialResponse])
async def get_materials(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    service: MaterialService = Depends(get_material_service),
):
    """
    Get all materials with pagination.
    """
    try:
        materials = service.get_all_materials(skip, limit)
        return materials
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{material_id}", response_model=MaterialResponse)
async def get_material(
    material_id: str,
    service: MaterialService = Depends(get_material_service),
):
    """Get a single material by ID"""
    try:
        material = service.get_material_by_id(material_id)
        return material
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
