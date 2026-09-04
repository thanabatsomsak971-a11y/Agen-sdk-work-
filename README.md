# S-AGENS

**Live Inspection & Reporting System** — pluggable target, agentic AI, real-time report.

## What this is
A minimal but working scaffold. Not a demo, not a mockup — you `docker compose up` and it runs. WebSocket streams "inspection reports" from backend to frontend live.

You then extend by:
- swapping the mock inspector for a real one (phone health, patient status, whatever)
- swapping the mock AI for real Claude/GPT calls via `backend/src/ai/`
- extending the UI with the Deep Reshare mind-map components (see `docs/MIGRATION_NOTES.md`)

## Stack (chosen for simplicity, not fashion)
- **Backend:** Node 20 + Express + Socket.io + Mongoose + TypeScript
- **DB:** MongoDB 7, Redis 7
- **Frontend:** React 18 + Vite + Tailwind + Zustand
- **AI:** provider-agnostic router (`ai/EnsembleRouter.ts`) — add Anthropic/OpenAI/etc. keys in `.env`
- **Deploy:** docker-compose (works on any VPS or free-tier host)

## Quickstart
```bash
cp .env.example .env      # edit if you want, defaults work for local
docker compose up --build
# frontend: http://localhost:5173
# backend:  http://localhost:3001
# open the frontend; you'll see live reports streaming in
```

## Repo layout
```
backend/   Express + Socket.io API, TypeScript
frontend/  React + Vite dashboard
docs/      Architecture notes, migration notes, roadmap
```

See `docs/ARCHITECTURE.md` and `docs/ROADMAP.md`.
