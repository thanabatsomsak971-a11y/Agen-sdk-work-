# Architecture

## Core primitive

**Inspection Subject → InspectionRunner (agentic loop) → EnsembleRouter (AI) → Report → WebSocket → UI**

```
[Subject]           what to watch (kind + label + ctx)
   │
   ▼
[InspectionRunner]  every N seconds, iterates active subjects
   │
   ▼
[EnsembleRouter]    picks brand (Claude/GPT/Gemini) or falls back to stub
   │
   ▼
[InspectionReport]  persisted in Mongo (status/score/summary/detail)
   │
   ├──▶ REST /api/reports         (poll / history)
   └──▶ Socket.io 'report' event  (live push)
                                    │
                                    ▼
                              [Frontend]  live dashboard
```

## Why this shape

- **Subject** is generic on purpose. `kind` is a free string ("phone", "person", "service", "ai", "custom-x"). System doesn't know or care what it means; the inspector for that kind does.
- **InspectionRunner** is the "agentic" part — runs on its own timer, no user action needed.
- **EnsembleRouter** does what you asked for: **suggests a brand structurally, doesn't push**. Caller can override the brand per-call. If no keys configured, stub returns deterministic-ish reports so the whole pipeline is developable without paying.
- **Report** is the atomic unit that flows through WebSocket. Frontend just receives them.

## What's intentionally not here yet

- Auth / users (add JWT middleware on `/api` — the JWT_SECRET env is already validated)
- Per-user subject isolation (schema has `ownerId` field ready, but no middleware wires it in)
- Real AI provider calls (stub returns fake data; wiring is a 30-line change in `EnsembleRouter.ts`)
- Elasticsearch / advanced search (comes back when there are enough reports to justify it)
- Mind-map visualization (see `MIGRATION_NOTES.md` — recovered Deep Reshare components can port in)

## Layers

- `config/` — env validation, DB, cache connections
- `models/` — Mongoose schemas
- `services/` — business logic (InspectionRunner)
- `ai/` — AI provider abstraction
- `routes/` — HTTP endpoints
- `ws/` — WebSocket gateway
- `server.ts` — glues it all
