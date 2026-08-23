# ADR 003: Azure as Cloud Provider

## Status
Accepted

## Context
We need a cloud provider with strong Kubernetes support and enterprise features.

## Decision
Use Azure (AKS, ACR, Azure DevOps).

## Consequences
- Pros: Enterprise SLAs, GitOps-friendly, native AD integration
- Cons: Vendor lock-in, potentially higher cost than GCP/AWS
