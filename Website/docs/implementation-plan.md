# RuangTemu Web — Implementation Plan

> Rencana implementasi **aplikasi web**  
> Referensi produk: `Website/docs/product-requirements.md`  
> **Stack:** Next.js (React/TS) · NestJS (Node.js/TS) · PostgreSQL · Midtrans

---

## Tech Stack (Final — Web)

| Layer | Teknologi |
|-------|-----------|
| **Web App** | Next.js 15 (App Router) + TypeScript + React |
| **Styling** | Tailwind CSS + design tokens |
| **Theming** | `next-themes` · light / dark |


| **Client state** | Zustand |
| **Server state** | TanStack React Query |
| **HTTP** | Axios / fetch (typed) |
| **Forms** | React Hook Form + Zod |
| **Backend API** | NestJS (Node.js + TypeScript) |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT + Passport · refresh token · **httpOnly cookies** (web) |
| **Realtime** | Socket.io (NestJS Gateway) |
| **File storage** | AWS S3 / Cloudinary |
| **Payment** | Midtrans Snap (Snap.js di browser) |
| **Maps** | Google Maps JavaScript API |
| **QR generate** | `qrcode` (lib) |
| **QR scan** | `html5-qrcode` / BarcodeDetector |
| **Charts** | Recharts |
| **Email** | Resend / Nodemailer |
| **Queue/Cron** | BullMQ + Redis |
| **Notifikasi** | Email (primer) · Web Push (opsional P2) |

---

## Phase 0: Project Setup (Sprint 1 — 1 minggu)

### 0.1 Struktur di folder Website

```
Website/
├── docs/
│   ├── product-requirements.md
│   └── implementation-plan.md
├── apps/
│   ├── web/                      ← Next.js frontend
│   │   ├── app/                  ← App Router
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx              ← Home
│   │   │   │   ├── search/page.tsx
│   │   │   │   └── events/[id]/page.tsx
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── verify/
│   │   │   │   └── forgot-password/
│   │   │   ├── (app)/            ← authenticated shell
│   │   │   │   ├── my-tickets/
│   │   │   │   ├── chat/
│   │   │   │   ├── profile/
│   │   │   │   ├── wishlist/
│   │   │   │   └── organizer/
│   │   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   └── api/              ← optional BFF route handlers
│   │   ├── components/
│   │   │   ├── ui/               ← Button, Input, Card, Modal, Badge
│   │   │   ├── event/
│   │   │   ├── chat/
│   │   │   ├── organizer/
│   │   │   └── layout/           ← Navbar, Sidebar, Footer
│   │   ├── hooks/
│   │   ├── lib/                  ← api client, auth, socket, utils
│   │   ├── stores/
│   │   ├── types/
│   │   ├── styles/
│   │   └── public/
│   │
│   └── api/                      ← NestJS backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── auth/
│       │   ├── users/
│       │   ├── events/
│       │   ├── registrations/
│       │   ├── payments/
│       │   ├── chat/
│       │   ├── reviews/
│       │   ├── notifications/
│       │   ├── uploads/
│       │   ├── admin/
│       │   ├── common/
│       │   └── prisma/
│       ├── prisma/schema.prisma
│       └── test/
├── package.json                  ← pnpm/npm workspaces (opsional)
└── README.md
```

### 0.2 Dependencies Frontend (Next.js)

| Package | Fungsi |
|---------|--------|
| `next` `react` `react-dom` | Framework web |
| `typescript` | Type safety |
| `tailwindcss` `postcss` `autoprefixer` | Styling |
| `zustand` | Client state |
| `@tanstack/react-query` | Server state |
| `axios` | API client |
| `react-hook-form` `zod` `@hookform/resolvers` | Forms |
| `socket.io-client` | Chat |
| `date-fns` | Tanggal |
| `qrcode.react` / `qrcode` | Tampil QR e-tiket |
| `html5-qrcode` | Scan check-in |
| `@react-google-maps/api` | Peta |
| `recharts` | Analytics charts |
| `clsx` `tailwind-merge` | Class helpers |
| `lucide-react` | Icons |
| `next-themes` | Light / Dark theme |

