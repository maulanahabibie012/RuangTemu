# Phase 2 Test Report — Events CRUD & Search

**Date**: 2026-07-16
**Status**: ✅ ALL PASS

---

## API Tests (Jest + NestJS Testing)

| Suite | Tests | Status |
|-------|-------|--------|
| AppController | 1 | ✅ Pass |
| AppService | 2 | ✅ Pass |
| EventsService | 14 | ✅ Pass |
| EventsController | 9 | ✅ Pass |
| **Total** | **28** | **✅ All Pass** |

### EventsService Coverage
- `create` — creates event with organizerId
- `findAll` — paginated results, keyword filter (OR on title/description/location), category filter, max limit cap (50)
- `findPopular` — returns top 8 by currentCount
- `findOne` — returns event by ID, throws NotFoundException
- `update` — updates own event, NotFoundException for missing, ForbiddenException for non-owner
- `remove` — deletes own event, ForbiddenException for non-owner
- `findByOrganizer` — returns organizer's events
- `findNearby` — filters by Haversine distance

### EventsController Coverage
- All 8 endpoints delegate correctly to service
- Request user extraction (`req.user.sub`)
- Query parameter parsing (lat/lng/radius as numbers)

---

## Web Tests (Vitest + React Testing Library)

| Suite | Tests | Status |
|-------|-------|--------|
| utils | 3 | ✅ Pass |
| demo-events | 6 | ✅ Pass |
| Button component | 5 | ✅ Pass |
| EventCard component | 2 | ✅ Pass |
| **Total** | **16** | **✅ All Pass** |

---

## Phase 2 Deliverables

### Backend (NestJS API)
- [x] Prisma schema: Event model with full fields
- [x] EventsModule, EventsService, EventsController
- [x] DTOs: CreateEventDto, UpdateEventDto, QueryEventsDto with class-validator
- [x] CRUD endpoints: GET/POST/PUT/DELETE `/api/events`
- [x] Pagination with meta (page, limit, total, totalPages)
- [x] Keyword search (title, description, location)
- [x] Category filter
- [x] Popular events endpoint (`/api/events/popular`)
- [x] Nearby events endpoint (`/api/events/nearby`)
- [x] Organizer events endpoint (`/api/events/organizer/:userId`)
- [x] JWT auth guard on create/update/delete
- [x] Ownership check (ForbiddenException)
- [x] Seed data (12 diverse events)

### Frontend (Next.js)
- [x] Event TypeScript types (`src/types/event.ts`)
- [x] Events API client (`src/lib/events-api.ts`)
- [x] Home page wired to API (popular events, with demo fallback)
- [x] Search page with debounced keyword search, category filter, load more pagination
- [x] Event detail page wired to API (with demo fallback)
- [x] EventCard component with API data shape

### Infrastructure
- [x] globals.css: `@custom-variant` (fixed from `@define-variant`)
- [x] ESM-compatible test setup (jest import from `@jest/globals`)
- [x] Seed script in package.json

---

## Commands

```bash
# API tests
cd Website/apps/api && npm test

# Web tests
cd Website/apps/web && npx vitest run

# Seed database
cd Website/apps/api && npm run prisma:seed