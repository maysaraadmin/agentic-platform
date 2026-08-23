import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_invoke_agent():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/agents/invoke", json={"query": "What is our remote work policy?"})
    assert response.status_code == 200
    assert "response" in response.json()

@pytest.mark.asyncio
async def test_invoke_agent_empty_query():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/agents/invoke", json={"query": "   "})
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_invoke_agent_too_long():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/agents/invoke", json={"query": "x" * 2001})
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_document_crud():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        create_resp = await client.post("/api/v1/documents/", json={"title": "Test", "content": "Content"})
        assert create_resp.status_code == 201
        doc_id = create_resp.json()["id"]

        get_resp = await client.get(f"/api/v1/documents/{doc_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["title"] == "Test"

        list_resp = await client.get("/api/v1/documents/")
        assert list_resp.status_code == 200
        assert len(list_resp.json()) >= 1

        del_resp = await client.delete(f"/api/v1/documents/{doc_id}")
        assert del_resp.status_code == 200

        get_after_del = await client.get(f"/api/v1/documents/{doc_id}")
        assert get_after_del.status_code == 404

@pytest.mark.asyncio
async def test_conversation_history():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/v1/conversations/history")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
