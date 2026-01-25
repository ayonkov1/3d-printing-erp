"""
Dashboard Schemas
"""

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.schemas.activity_log import ActivityLogResponse
from app.schemas.insight import InsightResponse


class InventoryStats(BaseModel):
    """Summary statistics for inventory"""

    total_spools: int
    total_weight: float
    spools_in_use: int
    low_stock_count: int  # spools with weight < 20% of base weight


class DashboardResponse(BaseModel):
    """Dashboard data response"""

    stats: InventoryStats
    recent_activity: List[ActivityLogResponse]
    latest_insight: Optional[InsightResponse]


class InsightsHistoryResponse(BaseModel):
    """Historical insights response"""

    insights: List[InsightResponse]


class GenerateInsightResponse(BaseModel):
    """Response after generating insight"""

    insight: InsightResponse
    message: str
