tersebut ke dalams,# RuangTemu Web

Platform gathering & komunitas — **web-first MVP**.

| App | Stack | Dev URL |
|-----|--------|---------|
| `apps/web` | Next.js 15 + Tailwind | http://localhost:3000 |
| `apps/api` | NestJS | http://localhost:3001/api |

## Docs

- [PRD](./docs/product-requirements.md)
- [Implementation plan](./docs/implementation-plan.md)
- [Biaya deploy (gratis → berbayar)](./docs/deployment-cost-scenarios.md)
- [Phase 0 Test Report](./docs/phase-0-test-report.md)
- UI rules: `../docs/ui-ux-design-rules.md`


## Quick start (Skenario A — lokal gratis)

### Prerequisites

- Node.js 20+ (tested on 25)
- npm
- Docker Desktop *(opsional — Postgres/Redis; belum wajib di Phase 0 UI)*

### Frontend

```bash
cd apps/web
npm install
npm run dev
```

Buka http://localhost:3000 — home demo + design tokens UI/UX.

**Tema:** ikon matahari/bulan di Navbar — toggle **Light ↔ Dark** (preferensi disimpan di browser).



### Backend

```bash
cd apps/api
npm install
npm run start:dev
```

Health: http://localhost:3001/api/health

### Docker (nanti, saat butuh DB)

```bash
# dari folder Website/
docker compose up -d
```

Lihat `docker-compose.yml` (Postgres 5432, Redis 6379).

## Phase status

| Phase | Status |
|-------|--------|
| 0 Setup + shell UI + tokens + **light/dark** | **Done (shell)** |

| 1 Auth | Pending |
| 2 Discovery API | Pending (UI demo data) |
| 3+ RSVP / pay / organizer | Pending |

## Testing

### Frontend (Vitest + Testing Library)

```bash
cd apps/web
npm test           # sekali jalan
npm run test:watch # watch mode
```

Coverage saat ini: util `cn`, data demo events, `Button`, `EventCard` (16 tests).

### Backend (Jest + Supertest)

```bash
cd apps/api
npm test           # unit (controller + service)
npm run test:e2e   # e2e GET /api & /api/health
```

## Scripts

| Command | Where | What |
|---------|-------|------|
| `npm run dev` | `apps/web` | Next dev (Turbopack) |
| `npm run build` | `apps/web` | Production build |
| `npm test` | `apps/web` | Vitest unit/component |
| `npm run start:dev` | `apps/api` | Nest watch mode |
| `npm test` | `apps/api` | Jest unit tests |
| `npm run test:e2e` | `apps/api` | Jest e2e (Supertest) |

