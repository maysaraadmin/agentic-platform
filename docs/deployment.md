# Deployment Guide

## Prerequisites
- Azure CLI logged in
- kubectl configured for AKS
- Helm 3.x installed
- ArgoCD installed in cluster

## Local Development
```bash
docker compose up -d
cd apps/backend && pytest
cd apps/frontend && npm start
```

## Production Deployment
1. Push code to main branch
2. Azure DevOps pipeline builds and pushes images
3. ArgoCD syncs manifests from infra/kubernetes
4. Verify with: kubectl get pods -n agentic-platform

## Rollback
```bash
kubectl rollout undo deployment/backend -n agentic-platform
kubectl rollout undo deployment/frontend -n agentic-platform
```

## Secrets Management
Production secrets are stored in Azure Key Vault and synced to Kubernetes via External Secrets Operator. Never commit secrets to git.
