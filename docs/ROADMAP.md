# Roadmap

## v0.1 — this scaffold
- [x] Worker with Hono + D1 + Drizzle
- [x] Subjects CRUD, Reports list/get
- [x] EnsembleRouter with real Anthropic / OpenAI / Google calls (fallback stub)
- [x] Cron trigger every 1 min
- [x] Durable Object with alarm for sub-minute ticks
- [x] Frontend polls `/api/reports?sinceTs=…` every 3 s
- [x] Cloudflare Pages ready

## v0.2 — auth
- [ ] `/auth/register` + `/auth/login` (bcrypt via Web Crypto)
- [ ] JWT signed with `HS256` (jose library, Workers-compatible)
- [ ] Middleware in `worker/src/middleware/auth.ts`
- [ ] `subjects.ownerId` enforced per request

## v0.3 — first real inspector: phone health
- [ ] Frontend can register the current browser as a subject
- [ ] Client posts `POST /api/subjects/:id/observe` with local metrics (battery / memory / connection)
- [ ] Runner uses that observation as `ctx` when asking AI to summarize

## v0.4 — cost tracking
- [ ] Store `usage.input_tokens` + `output_tokens` + `cost_usd` in `reports.detail`
- [ ] Show per-day AI spend chart in UI (adapt from recovered `ReshareAnalytics.tsx`)

## v0.5 — context map (port from recovery)
- [ ] New table `context_edges (from_subject, to_subject, kind, strength)`
- [ ] `ContextMap.tsx` (adapted from recovered `MindMapCanvas.tsx`, D3)
- [ ] Auto-edge when two subjects share tags / same alert window

## v0.6 — search
- [ ] Port `AdvancedSearchEngine.ts` (MiniSearch runs fine on Workers)
- [ ] Or D1 full-text search via FTS5 virtual tables

## v0.7 — WebSocket upgrade (only if polling is truly not enough)
- [ ] Convert `stream.ts` to hold WebSocket connections
- [ ] Frontend swaps polling loop for `new WebSocket(...)`
- [ ] Same `/api/reports` contract — dashboard code doesn't change