| `js-cookie` (jika perlu) | Client cookie non-sensitive |


### 0.3 Dependencies Backend (NestJS)

| Package | Fungsi |
|---------|--------|
| `@nestjs/*` | Framework |
| `@nestjs/jwt` `passport` `passport-jwt` | Auth |
| `bcrypt` | Password hash |
| `prisma` `@prisma/client` | ORM |
| `class-validator` `class-transformer` | DTO |
| `@nestjs/websockets` `socket.io` | Chat |
| `@nestjs/bullmq` `bullmq` `ioredis` | Jobs |
| `midtrans-client` | Payment |
| `@aws-sdk/client-s3` / `cloudinary` | Upload |
| `resend` / `nodemailer` | Email |
| `helmet` `cookie-parser` `cors` | Security |
| `@nestjs/throttler` | Rate limit |

### 0.4 Design Tokens (Tailwind) + Theme

Selaras `docs/ui-ux-design-rules.md` §1 Color & §10 Dark Mode:

**Implementasi aktual (Phase 0):**

| File | Peran |
|------|--------|
| `apps/web/src/app/globals.css` | CSS variables light (`:root`) + dark (`.dark`) |
| `apps/web/src/components/providers/theme-provider.tsx` | `next-themes` (`attribute="class"`, default `light`) |

| `apps/web/src/components/ui/theme-toggle.tsx` | Toggle light ↔ dark (Navbar) |


```css
/* Ringkasan tokens */
:root {
  --primary: #2563EB;
  --secondary: #7C3AED;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --surface: #F8FAFC;
  /* radius 8/12/16/24, shadow layered */
}
.dark {
  --background: #121212; /* bukan pure black */
  --surface: #1a1a1a;
  --surface-elevated: #242424;
  /* primary/secondary sedikit lebih terang; shadow lebih soft */
}
```

**Aturan tema:**

- Hanya 2 mode: Light ↔ Dark (`enableSystem: false`, default `light`)
- Transisi background/color ~0.3s; hormati `prefers-reduced-motion`
- Toggle di Navbar (desktop + mobile), touch target ≥ 44px
- Semua warna komponen lewat token, **bukan** hardcode hex di JSX


### 0.5 Backend Decision

**NestJS + PostgreSQL + Prisma** (API-first, reusable untuk mobile nanti)

| Kebutuhan | Solusi Web |
|-----------|------------|
| Auth | JWT + refresh; set **httpOnly Secure cookie** dari API atau BFF |
| DB | PostgreSQL + Prisma |
| Realtime | Socket.io |
| Storage | S3 / Cloudinary |
| Jobs | BullMQ (hold ticket, post-event, email) |
| Payment | Midtrans Snap + webhook NestJS |
| SEO | Next.js RSC/SSR untuk halaman public |

---

## Phase 1: Authentication & Profile (Sprint 2)

### 1.1 Pages

| Page | Route |
|------|-------|
| Login | `/login` |
| Register | `/register` |
| OTP Verify | `/verify` |
| Forgot/Reset | `/forgot-password` |
| Profile | `/profile` `/profile/edit` |

### 1.2 Auth API (NestJS)

| Method | Endpoint |
|--------|----------|
| POST | `/auth/register` |
| POST | `/auth/login` |
| POST | `/auth/refresh` |
| POST | `/auth/logout` |
| POST | `/auth/verify-otp` |
| POST | `/auth/forgot-password` |
| POST | `/auth/reset-password` |
| GET | `/users/me` |
| PATCH | `/users/me` |

### 1.3 Web Auth Strategy

```
Login sukses
  → API return accessToken (+ refresh)
  → Prefer: Set-Cookie httpOnly untuk refresh
  → Access token: memory / short-lived cookie
  → Axios interceptor: attach Bearer; on 401 → refresh → retry
  → Next.js middleware: proteksi /organizer/*, /admin/*, /my-tickets/*
```

### 1.4 User model

```sql
users
├── id, email UNIQUE, password_hash
├── full_name, avatar_url, bio
├── role: enum('peserta','penyelenggara','admin')
├── interests text[], phone, is_verified
├── refresh_token_hash
├── created_at, updated_at
```

