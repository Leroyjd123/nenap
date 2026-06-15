# Nenap

> A calm knowledge-capture app. **Focus on the moment. Nenap remembers the rest.**

Write notes naturally. Optionally record alongside them. Nenap quietly hands back a cleaner note —
while always preserving your original words.

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Frontend:** Next.js 15 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · TanStack Query · Zustand · Tiptap
- **Backend:** NestJS · Prisma
- **Platform:** Supabase (Auth · Storage · Postgres) · Gemini (AI)
- **Contract:** shared Zod schemas in `packages/types`

```text
Next.js (Vercel)  →  NestJS (Railway)  →  Supabase (Postgres · Auth · Storage)  →  Gemini
```

The frontend never talks to Gemini or the database directly. The backend owns auth, validation,
AI orchestration, and storage signing.

## Layout

```text
nenap/
├─ frontend/            Next.js 15 app (Hi-Fi design)
├─ backend/             NestJS API + Prisma
├─ packages/types/      Shared Zod schemas + inferred types (@nenap/types)
├─ design/              Nenap Hi-Fi prototype (binding visual spec)
├─ design-system/       Canonical design tokens (Tailwind v4 @theme)
├─ docs/                PRD, flows, phases, standards, context
└─ PLAN.md              One-page roadmap
```

## Quick start

```bash
# 1. Install
pnpm install        # or: make install

# 2. Configure env (placeholders are fine — Supabase setup is deferred)
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Local database (requires Docker)
make db-up
make db-migrate

# 4. Run everything
pnpm dev            # or: make dev
```

Frontend → http://localhost:3000 · Backend → http://localhost:4000 · API docs → http://localhost:4000/docs

> **Note:** Supabase is not yet provisioned. Auth and AI run against placeholder credentials until the
> real Supabase project + keys are added. See [docs/CONTEXT.md](docs/CONTEXT.md).

## Documentation

Start with [docs/README.md](docs/README.md) — especially [docs/CONTEXT.md](docs/CONTEXT.md) (decision log),
[docs/TECHNICAL_STANDARDS.md](docs/TECHNICAL_STANDARDS.md), and [docs/DESIGN_STANDARDS.md](docs/DESIGN_STANDARDS.md).
