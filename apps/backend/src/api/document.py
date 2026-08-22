from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database import get_db

router = APIRouter()

class DocumentRequest(BaseModel):
    title: str
    content: str

class DocumentResponse(BaseModel):
    id: int
    title: str
    content: str

@router.post("/", response_model=DocumentResponse)
async def create_document(request: DocumentRequest, db: AsyncSession = Depends(get_db)):
    return {"id": 1, "title": request.title, "content": request.content}

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: int, db: AsyncSession = Depends(get_db)):
    return {"id": document_id, "title": "Sample", "content": "Content"}
