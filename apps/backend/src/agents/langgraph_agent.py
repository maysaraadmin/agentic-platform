import asyncio
import operator
import os
from typing import Annotated, TypedDict

from langchain_community.vectorstores import PGVector
from langchain_ollama import ChatOllama, OllamaEmbeddings
from langgraph.graph import END, StateGraph


class AgentState(TypedDict):
    messages: Annotated[list[dict], operator.add]
    context: str

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


async def retrieve_node(state: AgentState) -> AgentState:
    """Retrieve relevant documents from the vector store."""
    messages = state.get("messages", [])
    if not messages:
        state["context"] = ""
        return state
    query = messages[-1]["content"]
    docs = await asyncio.to_thread(vectorstore.similarity_search, query, k=3)
    state["context"] = "\n".join(doc.page_content for doc in docs)
    return state


async def generate_node(state: AgentState) -> AgentState:
    """Generate a response using the LLM and retrieved context."""
    messages = state.get("messages", [])
    if not messages:
        return state
    context = state.get("context", "")
    prompt = f"""Use the following context to answer the user's question.
    Context: {context}
    User: {messages[-1]['content']}
    Assistant:"""
    response = await llm.ainvoke(prompt)
    state["messages"].append({"role": "assistant", "content": response.content})
    return state


workflow = StateGraph(AgentState)
workflow.add_node("retrieve", retrieve_node)
workflow.add_node("generate", generate_node)
workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "generate")
workflow.add_edge("generate", END)

agent_graph = workflow.compile()
