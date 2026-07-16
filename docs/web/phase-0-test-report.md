e# Phase 0 — Test Report

| Field | Value |
|-------|--------|
| **Project** | RuangTemu Web |
| **Phase** | 0 — Setup + shell UI + design tokens + light/dark |
| **Report date** | 16 Mar 2026 |
| **Environment** | macOS, Node.js 20+, local |
| **Overall result** | **PASS** (21/21 automated tests) |

---

## 1. Executive summary

Phase 0 men-deliver scaffold monorepo web (Next.js) + API (NestJS), shell UI dengan design tokens UI/UX, halaman demo (home / search / event detail), tema light/dark, dan fondasi automated testing.


Semua automated test yang dijalankan pada tanggal laporan ini **lulus tanpa failure**.

| Layer | Tool | Suites | Tests | Result |
|-------|------|--------|-------|--------|
| Frontend unit/component | Vitest + Testing Library | 4 | 16 | PASS |
| Backend unit | Jest | 2 | 3 | PASS |
| Backend e2e | Jest + Supertest | 1 | 2 | PASS |
| **Total** | | **7** | **21** | **PASS** |

---

## 2. Scope Phase 0

### In scope (diuji / diverifikasi)

| Area | Deskripsi |
|------|-----------|
| Project scaffold | `apps/web` (Next.js 15), `apps/api` (NestJS) |
| Design system shell | Tokens Tailwind, `Button`, `Badge`, `Card`, layout Navbar/Footer |
| Demo discovery UI | Home, search, event detail (data lokal `DEMO_EVENTS`) |
| Theme | Light / Dark via `next-themes` |

| API health | `GET /api`, `GET /api/health` |
| Automated tests | Unit + component (web), unit + e2e (api) |
| Docs & ops | README, docker-compose, `.env.example` |

### Out of scope Phase 0 (belum diuji secara fungsional penuh)

| Area | Alasan |
|------|--------|
| Auth (register/login JWT) | Phase 1 |
| Persistence (Postgres / Prisma) | Phase 1–2 |
| Discovery API real (list/filter events dari DB) | Phase 2 |
| RSVP, payment, organizer dashboard | Phase 3+ |
| Mobile app (React Native / Expo) | Setelah web MVP stabil |
| E2E browser (Playwright/Cypress) | Belum di-setup di Phase 0 |
| Load / security / accessibility audit formal | Belum di Phase 0 |

---

## 3. Test strategy

