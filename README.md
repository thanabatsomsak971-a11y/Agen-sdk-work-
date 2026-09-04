# S-AGENS

**Live Inspection & Reporting System** — pluggable target, agentic AI, cloud-native.

Runs 100% on **Cloudflare** (Workers + D1 + Durable Objects + Pages). Zero-server, free-tier-friendly.

## Stack
- **Backend:** Cloudflare Workers + **Hono** (Express-like) + TypeScript
- **DB:** **Cloudflare D1** (SQLite) + **Drizzle ORM**
- **Real-time ticker:** Cron trigger (every 1 min) + **Durable Object alarm** (sub-minute optional)
- **AI:** provider-agnostic router — Anthropic / OpenAI / Google via `fetch` (stub if no keys)
- **Frontend:** React + Vite + Tailwind + Zustand → **Cloudflare Pages**
- **Live UI:** short-poll `/api/reports?sinceTs=...` every 3 s (dead simple, works everywhere)

## Repo layout
```
worker/     Cloudflare Worker — API + cron + Durable Object
frontend/   React app — deploy to Cloudflare Pages
docs/       Architecture, migration, roadmap
```

## First deploy (~10 minutes)

### 0. Prereqs
```bash
npm install -g wrangler      # Cloudflare CLI
wrangler login               # opens browser
```

### 1. Backend (Worker + D1)
```bash
cd worker
npm install

# Create the D1 database and copy the returned database_id into wrangler.toml
npm run db:create
# → paste database_id into wrangler.toml [[d1_databases]] block

# Run initial migration on remote D1
npm run db:migrate:remote

# (Optional) Add AI provider keys as secrets
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put GOOGLE_API_KEY

# Deploy the worker
npm run deploy
# → note the URL, e.g. https://s-agens-api.<your-subdomain>.workers.dev
```

### 2. Frontend (Pages)
```bash
cd ../frontend
npm install

# Build with your worker URL baked in
VITE_API_URL=https://s-agens-api.<your-subdomain>.workers.dev npm run build

# Deploy to Cloudflare Pages
npm run deploy
# → note the URL, e.g. https://s-agens-web.pages.dev
```

### 3. Update CORS
Add your Pages URL to `worker/wrangler.toml` under `[vars]`:
```
CORS_ORIGIN = "https://s-agens-web.pages.dev,http://localhost:5173"
```
Then re-deploy the worker (`npm run deploy` inside `worker/`).

## Local development
```bash
# Terminal 1 — worker (uses local D1)
cd worker
npm install
npm run db:migrate:local
npm run dev            # http://127.0.0.1:8787

# Terminal 2 — frontend
cd frontend
npm install
npm run dev            # http://localhost:5173
```

The frontend polls `/api/reports?sinceTs=…` every 3 s. To manually trigger an inspection tick without waiting for cron:
```bash
curl -X POST http://127.0.0.1:8787/api/tick
```

## Free-tier math (as of Sept 2026 — verify current limits)
| Resource | Free tier |
|---|---|
| Workers requests | 100,000 / day |
| Workers CPU time | 10 ms per request |
| D1 reads | 5 M / day, 25 B / month |
| D1 writes | 100 K / day |
| Durable Object alarms | 1 M / month |
| Pages requests | unlimited |
| Cron triggers | unlimited |

**Practical ceiling on free plan:** 1 inspection subject × 1-min cron = 1,440 reports/day → well under 100 K writes/day.

## Next steps
See `docs/ROADMAP.md`.