### 1.5 Komponen UI

`AuthForm`, `OTPInput`, `RoleSelector`, `InterestPicker`, `AvatarUploader` (file input + crop opsional)

---

## Phase 2: Discovery & Event Detail (Sprint 3)

### 2.1 Pages

| Page | Route | Rendering |
|------|-------|-----------|
| Home | `/` | RSC + client islands |
| Search | `/search` | Client filters + infinite query |
| Event detail | `/events/[id]` | **SSR/RSC** (SEO) |
| Organizer public | `/organizers/[id]` | SSR |

### 2.2 Events API

| Method | Endpoint |
|--------|----------|
| GET | `/events` |
| GET | `/events/nearby?lat=&lng=&radiusKm=` |
| GET | `/events/popular` |
| GET | `/events/:id` |
| POST | `/events` (penyelenggara) |
| PATCH | `/events/:id` |
| DELETE | `/events/:id` |

### 2.3 Event model

```sql
events
├── id, organizer_id
├── title, description, category, cover_image_url
├── location_name, location_lat, location_lng
├── event_date, event_end_date
├── max_capacity, current_count
├── ticket_type free|paid, ticket_price
├── status draft|active|full|cancelled|completed
├── is_selective, is_reported
├── created_at, updated_at
```

### 2.4 Filter

```ts
interface EventFilter {
  keyword: string;
  category: string | null;
  dateRange: { start: Date; end: Date } | null;
  radiusKm: number;
  userLocation: { lat: number; lng: number } | null;
  ticketType: 'all' | 'free' | 'paid';
  sortBy: 'date' | 'distance' | 'popularity';
}
```

- Nearby: Haversine SQL / PostGIS  
- Debounce search 300ms  
- Infinite scroll / "Load more"  
- Geolocation: `navigator.geolocation` + fallback pilih kota

### 2.5 Layout Home (Web)

```
Navbar: Logo | Search | [Buat Event] | Avatar
Hero + search bar
Category chips
Section: Populer
Section: Segera dimulai (grid cards responsive)
Footer
```

Event card: cover, title, date, location, quota badge, price badge.

---

## Phase 3: RSVP, Payment & E-Ticket (Sprint 4)

### 3.1 Pages

| Page | Route |
|------|-------|
| RSVP confirm | `/events/[id]/rsvp` (modal atau page) |
| Payment | `/events/[id]/payment` |
| Payment result | `/events/[id]/payment/result` |
| My tickets | `/my-tickets` |
| Ticket detail | `/my-tickets/[id]` |

### 3.2 API

| Method | Endpoint |
|--------|----------|
| POST | `/events/:id/register` |
| POST | `/payments/create` |
| POST | `/payments/webhook` (public, signature) |
| GET | `/registrations/me` |
| GET | `/registrations/:id` |
| POST | `/registrations/:id/cancel` |

### 3.3 Models

```sql
registrations — status, payment_status, qr_code, held_until, checked_in_at
payments — amount, platform_fee, method, external_id, status
```

### 3.4 Flow

```
Free: lock kuota → confirmed → QR → /my-tickets/[id]
Paid: hold 15m → Snap.js popup/embed → webhook → confirmed/QR
Timeout: BullMQ job cancel + release seat
```

### 3.5 Midtrans Web

```
1. Browser → POST /payments/create
2. NestJS → Midtrans Snap token
3. Frontend: window.snap.pay(token)
4. Midtrans → webhook NestJS
5. UI poll / React Query invalidate registration
```

### 3.6 QR E-Ticket Web

- Generate QR di client dari payload server (atau image URL server)
- Halaman print-friendly + tombol download PNG
- Email HTML berisi link tiket

---

## Phase 4: Organizer (Sprint 5)

### 4.1 Pages

| Page | Route |
|------|-------|
| Dashboard | `/organizer` |
| Create | `/organizer/events/new` |
| Edit | `/organizer/events/[id]/edit` |
| Participants | `/organizer/events/[id]/participants` |
| Check-in | `/organizer/events/[id]/checkin` |
| Analytics | `/organizer/events/[id]/analytics` |
| Broadcast | `/organizer/events/[id]/broadcast` |

