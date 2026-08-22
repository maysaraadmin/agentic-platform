# Agentic Enterprise Platform

A complete, open-source blueprint integrating AI agents, MCP, A2A, RAG, and micro-frontends into a scalable enterprise platform.

## Architecture

- **Backend**: FastAPI + LangGraph + LangChain + MCP + A2A
- **Frontend**: React + NX Micro-frontends
- **Data**: PostgreSQL (pgvector) + SQL Server legacy
- **Messaging**: RabbitMQ
- **Infrastructure**: Kubernetes + ArgoCD + Azure DevOps

## Getting Started

1. Clone the repository
2. Set up environment variables (`.env`)
3. Run `docker-compose up -d`
4. Access API at `http://localhost:8000/docs`
5. Access Frontend at `http://localhost:4200`

## Run Tests

```bash
cd apps/backend
pytest
```

## Deploy

```bash
kubectl apply -f infra/argocd/application.yaml
```
