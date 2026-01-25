"""
Dashboard API Endpoints

Provides endpoints for dashboard data and AI insights.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import List

from app.schemas.dashboard import (
    DashboardResponse,
    InsightsHistoryResponse,
    GenerateInsightResponse,
    InventoryStats,
)
from app.schemas.activity_log import ActivityLogResponse
from app.schemas.insight import InsightResponse
from app.schemas.job import JobResponse
from app.services.dashboard_service import DashboardService
from app.services.ai_insights_service import AIInsightsService
from app.core.dependencies import (
    get_dashboard_service,
    get_ai_insights_service,
    require_action,
)
from app.core.authorization import Action
from app.models.user import User

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    service: DashboardService = Depends(get_dashboard_service),
    current_user: User = Depends(require_action(Action.READ_INVENTORY)),
):
    """
    Get dashboard data including stats, recent activity, and latest insight.

    Requires: read:inventory permission
    """
    try:
        stats = service.get_inventory_stats()
        recent_activity = service.get_recent_activity(limit=20)
        latest_insight = service.get_latest_insight()

        return DashboardResponse(
            stats=stats,
            recent_activity=recent_activity,
            latest_insight=latest_insight,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/stats", response_model=InventoryStats)
async def get_stats(
    service: DashboardService = Depends(get_dashboard_service),
    current_user: User = Depends(require_action(Action.READ_INVENTORY)),
):
    """
    Get inventory statistics only.

    Requires: read:inventory permission
    """
    try:
        return service.get_inventory_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/activity", response_model=List[ActivityLogResponse])
async def get_activity(
    limit: int = 50,
    service: DashboardService = Depends(get_dashboard_service),
    current_user: User = Depends(require_action(Action.READ_INVENTORY)),
):
    """
    Get recent activity logs.

    Requires: read:inventory permission
    """
    try:
        return service.get_recent_activity(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/insights", response_model=InsightsHistoryResponse)
async def get_insights_history(
    limit: int = 10,
    service: DashboardService = Depends(get_dashboard_service),
    current_user: User = Depends(require_action(Action.READ_INVENTORY)),
):
    """
    Get historical AI insights.

    Requires: read:inventory permission
    """
    try:
        insights = service.get_insights_history(limit=limit)
        return InsightsHistoryResponse(insights=insights)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/insights/latest", response_model=InsightResponse)
async def get_latest_insight(
    service: DashboardService = Depends(get_dashboard_service),
    current_user: User = Depends(require_action(Action.READ_INVENTORY)),
):
    """
    Get the most recent AI insight.

    Requires: read:inventory permission
    """
    try:
        insight = service.get_latest_insight()
        if not insight:
            raise HTTPException(status_code=404, detail="No insights available yet")
        return insight
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/insights/{insight_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_insight(
    insight_id: str,
    service: DashboardService = Depends(get_dashboard_service),
    current_user: User = Depends(require_action(Action.WRITE_INVENTORY)),
):
    """
    Delete an AI insight.

    Requires: write:inventory permission
    """
    try:
        deleted = service.delete_insight(insight_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Insight not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/insights/generate", response_model=GenerateInsightResponse)
async def generate_insight(
    ai_service: AIInsightsService = Depends(get_ai_insights_service),
    current_user: User = Depends(require_action(Action.WRITE_INVENTORY)),
):
    """
    Generate a new AI insight immediately (synchronous).

    This endpoint calls OpenAI directly and waits for the response.
    May take 5-10 seconds to complete.

    Requires: write:inventory permission
    """
    try:
        insight = await ai_service.generate_insight(generated_by="manual")
        return GenerateInsightResponse(
            insight=insight,
            message="Insight generated successfully",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate insight: {str(e)}"
        )


@router.post("/insights/generate/stream")
async def generate_insight_stream(
    ai_service: AIInsightsService = Depends(get_ai_insights_service),
    current_user: User = Depends(require_action(Action.WRITE_INVENTORY)),
):
    """
    Generate a new AI insight with streaming response.

    This endpoint streams the AI response as it's generated.

    Requires: write:inventory permission
    """
    try:
        return StreamingResponse(
            ai_service.generate_insight_stream(generated_by="manual"),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate insight: {str(e)}"
        )


@router.get("/jobs", response_model=List[JobResponse])
async def get_jobs(
    limit: int = 20,
    service: DashboardService = Depends(get_dashboard_service),
    current_user: User = Depends(require_action(Action.READ_INVENTORY)),
):
    """
    Get recent jobs and their status.

    Requires: read:inventory permission
    """
    try:
        return service.get_recent_jobs(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