### 4.2 API

| Method | Endpoint |
|--------|----------|
| GET | `/organizer/dashboard` |
| GET | `/organizer/events/:id/participants` |
| POST | `.../participants/:regId/approve` |
| POST | `/organizer/events/:id/checkin` |
| GET | `/organizer/events/:id/analytics` |
| POST | `/organizer/events/:id/broadcast` |

### 4.3 Event builder steps

1. Info dasar + cover  
2. Waktu & lokasi (map picker)  
3. Tiket & kuota  
4. Preview publish/draft  

### 4.4 Check-in Web

```
Opsi A: html5-qrcode (kamera HP/laptop)
Opsi B: input manual registration code / QR payload
→ POST checkin → validasi hash + status → attended
```

Layout organizer: **sidebar desktop** + **bottom/top nav mobile**.

---

## Phase 5: Chat (Sprint 6)

### 5.1 Pages

| Page | Route |
|------|-------|
| Chat list | `/chat` |
| Room | `/chat/[eventId]` |

### 5.2 Models

`chat_rooms` (1 per event), `messages` (text|image|system)

### 5.3 NestJS

- `ChatGateway` Socket.io  
- JWT di handshake  
- Room `event:{eventId}`  
- REST history: `GET /chat/:eventId/messages?cursor=`  
- Auto-join saat registration confirmed  

### 5.4 Web UX

- Optimistic send  
- Scroll pagination ke atas  
- Reconnect indicator  

---

## Phase 6: Post-Event & Moderation (Sprint 7)

### 6.1 Pages

| Page | Route |
|------|-------|
| Review | `/events/[id]/review` |
| Gallery | `/events/[id]/gallery` |
| Report | modal global |
| Wishlist | `/wishlist` |
| Admin reports | `/admin/reports` |
| Admin tickets | `/admin/tickets` |

### 6.2 Models

`reviews`, `event_gallery`, `reports`, `bookmarks`, `help_tickets` (P2)

### 6.3 Jobs (BullMQ)

- Setiap 30m: complete events + enqueue “minta rating”  
- Release expired holds (`held_until < now`)  

---

## Phase 7: Notifications & Polish (Sprint 8)

### 7.1 Channels

| Channel | Penggunaan |
|---------|------------|
| Email | Verifikasi, e-tiket, H-1, broadcast |
| In-app toast/bell | RSVP, payment (P1/P2) |
| Web Push | Opsional P2 (service worker) |

### 7.2 Polish Web

- Skeleton loaders, empty states, error boundaries  
- Optimistic UI di RSVP/chat  
- Responsive breakpoints  
- SEO metadata + Open Graph event  
- Accessibility (focus trap modal, labels)  
- Rate limit login & webhook hardening  
- **Theme:** light/dark sudah di Phase 0; pastikan halaman baru tetap pakai token



---

## Ringkasan Arsitektur Web

```
┌─────────────────────────────────────────────────┐
│  NEXT.JS (Browser)                              │
│  App Router · RSC/SSR · Tailwind · React Query  │
│  Zustand · Socket.io-client · Snap.js · Maps    │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS + WSS + Cookies
┌──────────────────────┴──────────────────────────┐
│  NESTJS API (Node.js + TypeScript)              │
│  Auth · Events · Registrations · Payments       │
│  ChatGateway · Uploads · Admin · Notifications  │
│  Prisma → PostgreSQL                            │
│  BullMQ → Redis                                 │
└──────────────────────┬──────────────────────────┘
                       │
          Midtrans · S3/Cloudinary · Resend · Google Maps
```

**API-first:** mobile Expo di root `docs/` bisa consume API yang sama nanti.

---

## Database ERD (sama)

```
users ──┬── events ──┬── registrations ── payments
        │            ├── chat_rooms ── messages
        │            ├── reviews / gallery / bookmarks
        │            └── reports
        ├── web_push_subscriptions (opsional)
        └── help_tickets
```

---

## Sprint Timeline

| Sprint | Phase | Deliverable |
|--------|-------|-------------|
| S1 | Setup | Next.js + NestJS + Prisma + Tailwind **+ light/dark theme** |

