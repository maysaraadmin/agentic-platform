import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app

@pytest.mark.asyncio
async def test_unauthorized_access():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/agents/invoke", json={"query": "test"})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_authorized_access():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/agents/invoke",
            json={"query": "test"},
            headers={"Authorization": "Bearer invalid-token"}
        )
    assert response.status_code == 401
