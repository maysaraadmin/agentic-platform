import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app

@pytest.mark.asyncio
async def test_mcp_sse_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/mcp/sse")
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")
