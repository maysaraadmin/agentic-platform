.PHONY: install-backend install-frontend test lint format docker-up docker-down migrate

install-backend:
	cd apps/backend && pip install -r requirements.txt

install-frontend:
	cd apps/frontend && npm install

test:
	cd apps/backend && pytest

lint:
	ruff check apps/backend/src/
	cd apps/frontend && npm run lint

format:
	ruff format apps/backend/src/
	cd apps/frontend && npm run format

docker-up:
	docker compose up -d

docker-down:
	docker compose down

migrate:
	cd apps/backend && python -c "from src.core.database import engine; import asyncio; asyncio.run(engine.begin())"

help:
	@echo "Available targets: install-backend, install-frontend, test, lint, format, docker-up, docker-down"
