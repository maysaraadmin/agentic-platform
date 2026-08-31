import pytest


@pytest.mark.asyncio
async def test_unauthorized_access(client):
    response = await client.post("/api/v1/agents/invoke", json={"query": "test"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_invalid_token_rejected(client):
    response = await client.post(
        "/api/v1/agents/invoke",
        json={"query": "test"},
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_valid_token_allows_access(client, auth_headers):
    response = await client.post(
        "/api/v1/agents/invoke", json={"query": ""}, headers=auth_headers
    )
    # An empty query is rejected by validation (400) only AFTER authentication
    # succeeds. A 401 here would mean the valid token was rejected.
    assert response.status_code == 400
