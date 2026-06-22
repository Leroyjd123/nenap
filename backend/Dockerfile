# Backend (NestJS) image for Render/containers.
# IMPORTANT: build context must be the REPO ROOT (this is a pnpm workspace that
# depends on @nenap/types). On Render set:
#   Dockerfile Path = backend/Dockerfile
#   Docker Build Context Directory = .   (repo root)
FROM node:22-slim AS base
# Prisma needs OpenSSL (engine) at build and runtime.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

# ---- build: install workspace, build shared types, generate Prisma client, compile ----
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile \
 && pnpm --filter @nenap/types build \
 && pnpm --filter @nenap/backend exec prisma generate \
 && pnpm --filter @nenap/backend build

# ---- runtime ----
FROM base AS runtime
ENV NODE_ENV=production
# Bring over the fully built workspace (node_modules incl. the generated Prisma client,
# packages/types/dist, and backend/dist). pnpm's symlinks are preserved.
COPY --from=build /app ./
WORKDIR /app/backend
# Render/Cloud Run inject PORT; main.ts honours it (falls back to BACKEND_PORT/4000).
# NOTE: migrations are NOT run here — the dev DB is already migrated. For prod, add a
# Prisma migrate-deploy step once the migration history is baselined (see DEPLOYMENT.md).
CMD ["node", "dist/main.js"]
