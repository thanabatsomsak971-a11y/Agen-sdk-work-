# Migration Notes — from Deep Reshare recovery to S-AGENS (Cloudflare edition)

**Nothing from the recovered zips was copied verbatim.** This scaffold is fresh. Below is where each recovered file *could* be ported if/when you want that feature back.

## Direct ports (paste in later when you need them)

| Recovered file | Where it fits (S-AGENS Cloudflare edition) | Notes |
|---|---|---|
| `Post.ts` (218 lines, reshare chain) | `worker/src/db/schema.ts` — new table `inspection_chains` | Adapt Mongoose interface → Drizzle SQLite schema. Reshare chain becomes inspection-propagation chain. |
| `MindMap.ts` (266 lines) | `worker/src/db/schema.ts` — new tables `context_maps` + `context_nodes` + `context_edges` | Split nested Mongoose docs into relational SQLite. |
| `MindMapCanvas.tsx` (D3, 331 lines) | `frontend/src/components/ContextMap.tsx` | Port as-is. D3 works fine in Vite/React. |
| `ReshareAnalytics.tsx` (Recharts) | `frontend/src/components/InspectionAnalytics.tsx` | Rename axes: "reshares over time" → "reports by status". Add Recharts to `frontend/package.json`. |
| `AdvancedSearchEngine.ts` (MiniSearch + NLP) | `worker/src/services/ReportSearch.ts` | MiniSearch runs in Workers (pure JS, no Node APIs). `natural` and `sentiment` also work. Drop the `User` import. |
| `UserRecommendations.tsx` | *skip for now* | Depends on mock data + Unsplash URLs; social recommendation is not this product. |

## Do NOT port

- **AiPASS billing** (`Customer`, `Invoice`, `AuthController`, ...) — different domain.
- **The 130-dep `package.json`** — replaced by worker's 4 deps + frontend's 5.
- **Docker/nginx configs from recovery** — not needed; Cloudflare runs the network layer.
- **Old `.env.example`** — Cloudflare uses `wrangler secret put`, no `.env` on server.

## Key differences vs. Node stack

| Node/Docker (previous scaffold) | Cloudflare (this) |
|---|---|
| Express | Hono |
| Mongoose + MongoDB | Drizzle + D1 (SQLite) |
| node-redis | (removed for v0.1; Upstash Redis via HTTP if needed later) |
| Socket.io | short-poll (or DO WebSocket later) |
| `docker compose up` | `wrangler deploy` |
| VPS + SSL setup | Cloudflare handles both |

## Known issues from the recovery (as documented in Batch A)

If porting `AdvancedSearchEngine.ts`:
- It imports `User` — you'd need to add a users table first (v0.2 auth phase).
- Rate-limiter idea uses JWT as key — use `subjectId` instead.
- Cached-validation should not merge cached payloads into later requests.
