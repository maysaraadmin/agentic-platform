from mcp.server.fastmcp import FastMCP
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Mount, Route
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from src.services.rabbitmq import rabbitmq_service
from src.core.database import get_db
from src.models.models import Document, Employee
from src.agents.langgraph_agent import vectorstore

mcp = FastMCP("Enterprise Tools")

@mcp.tool()
async def get_company_policy(policy_name: str) -> str:
    """Retrieve the content of a specific company policy document."""
    async for db in get_db():
        result = await db.execute(
            select(Document).where(
                Document.is_active == True,
                Document.title.ilike(f"%{policy_name}%")
            ).limit(1)
        )
        doc = result.scalar_one_or_none()
        if doc:
            return f"Policy: {doc.title}\n\n{doc.content}"
        return f"No policy found matching '{policy_name}'"

@mcp.tool()
async def fetch_employee_data(employee_id: str) -> dict:
    """Fetch employee data from the HR system."""
    async for db in get_db():
        result = await db.execute(
            select(Employee).where(Employee.employee_id == employee_id, Employee.is_active == True)
        )
        emp = result.scalar_one_or_none()
        if emp:
            return {
                "id": emp.employee_id,
                "name": emp.name,
                "department": emp.department,
                "email": emp.email,
            }
        return {"error": f"Employee {employee_id} not found"}

@mcp.tool()
async def send_notification(user_id: str, message: str) -> str:
    """Send a notification to a user via the message queue."""
    await rabbitmq_service.publish("notification_queue", {"user_id": user_id, "message": message})
    return f"Notification sent to {user_id}"

@mcp.tool()
async def search_documents(query: str, top_k: int = 5) -> list:
    """Search the company's document repository using RAG."""
    docs = await asyncio.to_thread(vectorstore.similarity_search, query, k=top_k)
    return [
        {
            "title": doc.metadata.get("source", "Unknown"),
            "content": doc.page_content[:500],
            "score": doc.metadata.get("score", 0.0),
        }
        for doc in docs
    ]


sse = SseServerTransport("/messages/")


async def handle_sse(request):
    async with sse.connect_sse(
        request.scope, request.receive, request._send
    ) as streams:
        await mcp._mcp_server.run(
            streams[0],
            streams[1],
            mcp._mcp_server.create_initialization_options(),
        )


mcp_app = Starlette(
    routes=[
        Route("/sse", endpoint=handle_sse),
        Mount("/messages/", app=sse.handle_post_message),
    ],
)
