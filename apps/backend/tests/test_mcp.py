import pytest
from httpx import ASGITransport, AsyncClient
from starlette.routing import Mount

from src.core.mcp_server import mcp
from src.main import app


@pytest.mark.asyncio
async def test_mcp_sse_endpoint():
    # The MCP SSE app must be mounted under /mcp (see src/main.py app.mount).
    assert any(
        isinstance(route, Mount) and route.path == "/mcp" for route in app.routes
    )

    # mcp_server.py registers tools on the shared FastMCP instance; verify them.
    tools = await mcp.list_tools()
    tool_names = {tool.name for tool in tools}
    assert {
        "search_documents",
        "get_company_policy",
        "fetch_employee_data",
        "send_notification",
    } <= tool_names


@pytest.mark.asyncio
async def test_mcp_sse_host_validation():
    # MCP 1.29.x enables DNS-rebinding protection by default; an invalid Host
    # header is rejected by the transport-security middleware. This path returns
    # a 421 immediately (no long-lived SSE stream), so it is deterministic.
    async with AsyncClient(
        transport=ASGITransport(app=app, raise_app_exceptions=False),
        base_url="http://test",
        timeout=5,
    ) as client:
        response = await client.get("/mcp/sse")
    assert response.status_code == 421
