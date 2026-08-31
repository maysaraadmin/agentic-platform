from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.agents.langgraph_agent import agent_graph
from src.core.a2a_agent import orchestrator
from src.core.database import get_db
from src.core.mcp_server import mcp
from src.models.models import Document
from src.services.rabbitmq import rabbitmq_service

router = APIRouter()


class HealthResponse(BaseModel):
    status: str


class AgentHealthResponse(BaseModel):
    name: str
    active: bool


class DashboardStatsResponse(BaseModel):
    system_status: str
    agents: list[AgentHealthResponse]
    documents_total: int
    documents_last_update: str | None


@router.get("/", response_model=HealthResponse)
async def health_check():
    return {"status": "ok"}


@router.get("/dashboard", response_model=DashboardStatsResponse)
async def dashboard_stats(db: AsyncSession = Depends(get_db)):
    db_ok = True
    total = 0
    last_update_str = None
    try:
        count_result = await db.execute(
            select(func.count()).where(Document.is_active == True)
        )
        total = count_result.scalar_one_or_none() or 0
        last_result = await db.execute(
            select(func.max(Document.updated_at)).where(Document.is_active == True)
        )
        last_update = last_result.scalar_one_or_none()
        last_update_str = last_update.isoformat() if last_update else None
    except Exception:
        db_ok = False

    mq_ok = rabbitmq_service.channel is not None

    return DashboardStatsResponse(
        system_status="ok" if (db_ok and mq_ok) else "degraded",
        agents=[
            AgentHealthResponse(name="Database", active=db_ok),
            AgentHealthResponse(name="Message Queue", active=mq_ok),
            AgentHealthResponse(name="A2A Orchestrator", active=orchestrator is not None),
            AgentHealthResponse(name="LangGraph Agent", active=agent_graph is not None),
            AgentHealthResponse(name="MCP Server", active=mcp is not None),
        ],
        documents_total=total,
        documents_last_update=last_update_str,
    )