```
┌─────────────────────────────────────────────────────────┐
│                    Phase 0 pyramid                      │

│                                                         │
│              ┌──────────────┐                           │
│              │  E2E API     │  Supertest (HTTP)         │
│              │  (2 tests)   │                           │
│         ┌────┴──────────────┴────┐                      │
│         │  Component / unit web  │  Vitest + RTL        │
│         │  (16 tests)            │                      │
│    ┌────┴────────────────────────┴────┐                 │
│    │  Unit API (controller/service)   │  Jest           │
│    │  (3 tests)                       │                 │
│    └──────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

| Level | Tujuan di Phase 0 |
|-------|-------------------|
| **Unit (API)** | Pastikan health service & controller mengembalikan kontrak yang benar |
| **Unit/component (Web)** | Pastikan util, data demo, dan komponen UI inti berperilaku benar |
| **E2E (API)** | Pastikan HTTP path dengan global prefix `/api` sama seperti production bootstrap |

---

## 4. Frontend tests (`apps/web`)

### 4.1 Stack & config

| Item | Detail |
|------|--------|
| Runner | **Vitest** `^4.1.10` |
| Environment | **jsdom** |
| Component testing | **@testing-library/react** + **@testing-library/user-event** |
| Matchers | **@testing-library/jest-dom** |
| Config | `apps/web/vitest.config.ts` |
| Setup | `apps/web/src/test/setup.ts` |
| Alias | `@/*` → `./src/*` |

**Scripts**

```bash
cd apps/web
npm test              # vitest run (CI-friendly)
npm run test:watch    # watch mode
npm run test:coverage # coverage (script tersedia; plugin coverage opsional)
```

### 4.2 Hasil eksekusi

```
Test Files  4 passed (4)
     Tests  16 passed (16)
```

### 4.3 Rincian per file

#### A. `src/lib/utils.test.ts` — 3 tests

| # | Test case | Yang diverifikasi | Status |
|---|-----------|-------------------|--------|
| 1 | merges class names | `cn("px-2", "py-1")` → string gabungan | PASS |
| 2 | resolves conflicting Tailwind classes | `cn("px-2", "px-4")` → `"px-4"` (tailwind-merge) | PASS |
| 3 | ignores falsy values | `false`, `undefined`, `null` tidak masuk class string | PASS |

**Mengapa penting:** `cn()` dipakai di hampir semua komponen UI; regresi di sini merusak styling global.

---

#### B. `src/lib/demo-events.test.ts` — 6 tests

| # | Test case | Yang diverifikasi | Status |
|---|-----------|-------------------|--------|
| 1 | has at least one demo event | `DEMO_EVENTS.length > 0` | PASS |
| 2 | each event has required fields | id, title, category, location, dateLabel, quotaLabel, priceLabel, isFree, coverGradient | PASS |
| 3 | uses unique event ids | tidak ada id duplikat (routing detail aman) | PASS |
| 4 | isFree matches priceLabel for free events | jika `isFree`, label mengandung `"gratis"` | PASS |
| 5 | CATEGORIES starts with Semua | filter default UI | PASS |
| 6 | includes categories used by demo events | setiap kategori event ada di `CATEGORIES` | PASS |

**Mengapa penting:** UI Phase 0 bergantung data demo; inkonsistensi data = bug tampilan search/detail.

---

#### C. `src/components/ui/button.test.tsx` — 5 tests

| # | Test case | Yang diverifikasi | Status |
|---|-----------|-------------------|--------|
| 1 | renders children | role `button`, teks terlihat | PASS |
| 2 | calls onClick when pressed | user-event click → handler 1x | PASS |
| 3 | is disabled when loading | `loading` → disabled (cegah double submit) | PASS |
| 4 | is disabled when disabled prop is true | prop `disabled` dihormati | PASS |
| 5 | defaults type to button | default `type="button"` (aman di dalam form) | PASS |

**Mengapa penting:** Button adalah primitif CTA (Daftar, Login, Simpan); loading/disabled = UX & data integrity.

---

#### D. `src/components/event/event-card.test.tsx` — 2 tests

| # | Test case | Yang diverifikasi | Status |
|---|-----------|-------------------|--------|
| 1 | shows title, category, location, date, quota, price | konten kartu discovery lengkap | PASS |
| 2 | links to event detail page | `href` = `/events/{id}` | PASS |

**Catatan teknis:** `next/link` di-mock ke `<a>` agar testing library bisa assert navigasi tanpa Next runtime.

**Mengapa penting:** Event card adalah unit discovery utama di home & search.

---

### 4.4 Coverage map (web) — Phase 0

| Modul / fitur | Automated test? | Catatan |
|---------------|-----------------|---------|
| `cn` util | Ya | Unit |
| `DEMO_EVENTS` / `CATEGORIES` | Ya | Data integrity |
| `Button` | Ya | Interaction + a11y role |
| `EventCard` | Ya | Content + link |
| `Badge`, `Card` | Tidak (langsung) | Ditutupi lewat EventCard (smoke visual structure) |
| `Navbar` / `Footer` | Tidak | Manual / visual di browser |
| Theme toggle | Tidak | Manual (Light ↔ Dark) |

| Pages: home, search, detail | Tidak | Manual smoke; data via demo tests |
| API client (axios/react-query) | N/A | Belum ada wiring Phase 2 |

---

## 5. Backend tests (`apps/api`)

### 5.1 Stack & config

| Item | Detail |
|------|--------|
| Runner unit | **Jest** (config di `package.json` → `rootDir: src`) |
| Runner e2e | **Jest** + `test/jest-e2e.json` |
| HTTP e2e | **Supertest** |
| Nest testing | `@nestjs/testing` |
| Types | `types: ["jest", "node"]` di `tsconfig.json` |

**Scripts**

```bash
cd apps/api
npm test           # unit
npm run test:e2e   # e2e
npm run test:cov   # coverage (Jest built-in)
```

### 5.2 Unit — hasil

```
Test Suites: 2 passed, 2 total
Tests:       3 passed, 3 total
```

#### A. `src/app.service.spec.ts` — 1 test

| # | Test case | Yang diverifikasi | Status |
|---|-----------|-------------------|--------|
| 1 | returns health payload with ok status | `status === 'ok'`, `name === 'RuangTemu API'`, `message` truthy | PASS |

#### B. `src/app.controller.spec.ts` — 2 tests

| # | Test case | Yang diverifikasi | Status |
|---|-----------|-------------------|--------|
| 1 | getHello returns health payload | controller mendelegasi ke service dengan benar | PASS |
| 2 | health returns ok service flag | `{ ok: true, service: 'ruangtemu-api' }` | PASS |

---

### 5.3 E2E — hasil

```
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

File: `test/app.e2e-spec.ts`

| # | Test case | Request | Expectation | Status |
|---|-----------|---------|-------------|--------|
| 1 | GET /api returns health payload | `GET /api` | HTTP 200, body.status `ok`, body.name `RuangTemu API` | PASS |
| 2 | GET /api/health returns ok | `GET /api/health` | HTTP 200, `{ ok: true, service: 'ruangtemu-api' }` | PASS |

**Setup e2e penting:** aplikasi test memanggil `app.setGlobalPrefix('api')` agar path sama dengan `main.ts` production. Tanpa ini, e2e akan false-negative (404).

---

### 5.4 Coverage map (api) — Phase 0

| Endpoint / class | Unit | E2E | Catatan |
|------------------|------|-----|---------|
| `AppService.getHealth` | Ya | Ya (via `/api`) | |
| `AppController.getHello` | Ya | Ya | |
| `AppController.health` | Ya | Ya | |
| CORS config | Tidak | Tidak | Manual / config review |
| Auth modules | N/A | N/A | Phase 1 |

---

## 6. Manual / smoke verification (Phase 0)

Selain automated tests, verifikasi manual yang relevan Phase 0:

| # | Check | Cara | Expected | Status (dev) |
|---|-------|------|----------|--------------|
| 1 | Web dev server | `npm run dev` di `apps/web` | http://localhost:3000 load | Observed OK |
| 2 | Home demo events | Buka `/` | Grid event cards + CTA | Manual |
| 3 | Search page | Buka `/search` | Filter kategori + list | Manual |
| 4 | Event detail | Klik card → `/events/[id]` | Detail demo | Manual |
| 5 | Theme toggle | Klik ikon tema di Navbar | Light ↔ Dark | Manual |

| 6 | Favicon | Load `/favicon.ico` | 200 (bukan 500) | Observed OK setelah clear `.next` |
| 7 | API health (manual) | `curl localhost:3001/api/health` | JSON ok | Covered by e2e |
| 8 | Production build web | `npm run build` | Build success | Done di setup Phase 0 |
| 9 | Production build api | `nest build` / `npm run build` | Build success | Done di setup Phase 0 |

---

## 7. Defects & risks

### Defects found during Phase 0 testing setup

| ID | Severity | Description | Resolution |
|----|----------|-------------|------------|
| P0-T1 | Low | E2E default Nest scaffold expect `"Hello World!"` di `/` — tidak match implementasi health + prefix `/api` | E2E di-update ke kontrak nyata |
| P0-T2 | Low | IDE TypeScript: `describe`/`expect` unresolved di file `*.spec.ts` | Tambah `"types": ["jest", "node"]` di `tsconfig.json` |
| P0-T3 | Medium (ops) | Favicon 500 karena cache `.next` corrupt | Clear cache `.next` + regenerate |

### Open risks (bukan blocker Phase 0)

| Risk | Impact | Mitigasi ke depan |
|------|--------|-------------------|
| Belum ada Playwright e2e browser | Regresi navigasi/theme tidak ter-catch otomatis | Tambah e2e web di Phase 1–2 |
| Component coverage partial | Navbar/Footer/theme belum unit test | Perluas suite seiring fitur |
| Demo data ≠ API contract | Drift saat Phase 2 wiring | Contract tests + shared types |
| Coverage report belum di-CI | Kualitas gate manual | GitHub Actions: `npm test` web + api |

---

## 8. How to reproduce (CI-local)

```bash
# dari root repo
cd Website/apps/web
npm install
npm test
# Expected: 4 files, 16 tests passed

cd ../api
npm install
npm test
# Expected: 2 suites, 3 tests passed

npm run test:e2e
# Expected: 1 suite, 2 tests passed
```

**Exit criteria Phase 0 testing:** semua command di atas exit code 0.

---

## 9. Traceability: Phase 0 deliverables → tests

| Deliverable Phase 0 | Evidence automated | Evidence manual |
|---------------------|--------------------|-----------------|
| Next.js app shell | Button, EventCard tests | Home load |
| Design tokens / `cn` | `utils.test.ts` | Visual light/dark |
| Demo discovery data | `demo-events.test.ts` | Search/detail pages |
| NestJS API scaffold | service/controller unit + e2e | curl health |
| Global API prefix | e2e `/api/*` | README health URL |
| Theme provider | — | Theme toggle manual |
| Docker compose / env examples | — | Config review (no runtime test yet) |
| Docs (PRD, plan, cost, README) | — | Doc review |

---

## 10. Exit criteria checklist — Phase 0

| Criteria | Met? |
|----------|------|
| Web & API scaffold runnable locally | Yes |
| UI shell + tokens + demo pages | Yes |
| Light/Dark theme | Yes (manual) |

| API health endpoints | Yes (unit + e2e) |
| Automated test harness web | Yes (Vitest) |
| Automated test harness api | Yes (Jest unit + e2e) |
| All automated tests green | **Yes (21/21)** |
| README documents how to test | Yes |
| Auth / DB / real discovery API | No — Phase 1+ |

**Phase 0 testing status: COMPLETE / PASS**

---

## 11. Recommendations for next phases

1. **Phase 1 (Auth)**  
   - Unit: password hash, JWT issue/validate, DTO validation  
   - E2E: `POST /api/auth/register`, `POST /api/auth/login`, protected route 401  
   - Web: form validation tests (react-hook-form + zod)

2. **Phase 2 (Discovery API)**  
   - Integration tests dengan Postgres test container / docker-compose  
   - Contract tests: response shape event list/detail  
   - Ganti / parallelize demo-events tests dengan API mocks (MSW)

3. **Cross-cutting**  
   - GitHub Actions workflow: lint + test web + test api  
   - Optional Playwright: home → event detail happy path  
   - Coverage thresholds (mis. statements ≥ 70% untuk module baru)

---

## 12. File inventory (testing artifacts)

```
Website/
├── docs/phase-0-test-report.md          ← laporan ini
├── apps/web/
│   ├── vitest.config.ts
│   ├── src/test/setup.ts
│   ├── src/lib/utils.test.ts
│   ├── src/lib/demo-events.test.ts
│   ├── src/components/ui/button.test.tsx
│   └── src/components/event/event-card.test.tsx
└── apps/api/
    ├── src/app.service.spec.ts
    ├── src/app.controller.spec.ts
    └── test/app.e2e-spec.ts
```

---

## 13. Sign-off

| Role | Name | Date | Result |
|------|------|------|--------|
| Automation (local run) | Cline | 16 Mar 2026 | **21/21 PASS** |
| Phase 0 testing | — | — | **Accepted for Phase 0** |

*Laporan ini merefleksikan automated suite + smoke observation pada environment development lokal. Bukan audit keamanan atau performance formal.*
