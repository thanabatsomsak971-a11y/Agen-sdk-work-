# Architecture

## Core primitive

**Inspection Subject → Cron/Alarm tick → EnsembleRouter (AI) → Report in D1 → Poll → UI**

```
[Subject]  (D1 table `subjects`)
    │       kind + label + ctx (free-form JSON)
    ▼
[Cron trigger every 1 min]   OR   [Durable Object alarm every N ms]
    │
    ▼
[EnsembleRouter]
    │  suggestBrand() → structural hint only, caller decides
    │  inspect()      → fetch to Anthropic / OpenAI / Google
    │                   no key → deterministic stub
    ▼
[Report]  (D1 table `reports`) — id, status, score, summary, aiProvider, createdAt
    │
    ▼
[GET /api/reports?sinceTs=<unix>]
    │
    ▼
[Frontend]  polls every 3 s, dedupes by id
```

## Why Cloudflare-native

| What | Where it lives | Free tier |
|---|---|---|
| API code | Workers (V8 isolates, cold-start < 5 ms) | 100K req/day |
| Data | D1 (SQLite, edge-replicated) | 5 GB, 25 B reads/mo |
| Ticker | Cron trigger (1-min min) + DO alarm (sub-min) | Unlimited cron, 1 M alarms/mo |
| Static UI | Pages | Unlimited bandwidth |
| SSL, DNS, DDoS | Cloudflare (automatic) | Free |

**No servers to patch, no ports to open, no docker-compose.**

## Why polling, not WebSocket

Workers can do WebSocket via Durable Objects, but for **one-way server → client streaming**, short-polling `?sinceTs=…` is:
- Simpler code (no DO WebSocket hibernation to think about)
- No connection-limit worries on free tier
- Works through any proxy / captive portal
- Client auto-reconnects for free (it's just fetch)

If sub-3-second latency ever matters, swap `App.tsx` for Server-Sent Events or DO WebSocket — same `/api/reports` contract.

## Why "suggestBrand", not "chooseBrand"

Per your product principle: **the router surfaces a structural suggestion, the caller decides.**

```ts
const suggested = router.suggestBrand(prompt);  // returns Brand | null
const answer = await router.inspect(prompt, userChoice ?? suggested);
```

Frontend can show the suggestion + let the user pick, or auto-accept. No leading UI copy required — just the fact "we suggest X because the subject kind is 'ai'".

## Layers

- `worker/src/env.ts` — Env interface (D1, DO, secrets, vars)
- `worker/src/db/` — Drizzle schema + SQL migrations
- `worker/src/ai/EnsembleRouter.ts` — AI providers
- `worker/src/services/InspectionRunner.ts` — one tick
- `worker/src/routes/` — Hono route modules
- `worker/src/stream.ts` — Durable Object for sub-minute ticks
- `worker/src/index.ts` — Hono app + cron + DO export
- `frontend/src/App.tsx` — polling loop
- `frontend/src/stores/reports.ts` — Zustand dedupe store
