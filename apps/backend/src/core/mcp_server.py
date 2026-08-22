from mcp.server.fastmcp import FastMCP
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Mount, Route
from src.services.rabbitmq import rabbitmq_service

mcp = FastMCP("Enterprise Tools")

@mcp.tool()
async def get_company_policy(policy_name: str) -> str:
    """Retrieve the content of a specific company policy document."""
    return f"Content of policy '{policy_name}': [Placeholder text for {policy_name}]"

@mcp.tool()
async def fetch_employee_data(employee_id: str) -> dict:
    """Fetch employee data from the legacy HR system."""
    return {"id": employee_id, "name": "Jane Smith", "department": "Engineering"}

@mcp.tool()
async def send_notification(user_id: str, message: str) -> str:
    """Send a notification to a user via the message queue."""
    await rabbitmq_service.publish("notification_queue", {"user_id": user_id, "message": message})
    return f"Notification sent to {user_id}"

@mcp.tool()
async def search_documents(query: str, top_k: int = 5) -> list:
    """Search the company's document repository using RAG."""
    return [{"title": f"Doc {i}", "content": f"Content for {query} - part {i}"} for i in range(top_k)]


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
