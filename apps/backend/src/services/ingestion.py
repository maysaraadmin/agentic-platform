import asyncio
import logging

from langchain_core.documents import Document

from src.agents.langgraph_agent import vectorstore

logger = logging.getLogger(__name__)


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Split text into overlapping chunks."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    overlap = max(0, min(overlap, chunk_size - 1))
    chunks: list[str] = []
    start = 0
    text_len = len(text)
    while start < text_len:
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        next_start = end - overlap
        if next_start <= start:
            next_start = start + chunk_size
        start = next_start
    return chunks


async def ingest_file(filename: str, content: str, metadata: dict | None = None) -> int:
    """Ingest a file into the vector store. Returns number of chunks created."""
    chunks = chunk_text(content)
    if not chunks:
        return 0

    documents = []
    for i, chunk in enumerate(chunks):
        doc = Document(
            page_content=chunk,
            metadata={
                "source": filename,
                "chunk_index": i,
                "total_chunks": len(chunks),
                **(metadata or {}),
            },
        )
        documents.append(doc)

    await asyncio.to_thread(vectorstore.add_documents, documents)
    logger.info("Ingested %s: %d chunks", filename, len(chunks))
    return len(chunks)
