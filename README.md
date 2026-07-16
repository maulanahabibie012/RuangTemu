# RuangTemu

Platform gathering & komunitas — menghubungkan orang dengan acara lokal yang bermakna.

## Struktur Proyek

```
RuangTemu/
├── Website/          # Web platform (Next.js + NestJS)
│   ├── apps/web/     # Frontend — Next.js 15 + Tailwind CSS v4
│   ├── apps/api/     # Backend — NestJS
│   └── docs/         # Dokumentasi web
├── RuangTemu/        # iOS app (Swift/SwiftUI)
└── docs/             # Dokumentasi umum (PRD, UI/UX rules, dll.)
```

## Web Platform

| App | Stack | Dev URL |
|-----|--------|---------|
| `Website/apps/web` | Next.js 15 + Tailwind CSS v4 | http://localhost:3000 |
| `Website/apps/api` | NestJS | http://localhost:3001/api |

### Quick Start

**Frontend:**
```bash
cd Website/apps/web
npm install
npm run dev
```
Buka http://localhost:3000

**Backend:**
```bash
cd Website/apps/api
npm install
npm run start:dev
```
Health check: http://localhost:3001/api/health

### Testing

```bash
# Frontend (Vitest + Testing Library)
cd Website/apps/web && npm test

# Backend (Jest + Supertest)
cd Website/apps/api && npm test
cd Website/apps/api && npm run test:e2e
```

## Dokumentasi

- [Product Requirements (PRD)](docs/product-requirements.md)
- [Implementation Plan](docs/implementation-plan.md)
- [UI/UX Design Rules](docs/ui-ux-design-rules.md)
- [Web PRD](Website/docs/product-requirements.md)
- [Web Implementation Plan](Website/docs/implementation-plan.md)
- [Deployment & Cost Scenarios](Website/docs/deployment-cost-scenarios.md)
- [Phase 0 Test Report](Website/docs/phase-0-test-report.md)

## Phase Status

| Phase | Status |
|-------|--------|
| 0 — Setup + Shell UI + Design Tokens + Light/Dark | ✅ Done |
| 1 — Auth | ⏳ Pending |
| 2 — Discovery API | ⏳ Pending |
| 3+ — RSVP / Pay / Organizer | ⏳ Pending |

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS v4, TypeScript
- **Backend:** NestJS, TypeScript
- **iOS:** Swift, SwiftUI, Core Data
- **Database:** PostgreSQL (via Docker)
- **Cache:** Redis (via Docker)
- **Testing:** Vitest, Jest, Testing Library, Supertest

## License

MIT