from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.core.database import get_db
from src.models.models import AgentLog
import datetime

router = APIRouter()

class ConversationResponse(BaseModel):
    id: int
    query: str
    response: str
    created_at: datetime.datetime

@router.get("/history", response_model=list[ConversationResponse])
async def get_conversation_history(limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AgentLog).order_by(AgentLog.created_at.desc()).limit(limit)
    )
    logs = result.scalars().all()
    return [ConversationResponse(id=l.id, query=l.query, response=l.response, created_at=l.created_at) for l in logs]
