# Nenap — cross-language task runner
# Usage: make <target>   (run `make help` to list)

.DEFAULT_GOAL := help
SHELL := /bin/bash

.PHONY: help install dev build lint typecheck test format \
        db-up db-down db-migrate db-generate db-studio db-seed clean

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install all workspace dependencies
	pnpm install

dev: ## Run frontend + backend in dev mode
	pnpm dev

build: ## Build all packages
	pnpm build

lint: ## Lint all packages
	pnpm lint

typecheck: ## Typecheck all packages
	pnpm typecheck

test: ## Run all tests
	pnpm test

format: ## Format the codebase with Prettier
	pnpm format

db-up: ## Start local Postgres (requires Docker)
	docker compose up -d db

db-down: ## Stop local services
	docker compose down

db-migrate: ## Apply Prisma migrations (dev)
	pnpm --filter @nenap/backend prisma migrate dev

db-generate: ## Regenerate Prisma client
	pnpm --filter @nenap/backend prisma generate

db-studio: ## Open Prisma Studio
	pnpm --filter @nenap/backend prisma studio

db-seed: ## Seed the database
	pnpm --filter @nenap/backend db:seed

clean: ## Remove build artifacts and node_modules
	rm -rf node_modules **/node_modules **/dist **/.next **/.turbo
