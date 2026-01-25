"""
AI Insights Service

Service for generating AI-powered insights using OpenAI.
"""

import json
import httpx
from typing import Optional
from datetime import datetime

from app.core.config import settings
from app.repositories.activity_log_repository import ActivityLogRepository
from app.repositories.insight_repository import InsightRepository
from app.repositories.job_repository import JobRepository
from app.repositories.inventory_repository import InventoryRepository
from app.models.insight import Insight
from app.models.job import Job, JobStatus, JobType
from app.services.activity_log_service import ActivityLogService


class AIInsightsService:
    """Service for generating AI-powered insights"""

    # System prompt for OpenAI
    SYSTEM_PROMPT = """You are an inventory management assistant for a 3D printing filament inventory system.

Your role is to analyze activity logs and provide actionable insights about:
1. Spools that may need replenishment soon based on usage patterns
2. Usage trends and patterns (which colors/materials are used most)
3. Inventory optimization recommendations
4. Any anomalies or concerns in the usage data

Be concise and actionable. Format your response as clear bullet points.
Focus on practical recommendations the user can act on immediately."""

    USER_PROMPT_TEMPLATE = """Based on the following activity logs from our 3D printing filament inventory system, provide insights and recommendations.

Current inventory summary:
- Total spools in inventory: {total_spools}
- Total weight available: {total_weight}g
- Spools currently in use: {in_use_count}

Recent activity logs (most recent first):
{activity_logs}

Please analyze this data and provide:
1. Any spools that may need reordering soon
2. Usage patterns or trends you notice
3. Recommendations for inventory management
4. Any concerns or anomalies"""

    def __init__(
        self,
        activity_log_repo: ActivityLogRepository,
        insight_repo: InsightRepository,
        job_repo: JobRepository,
        inventory_repo: InventoryRepository,
    ):
        self.activity_log_repo = activity_log_repo
        self.insight_repo = insight_repo
        self.job_repo = job_repo
        self.inventory_repo = inventory_repo
        self.activity_log_service = ActivityLogService(activity_log_repo)

    def _get_inventory_summary(self) -> dict:
        """Get current inventory summary for context"""
        inventory_items = self.inventory_repo.get_all(limit=1000)

        total_spools = len(inventory_items)
        total_weight = sum(item.weight for item in inventory_items)
        in_use_count = sum(1 for item in inventory_items if item.is_in_use)

        return {
            "total_spools": total_spools,
            "total_weight": round(total_weight, 2),
            "in_use_count": in_use_count,
        }

    def _build_prompt(self) -> str:
        """Build the prompt for OpenAI"""
        # Get activity logs
        logs = self.activity_log_repo.get_for_ai_analysis(limit=200)
        formatted_logs = self.activity_log_service.format_logs_for_ai(logs)

        # Get inventory summary
        summary = self._get_inventory_summary()

        return self.USER_PROMPT_TEMPLATE.format(
            total_spools=summary["total_spools"],
            total_weight=summary["total_weight"],
            in_use_count=summary["in_use_count"],
            activity_logs=formatted_logs,
        )

    async def _call_openai(self, prompt: str, stream: bool = False):
        """Call OpenAI API and return the response (streaming or non-streaming)"""
        if not settings.OPENAI_API_KEY:
            if stream:

                async def error_stream():
                    yield "⚠️ OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables to enable AI insights."

                return error_stream()
            return "⚠️ OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables to enable AI insights."

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.OPENAI_MODEL,
                    "messages": [
                        {"role": "system", "content": self.SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1000,
                    "stream": stream,
                },
            )

            if response.status_code != 200:
                error_detail = response.text
                if stream:

                    async def error_stream():
                        yield f"❌ OpenAI API error: {response.status_code} - {error_detail}"

                    return error_stream()
                raise Exception(
                    f"OpenAI API error: {response.status_code} - {error_detail}"
                )

            if stream:
                return response.aiter_lines()
            else:
                data = response.json()
                return data["choices"][0]["message"]["content"]

    async def generate_insight(
        self, job_id: Optional[str] = None, generated_by: str = "manual"
    ) -> Insight:
        """
        Generate a new AI insight.

        Args:
            job_id: Optional job ID if triggered by a job
            generated_by: How the insight was triggered ("manual", "scheduled", "openai")

        Returns:
            Created Insight with AI-generated content
        """
        prompt = self._build_prompt()

        try:
            content = await self._call_openai(prompt, stream=False)
        except Exception as e:
            content = f"❌ Failed to generate insight: {str(e)}"

        insight = Insight(
            content=content,
            job_id=job_id,
            generated_by=generated_by,
        )

        return self.insight_repo.create(insight)

    async def generate_insight_stream(self, generated_by: str = "manual"):
        """
        Generate a new AI insight with streaming response.

        Args:
            generated_by: How the insight was triggered ("manual", "scheduled", "openai")

        Yields:
            Server-sent events with streaming content and final insight data
        """
        prompt = self._build_prompt()
        accumulated_content = []

        try:
            stream = await self._call_openai(prompt, stream=True)

            async for line in stream:
                if not line:
                    continue

                # Remove 'data: ' prefix if present
                if line.startswith("data: "):
                    line = line[6:]

                # Check for stream end
                if line == "[DONE]":
                    break

                try:
                    chunk_data = json.loads(line)
                    if "choices" in chunk_data:
                        delta = chunk_data["choices"][0].get("delta", {})
                        if "content" in delta:
                            content_chunk = delta["content"]
                            accumulated_content.append(content_chunk)
                            # Send the chunk as SSE
                            yield f"data: {json.dumps({'type': 'content', 'content': content_chunk})}\n\n"
                except json.JSONDecodeError:
                    continue

            # After streaming completes, save the insight
            full_content = "".join(accumulated_content)
            if full_content:
                insight = Insight(
                    content=full_content,
                    job_id=None,
                    generated_by=generated_by,
                )
                saved_insight = self.insight_repo.create(insight)

                # Send the final insight data
                yield f"data: {json.dumps({'type': 'complete', 'insight': {'id': saved_insight.id, 'content': saved_insight.content, 'created_at': saved_insight.created_at.isoformat(), 'generated_by': saved_insight.generated_by}})}\n\n"

        except Exception as e:
            error_message = f"❌ Failed to generate insight: {str(e)}"
            yield f"data: {json.dumps({'type': 'error', 'error': error_message})}\n\n"

    def get_latest_insight(self) -> Optional[Insight]:
        """Get the most recent insight"""
        return self.insight_repo.get_latest()

    def get_recent_insights(self, limit: int = 10) -> list[Insight]:
        """Get recent insights"""
        return self.insight_repo.get_recent(limit)

    def create_insight_job(self) -> Job:
        """Create a job for generating insights (for background processing)"""
        job = Job(
            job_type=JobType.GENERATE_INSIGHTS,
            status=JobStatus.READY,
        )
        return self.job_repo.create(job)
