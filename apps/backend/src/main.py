import logging
import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.responses import JSONResponse

from src.api import agent, auth, conversations, document, health
from src.core.auth import get_current_active_user
from src.core.database import Base, engine
from src.core.logging import setup_logging
from src.core.mcp_server import mcp_app
from src.core.rate_limit import limiter
from src.services.rabbitmq import rabbitmq_service

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    try:
        await rabbitmq_service.connect()
    except Exception:
        logger.warning("RabbitMQ unavailable at startup; messaging features will be degraded")
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

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:4200,http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(agent.router, prefix="/api/v1/agents", tags=["Agents"], dependencies=[Depends(get_current_active_user)])
app.include_router(document.router, prefix="/api/v1/documents", tags=["Documents"], dependencies=[Depends(get_current_active_user)])
app.include_router(conversations.router, prefix="/api/v1/conversations", tags=["Conversations"], dependencies=[Depends(get_current_active_user)])

app.mount("/mcp", mcp_app)


@app.get("/")
async def root():
    return {"message": "Agentic Enterprise Platform API"}
