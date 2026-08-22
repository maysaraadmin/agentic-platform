from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2AuthorizationCodeBearer
from contextlib import asynccontextmanager
import logging

from src.api import agent, document, health
from src.core.database import engine, Base
from src.core.mcp_server import mcp_app
from src.services.rabbitmq import rabbitmq_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await rabbitmq_service.connect()
    logger.info("Application startup complete.")
    yield
    await rabbitmq_service.close()
    logger.info("Application shutdown complete.")

app = FastAPI(
    title="Agentic Enterprise API",
    description="API for AI Agent Orchestration with MCP, A2A, and RAG",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize",
    tokenUrl="https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token",
)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    return {"id": "user-123", "name": "John Doe", "roles": ["user"]}

app.include_router(health.router, tags=["Health"])
app.include_router(agent.router, prefix="/api/v1/agents", tags=["Agents"], dependencies=[Depends(get_current_user)])
app.include_router(document.router, prefix="/api/v1/documents", tags=["Documents"], dependencies=[Depends(get_current_user)])

app.mount("/mcp", mcp_app)

@app.get("/")
async def root():
    return {"message": "Agentic Enterprise Platform API"}
