# S-AGENS — Base44 Dev Environment

## What this is
A fullstack live inspection & reporting system. The actual application source lives inside `s-agens/` (extracted from `.github/workflows/s-agens.zip`). The repo root originally contained only the README and GitHub Actions workflow.

## Architecture
- **Frontend:** React 18 + Vite + Tailwind + Zustand — Vite dev server on container port 5173, mapped to host port 3000.
- **Backend:** Node 20 + Express + Socket.io + Mongoose + TypeScript — `tsx watch` dev server on container port 3001, mapped to host port 8000.
- **Infra:** MongoDB 7 + Redis 7, both as compose services with healthchecks.
- The backend runs an `InspectionRunner` that ticks every 5s, inspects active subjects via an `EnsembleRouter`, persists reports to MongoDB, and broadcasts them over Socket.io.
- The frontend connects to the backend via Socket.io (`VITE_API_URL`) and displays live reports.

## Dev compose
`docker-compose.base44.yml` runs everything in dev mode with live reload:
- Frontend and backend use `node:20-alpine` base images with the source bind-mounted (NOT prebuilt images).
- Deps are installed at container startup (`npm install`) since no lock files exist.
- `VITE_API_URL` and `CORS_ORIGIN` are derived from `BASE44_PUBLIC_HOST_SUFFIX` so the frontend (port 3000) and backend (port 8000) can talk to each other across the public preview origins.
- Vite `allowedHosts: true` is set in `s-agens/frontend/vite.config.ts` to accept the preview's external hostname.

## Secrets
AI provider keys (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`) are **optional**. The `EnsembleRouter` returns a deterministic stub when no keys are configured, so the app fully works offline. Add them via the Base44 secrets dashboard only if you want real AI inspection.

## Verification
- Frontend: `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` returns the Vite app HTML.
- Backend health: `curl -sf http://localhost:8000/health` returns `{"ok":true}`.
- The dashboard shows "connected" and live reports streaming every 5s.
