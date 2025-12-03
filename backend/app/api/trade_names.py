from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from app.schemas.trade_name import TradeNameCreate, TradeNameResponse
from app.services.trade_name_service import TradeNameService
from app.core.dependencies import get_trade_name_service

router = APIRouter(prefix="/api/trade-names", tags=["Trade Names"])


@router.post("/", response_model=TradeNameResponse, status_code=201)
async def create_trade_name(
    trade_name_data: TradeNameCreate,
    service: TradeNameService = Depends(get_trade_name_service),
):
    """Create a new trade name."""
    try:
        trade_name = service.create_trade_name(trade_name_data.name)
        return trade_name
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[TradeNameResponse])
async def get_trade_names(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    service: TradeNameService = Depends(get_trade_name_service),
):
    """Get all trade names with pagination."""
    try:
        trade_names = service.get_all_trade_names(skip, limit)
        return trade_names
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{trade_name_id}", response_model=TradeNameResponse)
async def get_trade_name(
    trade_name_id: str,
    service: TradeNameService = Depends(get_trade_name_service),
):
    """Get a single trade name by ID."""
    try:
        trade_name = service.get_trade_name_by_id(trade_name_id)
        return trade_name
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
