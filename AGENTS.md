# S-AGENS — Base44 Dev Environment

## What this is
A fullstack "live inspection & reporting" app: React/Vite frontend + Node/Express/TypeScript backend, backed by MongoDB, Redis, and Elasticsearch.

## Architecture
- **Frontend** (`frontend/`): React 18 + Vite 5 + Tailwind, served on port 5173 (mapped to host 3000). Connects to backend via Socket.io using `VITE_API_URL`.
- **Backend** (`backend/`): Express + TypeScript, served on port 3001 (mapped to host 8000). Uses `tsx watch` for live reload. Connects to MongoDB, Redis, and Elasticsearch on startup.
- **MongoDB 7**: with auth (`sagens` / `sagens_dev_pw`), database `s_agens`.
- **Redis 7**: no auth, default port.
- **Elasticsearch 8.11.0**: single-node, xpack security disabled, 512m heap.

## Running
```
docker compose -f docker-compose.base44.yml up -d --build
```
Frontend: https://3000-${BASE44_PUBLIC_HOST_SUFFIX}
Backend API: https://8000-${BASE44_PUBLIC_HOST_SUFFIX}

## Key endpoints
- `GET /health` — backend liveness
- `GET /api/es/status` — Elasticsearch cluster health (real runtime verification)
- `GET /api/ai/status` — which AI providers have keys configured
- `GET /api/subjects` — list inspection subjects
- `GET /api/reports` — list inspection reports

## Quirks
- The app source was originally stored as a zip inside `.github/workflows/s-agens.zip`. It has been extracted to the repo root.
- `node_modules` for backend and frontend live in anonymous Docker volumes to avoid host contamination.
- The backend's `EnsembleRouter` returns deterministic stubs when no AI API keys are set — this is intentional scaffold behavior, not a mockup of a real connection.
- Elasticsearch index `inspection-reports` is auto-created on first connect.
- Vite `allowedHosts: true` is required for the preview proxy hostname.

## Secrets
- `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` are optional (app runs in stub mode without them). Set via the Base44 secrets dashboard.
- Local infra credentials (MongoDB, Redis, Elasticsearch) are generated inline in the compose file — not secrets.
