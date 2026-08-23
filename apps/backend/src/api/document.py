from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete
from src.core.database import get_db
from src.models.models import Document

router = APIRouter()

class DocumentRequest(BaseModel):
    title: str
    content: str

class DocumentResponse(BaseModel):
    id: int
    title: str
    content: str

class DocumentStatsResponse(BaseModel):
    total: int
    last_update: str | None

@router.post("/", response_model=DocumentResponse)
async def create_document(request: DocumentRequest, db: AsyncSession = Depends(get_db)):
    doc = Document(title=request.title, content=request.content)
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return DocumentResponse(id=doc.id, title=doc.title, content=doc.content)

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == document_id, Document.is_active == True))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse(id=doc.id, title=doc.title, content=doc.content)

@router.get("/", response_model=list[DocumentResponse])
async def list_documents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.is_active == True).order_by(Document.created_at.desc()))
    docs = result.scalars().all()
    return [DocumentResponse(id=d.id, title=d.title, content=d.content) for d in docs]

@router.get("/stats", response_model=DocumentStatsResponse)
async def get_document_stats(db: AsyncSession = Depends(get_db)):
    count_result = await db.execute(select(func.count(Document.id)).where(Document.is_active == True))
    total = count_result.scalar_one_or_none() or 0
    last_result = await db.execute(select(func.max(Document.updated_at)).where(Document.is_active == True))
    last_update = last_result.scalar_one_or_none()
    return DocumentStatsResponse(total=total, last_update=last_update.isoformat() if last_update else None)

@router.delete("/{document_id}")
async def delete_document(document_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.is_active = False
    await db.commit()
    return {"message": "Document deleted"}
