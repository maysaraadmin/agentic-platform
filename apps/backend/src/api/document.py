from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
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

@router.delete("/{document_id}")
async def delete_document(document_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.is_active = False
    await db.commit()
    return {"message": "Document deleted"}
