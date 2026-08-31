import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_invoke_agent(client, auth_headers, fake_agent_graph):
    response = await client.post(
        "/api/v1/agents/invoke", json={"query": "What is our remote work policy?"}, headers=auth_headers
    )
    assert response.status_code == 200
    assert "response" in response.json()


@pytest.mark.asyncio
async def test_invoke_agent_empty_query(client, auth_headers):
    response = await client.post(
        "/api/v1/agents/invoke", json={"query": "   "}, headers=auth_headers
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_invoke_agent_too_long(client, auth_headers):
    response = await client.post(
        "/api/v1/agents/invoke", json={"query": "x" * 2001}, headers=auth_headers
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_invoke_agent_unauthorized(client):
    response = await client.post("/api/v1/agents/invoke", json={"query": "test"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_document_crud(client, auth_headers):
    create_resp = await client.post(
        "/api/v1/documents/", json={"title": "Test", "content": "Content"}, headers=auth_headers
    )
    assert create_resp.status_code == 200
    doc_id = create_resp.json()["id"]

    get_resp = await client.get(f"/api/v1/documents/{doc_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Test"

    list_resp = await client.get("/api/v1/documents/", headers=auth_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    del_resp = await client.delete(f"/api/v1/documents/{doc_id}", headers=auth_headers)
    assert del_resp.status_code == 200

    get_after_del = await client.get(f"/api/v1/documents/{doc_id}", headers=auth_headers)
    assert get_after_del.status_code == 404


@pytest.mark.asyncio
async def test_conversation_history(client, auth_headers):
    resp = await client.get("/api/v1/conversations/history", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
