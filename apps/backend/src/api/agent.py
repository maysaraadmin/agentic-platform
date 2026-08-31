import json
import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import StreamingResponse

from src.agents.langgraph_agent import agent_graph
from src.core.a2a_agent import orchestrator
from src.core.auth import get_current_active_user
from src.core.database import get_db
from src.core.rate_limit import limiter
from src.models.models import AgentLog
from src.services.rabbitmq import rabbitmq_service

router = APIRouter()
logger = logging.getLogger(__name__)


class AgentRequest(BaseModel):
    query: str = ""
    agent_type: str = "general"
    messages: list[dict] | None = None

    @property
    def effective_query(self) -> str:
        if self.messages and len(self.messages) > 0:
            return self.messages[-1].get("content", self.query)
        return self.query


class AgentResponse(BaseModel):
    response: str
    context: str | None = None


@router.post("/invoke", response_model=AgentResponse)
@limiter.limit("10/minute")
async def invoke_agent(
    request: Request,
    agent_request: AgentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    query = agent_request.effective_query.strip()
    if not query or len(query) > 2000:
        raise HTTPException(status_code=400, detail="Query must be between 1 and 2000 characters")

    initial_state = {"messages": [{"role": "user", "content": query}], "context": ""}
    try:
        final_state = await agent_graph.ainvoke(initial_state)
        response = final_state["messages"][-1]["content"]
        context = final_state.get("context", "")
        agent_log = AgentLog(
            agent_type=agent_request.agent_type,
            query=query,
            response=response,
            user_id=current_user["id"],
        )
        db.add(agent_log)
        await db.commit()
        return AgentResponse(response=response, context=context)
    except Exception:
        logger.exception("Agent invocation failed")
        raise HTTPException(status_code=500, detail="Agent invocation failed")


@router.post("/stream")
@limiter.limit("5/minute")
async def stream_agent(
    request: Request,
    agent_request: AgentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    query = agent_request.effective_query.strip()
    if not query or len(query) > 2000:
        raise HTTPException(status_code=400, detail="Query must be between 1 and 2000 characters")

    async def event_generator():
        initial_state = {"messages": [{"role": "user", "content": query}], "context": ""}
        seen_chunks: set[str] = set()
        full_response = ""
        try:
            if hasattr(agent_graph, "astream_events"):
                async for event in agent_graph.astream_events(initial_state, version="v1"):
                    kind = event.get("event")
                    if kind == "on_chat_model_stream":
                        token = event.get("data", {}).get("chunk", "")
                        if token and token not in seen_chunks:
                            seen_chunks.add(token)
                            full_response += token
                            yield f"data: {json.dumps({'chunk': token})}\n\n"
            else:
                async for chunk in agent_graph.astream(initial_state):
                    for node_state in chunk.values():
                        messages = node_state.get("messages", [])
                        if messages and messages[-1].get("role") == "assistant":
                            content = messages[-1].get("content", "")
                            if content and content not in seen_chunks:
                                seen_chunks.add(content)
                                full_response += content
                                yield f"data: {json.dumps({'chunk': content})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
            agent_log = AgentLog(
                agent_type=agent_request.agent_type,
                query=query,
                response=full_response,
                user_id=current_user["id"],
            )
            db.add(agent_log)
            await db.commit()
        except Exception:
            logger.exception("Streaming failed")
            yield f"data: {json.dumps({'error': 'Streaming failed'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/invoke-async")
@limiter.limit("5/minute")
async def invoke_agent_async(
    request: Request,
    agent_request: AgentRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_active_user),
):
    background_tasks.add_task(
        rabbitmq_service.publish,
        "agent_tasks",
        {
            "query": agent_request.query,
            "agent_type": agent_request.agent_type,
            "user_id": current_user["id"],
        },
    )
    return {"status": "queued", "message": "Your request has been queued."}


@router.post("/a2a/route")
async def route_via_a2a(agent_request: AgentRequest, current_user: dict = Depends(get_current_active_user)):
    response = await orchestrator.process_request(agent_request.query)
    return {"response": response}