| S2 | Auth | Cookie JWT, profil, role routes |
| S3 | Discovery | Home, search, SSR event detail |
| S4 | RSVP/Pay | Free+paid, Midtrans, e-tiket |
| S5 | Organizer | Builder, peserta, check-in web |
| S6 | Chat | Socket.io |
| S7 | Post-event | Rating, gallery, admin |
| S8 | Polish | Email, SEO, a11y, stabilisasi |
| — | **~9.5 minggu** | **MVP Web** |

---

## Prioritas MVP Web

**P0:** Auth · Home/Search/Detail · RSVP free · Event builder · My Tickets QR · **Light/Dark theme (2 mode)**  

**P1:** Midtrans+hold · Check-in web · Email · Chat · Peserta/broadcast · SEO  

**P2:** Analytics · Rating · Gallery · Report/Admin · Help desk · Web Push  

> Theme sudah diimplementasi di Phase 0 (shell UI); bukan ditunda ke P2.



---

## Mapping dari Plan Mobile → Web

| Mobile (Expo) | Web (Next.js) |
|---------------|---------------|
| `apps/mobile` | `Website/apps/web` |
| Expo Router | App Router |
| SecureStore | httpOnly cookies |
| expo-camera | html5-qrcode |
| expo-location | Geolocation API |
| react-native-maps | Google Maps JS |
| Expo Push | Email + Web Push opsional |
| StyleSheet | Tailwind CSS |
| NestJS API | **Sama** (reuse) |

---

## Langkah Setup Awal (setelah approve)

1. Init `Website/apps/web` dengan `create-next-app` (TS, Tailwind, App Router)  
2. Init `Website/apps/api` dengan NestJS CLI + Prisma  
3. Docker Compose: PostgreSQL + Redis (dev)  
4. Env: `DATABASE_URL`, `JWT_SECRET`, `MIDTRANS_*`, `S3_*`, `NEXT_PUBLIC_API_URL`  
5. Implement design tokens + layout shell (Navbar)  
6. Auth end-to-end pertama  

---

## Deployment Strategy (Best Practice)

> **Biaya lengkap (A/B/C/D):** `Website/docs/deployment-cost-scenarios.md`  
> **PRD:** keputusan demo gratis di `Website/docs/product-requirements.md` §10

Arsitektur **portable**: ganti host/env, **bukan rewrite** kode.

### Keputusan eksekusi — full gratis dulu (demo), migrasi berbayar nanti

| Urutan | Skenario | Kapan | Biaya |
|--------|----------|-------|-------|
| **1** | **A — Full gratis lokal** | Phase 0–2 coding | Rp 0 |
| **2** | **B — Demo online gratis** | Share link demo | ~Rp 0 (API boleh sleep) |
| **3** | **C — MVP murah** | Soft launch / payment production | ~USD 5–15/bln |
| **4** | **D — VPS Docker** | Scale / kontrol penuh | nanti |

**Target sekarang = A → B.** Naik ke C/D kapan saja tanpa ganti stack aplikasi.

### Fase 1a — Demo gratis (sekarang)

| Komponen | Platform | Catatan |
|----------|----------|---------|
| **Frontend Next.js** | **Vercel Hobby** | Free, SSR OK |
| **Backend NestJS** | **Render Free** | Boleh cold start/sleep |
| **PostgreSQL** | **Neon free** / Render free DB | Cukup data demo |
| **Redis** | **Upstash free** | Hold tiket & job ringan |
| **File** | **Cloudinary free** | Avatar/cover |
| **Payment** | **Midtrans Sandbox** | Bukan uang sungguhan |

```
Demo gratis:
  Vercel (Next.js) ──► Render Free (NestJS, bisa sleep)
                         ├── Neon Postgres
                         └── Upstash Redis
```

**Scope demo:** register → home → event detail → RSVP **gratis** → e-tiket QR.  
Chat realtime & Midtrans production lebih nyaman setelah Fase 1b.

### Fase 1b — Soft launch berbayar (migrasi nanti)

