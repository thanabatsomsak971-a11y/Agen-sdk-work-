# Migration Notes — from Deep Reshare recovery to S-AGENS

**Nothing from the recovered zips was copied verbatim into this scaffold.** The scaffold is fresh, clean, and small. But the recovered material has useful patterns you can port back in when needed. This file maps recovered file → likely home in S-AGENS.

## Direct ports (paste in later when you need them)

| Recovered file | Where it fits | Notes |
|---|---|---|
| `Post.ts` (218 lines, IReshareChain) | `backend/src/models/InspectionChain.ts` | The reshare-chain idea = inspection-propagation chain. Rename fields. |
| `MindMap.ts` (266 lines) | `backend/src/models/ContextMap.ts` | Knowledge graph of relationships between subjects. Keep node/edge structure. |
| `MindMapCanvas.tsx` (D3, 331 lines) | `frontend/src/components/ContextMap.tsx` | Solid D3 force-graph. Port when you actually need to visualize relationships. |
| `ReshareAnalytics.tsx` (Recharts) | `frontend/src/components/InspectionAnalytics.tsx` | Adapt series from "reshares over time" to "reports over time by status". |
| `AdvancedSearchEngine.ts` (MiniSearch + NLP + sentiment) | `backend/src/services/ReportSearch.ts` | Big paste. Change the index from `Post` to `InspectionReport`. Drop User import (doesn't exist here). |
| `UserRecommendations.tsx` | *skip for now* | Depends on mock data + Unsplash URLs; social recommendation is not this product. |

## Do NOT port

- The AiPASS billing system (`Customer`, `Invoice`, `AuthController`, ...) — different domain.
- The 130-dependency `package.json` — bloat. Keep the clean scaffold's deps.
- The Dockerfiles from the recovery — they had bugs (nginx user recreated, port clash).
- The `.env.example` from recovery — it had many placeholders for services this product doesn't use.

## Known issues from the recovery (already documented in Batch A)

If you do port `AdvancedSearchEngine.ts`, note:
- It imports `User` — you'd need to create a minimal User model first.
- Rate limiter idea uses JWT as Redis key — use `subjectId` or `userId` instead.
- Cached validation should not merge cached payloads into later requests.
