# Agentic Enterprise Platform

A complete, open-source blueprint integrating AI agents, MCP, A2A, RAG, and micro-frontends into a scalable enterprise platform.

## Architecture

- **Backend**: FastAPI + LangGraph + LangChain + MCP + A2A
- **Frontend**: React + NX Micro-frontends
- **Data**: PostgreSQL (pgvector) + SQL Server legacy
- **Messaging**: RabbitMQ
- **Infrastructure**: Kubernetes + ArgoCD + Azure DevOps

See [docs/architecture.md](docs/architecture.md) for the architecture diagram.

## Getting Started

1. Clone the repository
2. Set up environment variables (`.env`)
3. Run `docker-compose up -d`
4. Access API at `http://localhost:8000/docs`
5. Access Frontend at `http://localhost:4200`

### Local Development

- `docker compose up -d` starts everything
- For local frontend dev: `cd apps/frontend/host && npm start`
- For local backend dev: `cd apps/backend && uvicorn src.main:app --reload`

## Run Tests

### Backend
```bash
cd apps/backend
pytest
```

### Frontend
```bash
cd apps/frontend/host
npm test
```

## Deploy

See [docs/deployment.md](docs/deployment.md) for the full deployment guide.

```bash
kubectl apply -f infra/argocd/application.yaml
```

## Security

**Never commit secrets to git.** Production secrets are stored in Azure Key Vault and synced to Kubernetes via External Secrets Operator. Always use `.env` files (ignored by git) for local development.
