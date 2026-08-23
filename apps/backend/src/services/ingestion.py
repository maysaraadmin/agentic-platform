import os
import json
import asyncio
import logging
from typing import List
from langchain_community.vectorstores import PGVector
from langchain_ollama import OllamaEmbeddings
from langchain_core.documents import Document

logger = logging.getLogger(__name__)

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "agentic_db")

embeddings = OllamaEmbeddings(base_url=OLLAMA_HOST, model=OLLAMA_MODEL)
connection_string = f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
vectorstore = PGVector(
    collection_name="company_docs",
    connection_string=connection_string,
    embedding_function=embeddings,
)


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        start = end - overlap
    return chunks


async def ingest_file(filename: str, content: str, metadata: dict = None) -> int:
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
