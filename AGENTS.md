# S-AGENS — Base44 Dev Environment

## What this is
S-AGENS is a Live Inspection & Reporting system running on Cloudflare (Workers + D1 + Durable Objects + Pages). This repo contains two apps:
- `worker/` — Cloudflare Worker (Hono API + D1 + Durable Object ticker)
- `frontend/` — React + Vite + Tailwind + Zustand

## How it runs in Base44
`docker-compose.base44.yml` runs both services:
- **worker** — `node:22-slim` running `wrangler dev` on internal port 8787 with local D1 (SQLite). Migrations are applied automatically on startup.
- **web** — `node:22-slim` running `vite dev` on port 5173, mapped to host port 3000. A Vite proxy forwards `/api` and `/health` to the worker via the docker network.

Only port 3000 is public. The frontend uses relative URLs (`VITE_API_URL=` in `.env.development`) so all API calls go through the Vite proxy — no CORS issues.

## Key details
- The worker runs in **stub mode** when no AI provider keys are set — `EnsembleRouter` returns deterministic mock reports. The app is fully functional without secrets.
- D1 `database_id` in `wrangler.toml` is a placeholder (`REPLACE_WITH_ID_FROM_db:create`) — this is fine for local dev; wrangler uses `database_name` for local SQLite.
- The worker seeds one subject on first cron tick and generates reports every minute. To trigger immediately: `POST /api/tick`.
- Frontend polls `/api/reports?sinceTs=...` every 3 seconds.

## Verify it works
```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml ps
curl -sf http://localhost:3000/         # frontend HTML
curl -sf http://localhost:3000/health   # proxied to worker → {"ok":true}
curl -sf http://localhost:3000/api/ai/status  # AI provider status
```

## Changes made for Base44
- `frontend/vite.config.ts` — added Vite proxy (`/api`, `/health` → worker) and `allowedHosts: true` for the preview hostname. Proxy target defaults to `http://127.0.0.1:8787` for local dev, overridden by `VITE_PROXY_TARGET` in compose.
- `frontend/.env.development` — `VITE_API_URL=` (empty) so the frontend uses relative URLs in dev, routed by the proxy. Does not affect production builds.
