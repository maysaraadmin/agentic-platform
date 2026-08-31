import pytest
from httpx import ASGITransport, AsyncClient

from src.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture(autouse=True)
async def _isolate_db_pool():
    """Drop pooled asyncpg connections after each test.

    The backend's async engine (src/core/database.py) is created at import time
    and pools asyncpg connections. pytest-asyncio runs each async test on its own
    event loop, so without isolation a pooled connection checked out on one
    test's loop would be reused on a later test's loop and raise
    "Future ... attached to a different loop". Disposing the pool during
    teardown (still on the test's own loop) closes that test's connections, so
    the next test checks out a fresh connection bound to its own loop.
    """
    from src.core.database import engine

    yield
    await engine.dispose()


@pytest.fixture
async def auth_headers(client):
    response = await client.post(
        "/auth/token",
        data={
            "grant_type": "password",
            "username": "demo@example.com",
            "password": "demo-password",
        },
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


class _FakeGraph:
    async def ainvoke(self, state):
        messages = list(state.get("messages", []))
        return {
            "messages": messages + [{"role": "assistant", "content": "canned response"}],
            "context": "retrieved context",
        }

    async def astream(self, state):
        yield {"generate": {"messages": [{"role": "assistant", "content": "canned response"}]}}

    async def astream_events(self, state, version="v1"):
        yield {"event": "on_chat_model_stream", "data": {"chunk": "canned "}}
        yield {"event": "on_chat_model_stream", "data": {"chunk": "response"}}


@pytest.fixture
def fake_agent_graph(monkeypatch):
    from src.api import agent as agent_module
    monkeypatch.setattr(agent_module, "agent_graph", _FakeGraph())
