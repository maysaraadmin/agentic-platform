# Architecture Overview

## System Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Host      │────▶│  mfe-chat   │     │ mfe-dashboard│
│  (Shell)    │     │  (Remote)   │     │  (Remote)    │
│  Port 4200  │     │  Port 3001  │     │  Port 3002   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Backend   │
                    │  FastAPI    │
                    │  Port 8000  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │  PostgreSQL │ │  RabbitMQ   │ │   Ollama    │
    │  + pgvector │ │  (Queue)    │ │  (LLM)      │
    └─────────────┘ └─────────────┘ └─────────────┘
```

## Layers

### Frontend (Micro-frontends)
- **Host**: Shell app providing routing, auth context, and lazy-loaded remotes
- **mfe-chat**: Conversational AI interface with streaming responses
- **mfe-dashboard**: Admin panel for system status and metrics
- **Shared**: Common types, API clients, and UI primitives

### Backend
- **API Layer**: FastAPI routers with auth, rate limiting, and validation
- **Agent Layer**: LangGraph workflows for RAG and A2A orchestration
- **MCP Server**: FastMCP SSE server exposing enterprise tools
- **Data Layer**: SQLAlchemy 2.0 async ORM with PostgreSQL + pgvector
- **Messaging**: aio-pika for async RabbitMQ integration

### Infrastructure
- **Container Runtime**: Docker Compose for local, Kubernetes for production
- **CI/CD**: Azure DevOps pipelines with lint, test, security scan, and deploy
- **GitOps**: ArgoCD syncs Helm manifests from Git
- **IaC**: Terraform provisions AKS cluster in Azure

## Data Flow

1. User sends message in mfe-chat
2. Request streams to `/api/v1/agents/stream` via SSE
3. Backend runs LangGraph workflow:
   - `retrieve`: Fetches relevant docs from pgvector
   - `generate`: Streams LLM response using Ollama
4. MCP tools can be invoked for policy/HR lookups
5. Async tasks are queued in RabbitMQ for background processing
6. Conversation history is persisted in AgentLog table
