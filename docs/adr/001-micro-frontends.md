# ADR 001: Micro-Frontends with Webpack Module Federation

## Status
Accepted

## Context
We need a frontend architecture that supports independent deployment of chat and dashboard features while sharing a common shell.

## Decision
Use Webpack Module Federation with a host shell and remote modules.

## Consequences
- Pros: Independent deployment, team autonomy, shared dependencies
- Cons: Complex build config, version skew risks, harder debugging
