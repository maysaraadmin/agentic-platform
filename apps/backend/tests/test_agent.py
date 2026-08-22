import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_invoke_agent():
    response = client.post("/api/v1/agents/invoke", json={"query": "What is our remote work policy?"})
    assert response.status_code == 200
    assert "response" in response.json()
