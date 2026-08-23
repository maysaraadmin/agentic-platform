from typing import TypedDict, List, Annotated
import operator
import asyncio
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolExecutor
from langchain_ollama import ChatOllama
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import PGVector
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
import os

class AgentState(TypedDict):
    messages: Annotated[List[dict], operator.add]
    context: str
    next_step: str

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "agentic_db")

llm = ChatOllama(base_url=OLLAMA_HOST, model=OLLAMA_MODEL, temperature=0)

embeddings = OllamaEmbeddings(base_url=OLLAMA_HOST, model=OLLAMA_MODEL)
connection_string = f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
vectorstore = PGVector(
    collection_name="company_docs",
    connection_string=connection_string,
    embedding_function=embeddings,
)

@tool
def search_policies(query: str) -> str:
    """Search company policies."""
    return f"Policy results for '{query}': [Policy 1, Policy 2]"

@tool
def get_employee_info(employee_id: str) -> str:
    """Get employee information."""
    return f"Employee {employee_id}: John Doe, Engineering"

tools = [search_policies, get_employee_info]
tool_executor = ToolExecutor(tools)

async def retrieve_node(state: AgentState) -> AgentState:
    """Retrieve relevant documents from the vector store."""
    query = state["messages"][-1]["content"]
    docs = await asyncio.to_thread(vectorstore.similarity_search, query, k=3)
    context = "\n".join([doc.page_content for doc in docs])
    state["context"] = context
    state["next_step"] = "generate"
    return state

async def generate_node(state: AgentState) -> AgentState:
    """Generate a response using the LLM and retrieved context."""
    context = state.get("context", "")
    prompt = f"""Use the following context to answer the user's question.
    Context: {context}
    User: {state['messages'][-1]['content']}
    Assistant:"""
    response = await llm.ainvoke(prompt)
    state["messages"].append({"role": "assistant", "content": response.content})
    state["next_step"] = "end"
    return state

def should_continue(state: AgentState) -> str:
    """Determine the next step in the graph."""
    if state["next_step"] == "generate":
        return "generate"
    else:
        return END

workflow = StateGraph(AgentState)
workflow.add_node("retrieve", retrieve_node)
workflow.add_node("generate", generate_node)
workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "generate")
workflow.add_conditional_edges("generate", should_continue)

agent_graph = workflow.compile()
