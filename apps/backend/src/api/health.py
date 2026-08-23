from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from src.core.database import get_db
from src.models.models import Document, AgentLog

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
    doc_count = await db.execute(select(func.count(Document.id)).where(Document.is_active == True))
    total = doc_count.scalar_one_or_none() or 0
    last_update = await db.execute(select(func.max(Document.updated_at)).where(Document.is_active == True))
    last_update_str = last_update.scalar_one_or_none()
    return DashboardStatsResponse(
        system_status="ok",
        agents=[
            AgentHealthResponse(name="LangGraph", active=True),
            AgentHealthResponse(name="A2A Orchestrator", active=True),
            AgentHealthResponse(name="MCP Server", active=True),
        ],
        documents_total=total,
        documents_last_update=last_update_str.isoformat() if last_update_str else None,
    )
