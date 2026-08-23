from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database import get_db
from src.core.rate_limit import limiter
from src.agents.langgraph_agent import agent_graph, AgentState
from src.core.a2a_agent import OrchestratorAgent
from src.services.rabbitmq import rabbitmq_service
from src.models.models import AgentLog
from starlette.responses import StreamingResponse
import json

router = APIRouter()
orchestrator = OrchestratorAgent()

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
async def invoke_agent(request: Request, agent_request: AgentRequest, db: AsyncSession = Depends(get_db)):
    query = agent_request.effective_query.strip()
    if not query or len(query) > 2000:
        raise HTTPException(status_code=400, detail="Query must be between 1 and 2000 characters")

    initial_state = {
        "messages": [{"role": "user", "content": query}],
        "context": "",
        "next_step": "start"
    }
    try:
        final_state = await agent_graph.ainvoke(initial_state)
        response = final_state["messages"][-1]["content"]
        context = final_state.get("context", "")
        agent_log = AgentLog(
            agent_type=agent_request.agent_type,
            query=query,
            response=response,
            user_id="current-user",
        )
        db.add(agent_log)
        await db.commit()
        return AgentResponse(response=response, context=context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stream")
@limiter.limit("5/minute")
async def stream_agent(request: Request, agent_request: AgentRequest, db: AsyncSession = Depends(get_db)):
    query = agent_request.effective_query.strip()
    if not query or len(query) > 2000:
        raise HTTPException(status_code=400, detail="Query must be between 1 and 2000 characters")

    async def event_generator():
        initial_state = {
            "messages": [{"role": "user", "content": query}],
            "context": "",
            "next_step": "start"
        }
        seen_chunks = []
        full_response = ""
        try:
            if hasattr(agent_graph, "astream_events"):
                async for event in agent_graph.astream_events(initial_state, version="v1"):
                    kind = event.get("event")
                    if kind == "on_chat_model_stream":
                        token = event.get("data", {}).get("chunk", "")
                        if token and (not seen_chunks or token != seen_chunks[-1]):
                            seen_chunks.append(token)
                            full_response += token
                            yield f"data: {json.dumps({'chunk': token})}\n\n"
            else:
                async for chunk in agent_graph.astream(initial_state):
                    for node_name, node_state in chunk.items():
                        messages = node_state.get("messages", [])
                        if messages and messages[-1].get("role") == "assistant":
                            content = messages[-1].get("content", "")
                            if content and (not seen_chunks or content != seen_chunks[-1]):
                                seen_chunks.append(content)
                                full_response += content
                                yield f"data: {json.dumps({'chunk': content})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
            agent_log = AgentLog(
                agent_type=agent_request.agent_type,
                query=query,
                response=full_response,
                user_id="current-user",
            )
            db.add(agent_log)
            await db.commit()
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/invoke-async")
async def invoke_agent_async(request: AgentRequest, background_tasks: BackgroundTasks):
    await rabbitmq_service.publish(
        "agent_tasks",
        {
            "query": request.query,
            "agent_type": request.agent_type,
            "user_id": "user-123"
        }
    )
    return {"status": "queued", "message": "Your request has been queued."}

@router.post("/a2a/route")
async def route_via_a2a(request: AgentRequest):
    response = await orchestrator.process_request(request.query)
    return {"response": response}