| Komponen | Platform | Alasan |
|----------|----------|--------|
| **Frontend Next.js** | **Vercel** (tetap) | Optimal App Router/SSR |
| **Backend NestJS** | **Railway** (default) / Render paid | Always-on: webhook, BullMQ, Socket.io |
| **PostgreSQL** | Railway/Render managed | Backup & stabil |
| **Redis** | Railway Redis / Upstash | Queue andal |
| **File** | Cloudinary / S3 | URL Cloudinary bisa tetap |
| **Payment** | Midtrans **production** | Ganti keys + webhook URL API baru |

```
┌──────────────────┐         ┌─────────────────────────────┐
│  Vercel          │  HTTPS  │  Railway / Render (paid)    │
│  Next.js (web)   │ ──────► │  NestJS API always-on       │
│                  │  WSS    │  ├── PostgreSQL             │
│  NEXT_PUBLIC_    │ ──────► │  ├── Redis + BullMQ         │
│  API_URL=api...  │         │  └── Socket.io Gateway      │
└──────────────────┘         └──────────────┬──────────────┘
                                            │
                     Midtrans webhook · S3/Cloudinary · Email
```

### Migrasi gratis → berbayar (tanpa rewrite)

Yang diganti: provider + env (`DATABASE_URL`, `REDIS_URL`, `NEXT_PUBLIC_API_URL`, `CORS_ORIGIN`, Midtrans keys).  
Yang tetap: kode Next.js/NestJS, Prisma schema, asset Cloudinary.

```bash
# Contoh pindah DB (naik ke Skenario C)
pg_dump "$OLD_DATABASE_URL" > backup.sql
psql "$NEW_DATABASE_URL" < backup.sql
npx prisma migrate deploy
```

Redis: tidak wajib dimigrasi (cache/queue boleh kosong).

**Env penting (contoh):**

```bash
# Vercel (web)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_KEY=...

# API (Render free / Railway paid)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
MIDTRANS_SERVER_KEY=...
MIDTRANS_IS_PRODUCTION=false
CORS_ORIGIN=https://your-app.vercel.app
COOKIE_DOMAIN=...
S3_... / CLOUDINARY_...
```

### Fase 2 — Scale (nanti, bila perlu)

Pindah **backend + DB + Redis** ke **VPS + Docker** ketika:

- Traffic/klien aktif butuh kontrol biaya
- Queue BullMQ / Redis melewati limit hobby
- Butuh worker terpisah / multi-instance

Frontend **boleh tetap di Vercel**.

```
Vercel (Next.js)  ──►  VPS Docker Compose
                       ├── api (NestJS)
                       ├── worker (BullMQ, opsional)
                       ├── postgres
                       └── redis
```

### Checklist teknis

| Topik | Yang harus disiapkan |
|-------|----------------------|
| **CORS** | `CORS_ORIGIN` = domain Vercel (+ custom domain) |
| **Cookies JWT** | `SameSite=None; Secure` jika web & API beda domain; atau BFF |
| **Socket.io** | Provider support WebSocket (bukan Vercel serverless) |
| **Webhook Midtrans** | URL publik API (bukan localhost) |
| **Cold start** | Render free sleep = OK demo; production → always-on |
| **Migrations** | `prisma migrate deploy` di release command |
| **Secrets** | Dashboard Vercel + Render/Railway; jangan commit `.env` |
| **Custom domain** | `app.` (Vercel) + `api.` (Railway/Render) — opsional di demo |

### Rekomendasi provider backend

| | Railway | Render |
|--|---------|--------|
| DX | Sangat mudah | Matang |
| Free | Trial credit | Free web (sleep) + free DB terbatas |
| Always-on murah | **Default Skenario C** | Starter paid |
| Demo gratis | Alternatif | **Default Skenario B** |

### Yang TIDAK disarankan di fase awal

- NestJS + Socket.io + BullMQ di **Vercel serverless**
- Upload ke disk container (pakai Cloudinary/S3)
- Monolit all-in-one di Vercel saja
- Midtrans **production** di API free yang sering sleep

---

*Dokumen ini khusus development web di folder `Website/`. Versi mobile tetap di `docs/` root project.*


