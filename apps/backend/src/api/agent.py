from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from src.agents.langgraph_agent import agent_graph, AgentState
from src.core.a2a_agent import OrchestratorAgent
from src.services.rabbitmq import rabbitmq_service

router = APIRouter()
orchestrator = OrchestratorAgent()

class AgentRequest(BaseModel):
    query: str
    agent_type: Optional[str] = "general"

class AgentResponse(BaseModel):
    response: str
    context: Optional[str] = None

@router.post("/invoke", response_model=AgentResponse)
async def invoke_agent(request: AgentRequest, background_tasks: BackgroundTasks):
    initial_state = {
        "messages": [{"role": "user", "content": request.query}],
        "context": "",
        "next_step": "start"
    }
    try:
        final_state = agent_graph.invoke(initial_state)
        response = final_state["messages"][-1]["content"]
        context = final_state.get("context", "")
        return AgentResponse(response=response, context=context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
