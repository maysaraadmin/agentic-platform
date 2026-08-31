from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.models.models import AgentLog

router = APIRouter()


class ConversationResponse(BaseModel):
    id: int
    query: str
    response: str
    created_at: datetime

@router.get("/history", response_model=list[ConversationResponse])
async def get_conversation_history(limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AgentLog).order_by(AgentLog.created_at.desc()).limit(limit)
    )
    logs = result.scalars().all()
    return [ConversationResponse(id=l.id, query=l.query, response=l.response, created_at=l.created_at) for l in logs]
