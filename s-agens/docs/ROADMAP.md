# Roadmap

## v0.1 (this scaffold — RIGHT NOW)
- [x] Backend runs, connects Mongo + Redis
- [x] Runner ticks every N seconds, generates stub reports
- [x] Reports persist + stream over Socket.io
- [x] Frontend connects and shows live feed
- [x] REST for subjects (CRUD) + reports (list/get)
- [x] docker-compose brings the whole thing up

## v0.2 — real AI (small, focused)
- [ ] Wire Anthropic into `EnsembleRouter.inspect()` (replace stub for `subjectKind === 'ai'`)
- [ ] Wire OpenAI (replace stub for `subjectKind === 'service'`)
- [ ] Add per-brand cost tracking to `Report.detail.cost_usd`
- [ ] Show which brand answered in the UI row (add a small colored badge)

## v0.3 — first real inspector (phone health)
- [ ] Simple endpoint: `POST /api/subjects/:id/observe` — client sends raw metrics (battery, storage, uptime, etc.)
- [ ] Runner triggers an ensemble call to summarize the observation into a report
- [ ] Frontend can register the current browser as a subject and post its own metrics

## v0.4 — auth + multi-user
- [ ] JWT middleware on `/api`
- [ ] `ownerId` on subjects (already in schema)
- [ ] `/auth/login` + `/auth/register` endpoints
- [ ] Frontend login page

## v0.5 — mind map (port from recovery)
- [ ] `ContextMap` model (adapt from recovered `MindMap.ts`)
- [ ] `ContextMap` view in UI (adapt from recovered `MindMapCanvas.tsx`)
- [ ] Auto-link related subjects (same kind, same tag) as edges

## v0.6 — search + analytics
- [ ] Port `AdvancedSearchEngine.ts` from recovery
- [ ] Historical analytics page (adapt from recovered `ReshareAnalytics.tsx`)

## Deploy phases (independent of feature phases)
1. **Local docker-compose** — where you are now
2. **Single free-tier host** — Render Free (with cold-start caveat) or Fly.io
3. **$5/mo Railway or Hetzner CX22 VPS** when free tier stops being enough
