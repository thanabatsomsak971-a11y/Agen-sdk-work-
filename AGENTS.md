# AGENTS.md — S-AGENS on Base44

## What this is
S-AGENS: Live Inspection & Reporting System. Backend (Node 20 + Express + Socket.io + Mongoose + TS) generates inspection reports via an AI ensemble router and streams them to a React + Vite frontend over WebSocket.

## Dev environment
- `docker-compose.base44.yml` runs everything from source (not prebuilt images).
- Frontend (Vite dev server) on host port **3000**. Backend (Express + Socket.io) on internal port 3001, proxied through Vite (`/api` + `/socket.io`).
- MongoDB 7 + Redis 7 as infra services with healthchecks.
- Backend deps install at startup via `npm install` then `tsx watch` for live reload.
- Frontend deps install at startup via `npm install` then `vite dev`.

## Single-origin wiring
- `VITE_API_URL` is set to empty string → Socket.io connects same-origin.
- Vite proxies `/socket.io` (ws) and `/api` to `http://backend:3001`.
- This avoids cross-origin WebSocket issues through the preview proxy.

## AI inspection status (honest)
- `EnsembleRouter.inspect()` returns `null` — real AI provider calls are **NOT IMPLEMENTED**.
- `InspectionRunner` ticks but produces no reports when inspect returns null (no fake/simulated data).
- `/api/ai/status` honestly reports which provider keys are configured.
- Wiring real Anthropic/OpenAI/Google calls is tracked in `docs/ROADMAP.md` (v0.2).

## Verify it works
1. `docker compose -f docker-compose.base44.yml up -d --build`
2. `docker compose -f docker-compose.base44.yml ps` — all services healthy
3. `curl -sf http://localhost:3000/` — frontend HTML served by Vite
4. `curl -sf http://localhost:3000/api/health` — proxied to backend, returns `{"ok":true,...}`
5. `curl -sf http://localhost:3000/api/ai/status` — reports available brands
6. Frontend shows clean empty state (no fake report stream) — honest "waiting for reports" message.
