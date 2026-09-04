# Manifest Status

## Primary stack
- Backend: Node.js + Express + TypeScript (declared by project documentation)
- Frontend: React + TypeScript + Vite + Tailwind
- Database/cache: MongoDB + Redis (declared/configured by recovered material)

## Requested manifest/config checklist

| Item | Status | Location / note |
|---|---|---|
| Frontend `package.json` | RECOVERED | `01_MANIFEST/frontend/package.json` |
| Root `package.json` | DECLARED_ONLY | Named in full tree; standalone body not recovered |
| Backend `package.json` | DECLARED_ONLY | Named in full tree; standalone body not recovered |
| `pyproject.toml` | NOT_APPLICABLE | Project is TypeScript/Node, not Python |
| `requirements.txt` | NOT_APPLICABLE | Project is TypeScript/Node, not Python |
| README | RECOVERED | `01_MANIFEST/README_AI_ORIGINAL.md` |
| `.env.example` | RECOVERED | `01_MANIFEST/backend/.env.example`; placeholder values only |
| Real `.env` | EXCLUDED | Never included; may contain secrets |
| Root/backend `tsconfig.json` | DECLARED_ONLY | Named in full tree; standalone body not recovered |
| `vite.config.ts` | DECLARED_ONLY | Named in full tree; standalone body not recovered |
| `next.config.js` | NOT_APPLICABLE | Recovered frontend is Vite, not Next.js |
| `tailwind.config.js` | RECOVERED | `01_MANIFEST/frontend/tailwind.config.js` |
| `postcss.config.js` | RECOVERED | `01_MANIFEST/frontend/postcss.config.js` |
| `jest.config.js` | RECOVERED | `01_MANIFEST/backend/jest.config.js` |

## Source modules explicitly declared by the manifest but not included in this handoff
This archive intentionally excludes source code. The full tree declares modules including Auth, Customer, Invoice, routes, middleware/security, controllers, repositories, tests, frontend pages and UI components.

## Important distinction discovered during recovery
The PDF/AI manifest explicitly declares `AuthMiddleware.ts`, `authRoutes.ts`, `Invoice.ts`, `main.tsx`, `App.tsx` and other files. Some of these names are present only in the declared tree; their standalone source bodies were not recovered in the earlier attachment set. Do not infer source availability from the tree alone.
