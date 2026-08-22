import httpx
import logging

logger = logging.getLogger(__name__)


class A2AAgent:
    def __init__(self, endpoint: str):
        self.endpoint = endpoint


class A2AClient:
    def __init__(self, agent: A2AAgent):
        self.agent = agent

    async def send(self, query: str, **kwargs) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.agent.endpoint}/a2a/invoke",
                json={"query": query, **kwargs},
            )
            response.raise_for_status()
            return response.json()


class FinanceAgent(A2AAgent):
    def __init__(self):
        super().__init__(endpoint="http://finance-agent:8000")

    async def invoke(self, query: str) -> str:
        """Invoke the finance agent with a query."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.endpoint}/a2a/invoke",
                json={"query": query, "agent_id": "finance-agent-001"}
            )
            response.raise_for_status()
            return response.json().get("result", "No result")


class OrchestratorAgent:
    def __init__(self):
        self.finance_agent = FinanceAgent()
        self.hr_agent = A2AAgent(endpoint="http://hr-agent:8000")

    async def process_request(self, user_query: str) -> str:
        """Route the query to the appropriate agent based on intent."""
        if "finance" in user_query.lower() or "salary" in user_query.lower():
            logger.info("Routing to Finance Agent via A2A")
            return await self.finance_agent.invoke(user_query)
        elif "hr" in user_query.lower() or "leave" in user_query.lower():
            logger.info("Routing to HR Agent via A2A")
            client = A2AClient(self.hr_agent)
            result = await client.send(user_query, agent_id="hr-agent-001")
            return result.get("result", "No result")
        else:
            return "I'm not sure which agent can help with that."
