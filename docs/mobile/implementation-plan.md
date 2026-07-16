# RuangTemu — Implementation Plan

> Rencana implementasi detail untuk React Native (Expo) + NestJS (Node.js + TypeScript) + PostgreSQL  
> Referensi: docs/mobile/product-requirements.md  
> **Stack fix:** Frontend Expo · Backend NestJS · DB PostgreSQL · Payment Midtrans

---

## Tech Stack (Final)

| Layer | Teknologi |
|-------|-----------|
| **Mobile App** | React Native (Expo) + TypeScript |
| **Navigation** | Expo Router |
| **State** | Zustand + TanStack React Query |
| **Backend API** | NestJS (Node.js + TypeScript) |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT + Passport (NestJS) · bcrypt · refresh token |
| **Realtime Chat** | Socket.io (NestJS Gateway) |
| **File Storage** | AWS S3 / Cloudinary |
| **Payment** | Midtrans (QRIS, VA, E-Wallet) |
| **Push Notif** | Expo Push Notifications |
| **Maps** | Google Maps API + react-native-maps |
| **Email** | Resend / Nodemailer |
| **Queue/Cron** | BullMQ + Redis (hold tiket, post-event, notif) |

---

## Phase 0: Project Setup & Foundation (Sprint 1 — 1 minggu)

### 0.1 Struktur Monorepo (disarankan)

```
RuangTemu/
├── apps/
│   ├── mobile/                 ← Expo React Native app
│   │   ├── app/                ← Expo Router
│   │   │   ├── (auth)/
│   │   │   ├── (tabs)/
│   │   │   │   ├── home/
│   │   │   │   ├── search/
│   │   │   │   ├── my-events/
│   │   │   │   ├── chat/
│   │   │   │   └── profile/
│   │   │   ├── event/
│   │   │   ├── organizer/
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── services/           ← API client ke NestJS
│   │   ├── stores/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── api/                    ← NestJS backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── auth/           ← JWT, register, login, refresh
│       │   ├── users/
│       │   ├── events/
│       │   ├── registrations/
│       │   ├── payments/       ← Midtrans create + webhook
│       │   ├── chat/           ← Socket.io gateway
│       │   ├── reviews/
│       │   ├── notifications/
│       │   ├── uploads/        ← S3/Cloudinary
│       │   ├── admin/
│       │   ├── common/         ← guards, filters, pipes, decorators
│       │   └── prisma/
│       ├── prisma/
│       │   └── schema.prisma
│       └── test/
│
├── docs/
└── package.json                ← optional workspace root
```

### 0.2 Dependencies Frontend (Expo)

| Package | Fungsi |
|---------|--------|
| `expo-router` | File-based navigation |
| `zustand` | Client state |
| `@tanstack/react-query` | Server state & cache |
| `axios` | HTTP client ke NestJS API |
| `react-hook-form` + `zod` | Form validation |
| `react-native-reanimated` | Animasi |
| `expo-image` | Image loading |
| `expo-camera` | QR Scanner check-in |
| `expo-location` | GPS / radius search |
| `react-native-maps` | Peta lokasi |
| `expo-notifications` | Push notifications |
| `react-native-qrcode-svg` | Generate e-tiket QR |
| `expo-secure-store` | Simpan access/refresh token |
| `socket.io-client` | Chat realtime |
| `date-fns` | Format tanggal |

### 0.3 Dependencies Backend (NestJS)

| Package | Fungsi |
|---------|--------|
| `@nestjs/core` + common + platform-express | Framework |
| `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt` | Auth JWT |
| `bcrypt` | Hash password |
| `@prisma/client` + `prisma` | ORM PostgreSQL |
| `class-validator` + `class-transformer` | DTO validation |
| `@nestjs/websockets` + `socket.io` | Chat realtime |
| `@nestjs/bullmq` + `bullmq` + `ioredis` | Queue & cron jobs |
| `midtrans-client` | Payment gateway |
| `@aws-sdk/client-s3` atau `cloudinary` | File storage |
| `nodemailer` / `resend` | Email |
| `helmet` + `cors` + `throttle` | Security |

### 0.4 Design System Setup

Berdasarkan `docs/shared/ui-ux-design-rules.md`:

```typescript
// apps/mobile/constants/theme.ts
export const colors = {
  primary: '#2563EB',
  secondary: '#7C3AED',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: { primary: '#0F172A', secondary: '#64748B', disabled: '#94A3B8' },
  border: '#E2E8F0',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };
export const typography = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '600', lineHeight: 30 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
};
```

### 0.5 Backend Decision (Final)

**NestJS + PostgreSQL + Prisma**

| Kebutuhan | Solusi |
|-----------|--------|
| Auth & verifikasi | NestJS AuthModule (JWT + refresh + OTP email) |
| Database | PostgreSQL + Prisma ORM |
| Real-time | Socket.io via NestJS Gateway |
| File storage | AWS S3 atau Cloudinary |
| Background jobs | BullMQ + Redis (hold timeout, cron post-event, email/push) |
| Concurrency kuota | Prisma `$transaction` + row lock / unique constraint |
| Payment | NestJS PaymentsModule → Midtrans API + webhook endpoint |

---

## Phase 1: Authentication & User Profile (Sprint 2 — 1 minggu) — ✅ COMPLETED

*(Selesai: Semua API Auth, Middleware Next.js, Zustand Store, Interceptor Axios, Halaman Login/Register/Verify/Forgot/Profile terintegrasi penuh di versi Web. Backend API juga siap digunakan untuk Mobile.)*

### 1.1 Screens (Mobile)

| Screen | Route | Deskripsi |
|--------|-------|-----------|
| Welcome | `(auth)/welcome` | Onboarding, CTA login/register |
| Login | `(auth)/login` | Email + password |
| Register | `(auth)/register` | Nama, email, password, role |
| OTP Verify | `(auth)/verify` | Verifikasi email |
| Forgot Password | `(auth)/forgot-password` | Reset via email |
| Edit Profile | `profile/edit` | Foto, bio, minat, lokasi |

### 1.2 NestJS Auth API

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/register` | Buat user + hash password |
| POST | `/auth/login` | Return access + refresh token |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |
| POST | `/auth/verify-otp` | Verifikasi email |
| POST | `/auth/forgot-password` | Kirim link/OTP reset |
| POST | `/auth/reset-password` | Set password baru |
| GET | `/users/me` | Profil user login |
| PATCH | `/users/me` | Update profil |

### 1.3 Data Model: Users

```sql
users
├── id: uuid (PK)
├── email: text UNIQUE
├── password_hash: text
├── full_name: text
├── avatar_url: text
├── bio: text
├── role: enum('peserta', 'penyelenggara', 'admin')
├── interests: text[]
├── phone: text
├── is_verified: boolean
├── refresh_token_hash: text NULL
├── created_at: timestamptz
└── updated_at: timestamptz
```

### 1.4 Logika Kunci

- Role dipilih saat register → mempengaruhi navigasi & akses fitur
- Penyelenggara juga bisa jadi peserta (dual role di UI)
- Access token pendek (15m) + refresh token panjang (7d) di SecureStore
- `JwtAuthGuard` + `RolesGuard` di NestJS untuk proteksi endpoint
- Protected routes di Expo Router cek auth state di root layout

### 1.5 Komponen Mobile

- `AuthForm`, `OTPInput`, `RoleSelector`, `InterestPicker`, `AvatarUploader`

---

## Phase 2: Event Discovery & Home (Sprint 3 — 1.5 minggu)

### 2.1 Screens

| Screen | Route | Deskripsi |
|--------|-------|-----------|
| Home | `(tabs)/home` | Rekomendasi, kategori, nearby |
| Search | `(tabs)/search` | Keyword + filter |
| Event Detail | `event/[id]` | Detail + CTA RSVP |
| Organizer Profile | `organizer/[id]/profile` | Profil + rating + acara lain |

### 2.2 NestJS Events API

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/events` | List + filter (kategori, tanggal, radius, harga) |
| GET | `/events/:id` | Detail event |
| GET | `/events/nearby` | Radius dari lat/lng user |
| GET | `/events/popular` | Sorting popularitas |
| POST | `/events` | Create (penyelenggara) |
| PATCH | `/events/:id` | Update |
| DELETE | `/events/:id` | Soft cancel |

### 2.3 Data Model: Events

```sql
events
├── id: uuid (PK)
├── organizer_id: uuid (FK → users)
├── title: text
├── description: text
├── category: text
├── cover_image_url: text
├── location_name: text
├── location_lat: float
├── location_lng: float
├── event_date: timestamptz
├── event_end_date: timestamptz
├── max_capacity: integer
├── current_count: integer
├── ticket_type: enum('free', 'paid')
├── ticket_price: integer
├── status: enum('draft', 'active', 'full', 'cancelled', 'completed')
├── is_selective: boolean
├── is_reported: boolean
├── created_at: timestamptz
└── updated_at: timestamptz
```

### 2.4 Search & Filter

```typescript
interface EventFilter {
  keyword: string;
  category: string | null;
  dateRange: { start: Date; end: Date } | null;
  radiusKm: number;
  userLocation: { lat: number; lng: number };
  ticketType: 'all' | 'free' | 'paid';
  sortBy: 'date' | 'distance' | 'popularity';
}
```

- Geolocation: formula Haversine di SQL/Prisma raw query, atau PostGIS
- Debounced keyword search 300ms di mobile
- Infinite scroll: React Query `useInfiniteQuery`, 20 item/page

---

## Phase 3: RSVP, Payment & E-Ticket (Sprint 4 — 1.5 minggu)

### 3.1 Screens

| Screen | Route | Deskripsi |
|--------|-------|-----------|
| RSVP Confirm | `event/[id]/rsvp` | Konfirmasi daftar |
| Payment | `event/[id]/payment` | Metode bayar + countdown 15:00 |
| Payment Status | `event/[id]/payment-status` | Sukses / gagal / pending |
| My Tickets | `(tabs)/my-events` | Tiket upcoming & past |
| Ticket Detail | `my-events/ticket/[id]` | QR e-tiket |

### 3.2 NestJS Registrations & Payments API

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/events/:id/register` | RSVP (free/paid hold) |
| POST | `/payments/create` | Buat transaksi Midtrans |
| POST | `/payments/webhook` | Callback Midtrans (public, signed) |
| GET | `/registrations/me` | Tiket saya |
| GET | `/registrations/:id` | Detail + QR payload |
| POST | `/registrations/:id/cancel` | Batalkan (jika diizinkan) |

### 3.3 Data Model

```sql
registrations
├── id: uuid (PK)
├── event_id: uuid (FK → events)
├── user_id: uuid (FK → users)
├── status: enum('pending', 'confirmed', 'cancelled', 'attended')
├── payment_status: enum('none', 'pending', 'paid', 'refunded', 'expired')
├── qr_code: text
├── held_until: timestamptz
├── registered_at: timestamptz
└── checked_in_at: timestamptz

payments
├── id: uuid (PK)
├── registration_id: uuid (FK → registrations)
├── amount: integer
├── platform_fee: integer
├── payment_method: text
├── external_id: text
├── status: enum('pending', 'success', 'failed', 'expired')
├── paid_at: timestamptz
└── created_at: timestamptz
```

### 3.4 RSVP Flow

```
Peserta klik "Daftar"
    │
    ├── GRATIS → transaction lock cek kuota
    │              → confirmed + QR + current_count +1
    │
    └── BERBAYAR → hold slot 15 menit (pending)
                   → current_count +1 tentative
                   → create Midtrans Snap
                   → bayar sukses? confirmed + QR
                   → timeout/gagal? cancel + current_count -1
```

**Kuota concurrency (NestJS + Prisma):**

```typescript
await prisma.$transaction(async (tx) => {
  const event = await tx.event.findUnique({ where: { id }, /* FOR UPDATE via raw if needed */ });
  if (event.current_count >= event.max_capacity) throw new ConflictException('Kuota penuh');
  // insert registration + increment count
});
```

### 3.5 Payment Flow (NestJS + Midtrans)

```
1. Mobile → POST /payments/create
2. NestJS PaymentsService → Midtrans Snap API
3. Return snap token / redirect URL
4. Mobile buka Midtrans (WebView)
5. User bayar
6. Midtrans → POST /payments/webhook
7. NestJS verifikasi signature → update registration + payment
8. Optional: emit Socket.io event / push notif ke user
```

### 3.6 QR E-Ticket

```typescript
const qrData = {
  registrationId,
  eventId,
  userId,
  hash: sha256(`${registrationId}-${eventId}-${SECRET_KEY}`),
};
```

---

## Phase 4: Organizer Dashboard & Event Management (Sprint 5 — 1.5 minggu)

### 4.1 Screens

| Screen | Route | Deskripsi |
|--------|-------|-----------|
| Dashboard | `organizer/dashboard` | Metrics overview |
| Create Event | `organizer/create-event` | Multi-step form |
| Edit Event | `organizer/event/[id]/edit` | Edit |
| Participants | `organizer/event/[id]/participants` | List + approve/reject |
| Check-in | `organizer/event/[id]/checkin` | QR scanner |
| Analytics | `organizer/event/[id]/analytics` | Grafik |
| Broadcast | `organizer/event/[id]/broadcast` | Push/message ke peserta |

### 4.2 NestJS Organizer API

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/organizer/dashboard` | Aggregate metrics |
| GET | `/organizer/events/:id/participants` | List peserta |
| POST | `/organizer/events/:id/participants/:regId/approve` | Approve selektif |
| POST | `/organizer/events/:id/checkin` | Validasi QR |
| GET | `/organizer/events/:id/analytics` | Stats |
| POST | `/organizer/events/:id/broadcast` | Kirim notif massal |

### 4.3 Event Builder Steps

1. Info dasar (judul, deskripsi, kategori, cover)
2. Waktu & lokasi (datepicker + map pin)
3. Tiket & kuota (free/paid, harga, capacity, selective)
4. Preview & publish / draft

### 4.4 Check-in Flow

```
Scan QR → NestJS validasi hash + status confirmed + belum check-in
       → status attended + checked_in_at
       → return nama & foto peserta
```

---

## Phase 5: Chat & Community (Sprint 6 — 1 minggu)

### 5.1 Screens

| Screen | Route | Deskripsi |
|--------|-------|-----------|
| Chat List | `(tabs)/chat` | Room per acara |
| Chat Room | `chat/[eventId]` | Pesan realtime |

### 5.2 Data Model

```sql
chat_rooms
├── id: uuid (PK)
├── event_id: uuid (FK → events, UNIQUE)
├── created_at: timestamptz

messages
├── id: uuid (PK)
├── room_id: uuid (FK → chat_rooms)
├── sender_id: uuid (FK → users)
├── content: text
├── message_type: enum('text', 'image', 'system')
├── created_at: timestamptz
```

### 5.3 Implementasi NestJS

- `ChatGateway` (Socket.io): join room `event:{eventId}`, broadcast message
- REST `GET /chat/:eventId/messages` untuk history (pagination)
- Auth socket dengan JWT di handshake
- Auto-join room saat registration confirmed
- Optimistic UI di mobile + reconcile dari server

---

## Phase 6: Post-Event, Rating & Moderation (Sprint 7 — 1 minggu)

### 6.1 Screens

| Screen | Route | Deskripsi |
|--------|-------|-----------|
| Rate Event | `event/[id]/rate` | Bintang + ulasan |
| Gallery | `event/[id]/gallery` | Grid foto |
| Report | `event/[id]/report` | Form laporan |
| Wishlist | `profile/wishlist` | Bookmark |

### 6.2 Data Model

```sql
reviews
├── id, event_id, user_id, rating (1-5), comment, created_at

event_gallery
├── id, event_id, uploader_id, image_url, created_at

reports
├── id, reporter_id, target_type, target_id, reason, status, created_at

bookmarks
├── id, user_id, event_id, created_at
```

### 6.3 Post-Event Cron (BullMQ)

```
Job setiap 30 menit:
  → events WHERE event_end_date < NOW() - 1 hour AND status = 'active'
  → set status = 'completed'
  → enqueue push notif ke peserta attended: minta rating
```

Job terpisah: release hold tiket expired (`held_until < NOW()` & payment still pending).

---

## Phase 7: Notifications & Polish (Sprint 8 — 1 minggu)

### 7.1 Notification Types

| Trigger | Penerima | Channel |
|---------|----------|---------|
| RSVP baru | Penyelenggara | Push + in-app |
| Payment sukses | Peserta | Push + email |
| H-1 acara | Peserta | Push |
| Acara selesai | Peserta attended | Push |
| Broadcast | Peserta registered | Push |
| Report reviewed | Reporter | Push |

### 7.2 NestJS Notifications

- Simpan `expo_push_token` di tabel `device_tokens`
- Service kirim via Expo Push API
- Email via Resend/Nodemailer untuk e-tiket & verifikasi

### 7.3 Polish Mobile

- Skeleton loading, empty states, error boundaries
- Pull-to-refresh, haptic feedback
- Offline indicator, accessibility (testID + labels)
- Dark mode optional (tokens siap)

---

## Ringkasan Arsitektur

```
┌──────────────────────────────────────────────────┐
│                  FRONTEND                         │
│              React Native (Expo)                  │
│  Expo Router · Zustand · React Query · Axios     │
│  Socket.io-client · SecureStore · Maps/Camera    │
└──────────────────────┬───────────────────────────┘
                       │ HTTPS + WSS
┌──────────────────────┴───────────────────────────┐
│           BACKEND: NestJS (Node.js + TS)          │
│                                                   │
│  AuthModule (JWT/Passport)                        │
│  Users · Events · Registrations · Payments        │
│  ChatGateway (Socket.io) · Reviews · Admin        │
│  Uploads · Notifications · BullMQ processors      │
│                                                   │
│  Prisma ORM ──► PostgreSQL                        │
│  Redis ──► BullMQ queues                          │
└──────────────────────┬───────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │     EXTERNAL SERVICES   │
          │  ├── Midtrans (payment) │
          │  ├── AWS S3/Cloudinary  │
          │  ├── Expo Push          │
          │  ├── Google Maps API    │
          │  └── Resend (email)     │
          └─────────────────────────┘
```

---

## Database Schema (ERD Summary)

```
users ──────┬──── events (organizer_id)
            │        │
            │        ├──── registrations ─── payments
            │        ├──── chat_rooms ────── messages
            │        ├──── reviews
            │        ├──── event_gallery
            │        ├──── bookmarks
            │        └──── reports (target)
            │
            ├──── device_tokens
            └──── reports (reporter)
```

---

## Sprint Timeline

| Sprint | Phase | Durasi | Deliverable |
|--------|-------|--------|-------------|
| S1 | Phase 0: Setup | 1 minggu | Expo app + NestJS API + Prisma + PostgreSQL + design tokens |
| S2 | Phase 1: Auth | 1 minggu | ✅ Register/login JWT, profile, role guards (Selesai) |
| S3 | Phase 2: Discovery | 1.5 minggu | Home, search, event detail, geo filter |
| S4 | Phase 3: RSVP & Payment | 1.5 minggu | Hold kuota, Midtrans, e-tiket QR |
| S5 | Phase 4: Organizer | 1.5 minggu | Event builder, dashboard, check-in |
| S6 | Phase 5: Chat | 1 minggu | Socket.io chat per acara |
| S7 | Phase 6: Post-Event | 1 minggu | Rating, gallery, report |
| S8 | Phase 7: Polish | 1 minggu | Notif, loading, error handling |
| — | **Total** | **~9.5 minggu** | **MVP Complete** |

---

## Prioritas MVP

**Must Have (P0):**
1. Auth (JWT register/login/role)
2. Home discovery + search
3. Event detail + RSVP free
4. Event builder penyelenggara
5. My tickets + QR Code

**Should Have (P1):**
6. Midtrans paid events
7. Check-in scanner
8. Push notifications
9. Chat Socket.io

**Nice to Have (P2):**
10. Analytics dashboard
11. Rating & review
12. Gallery
13. Report & moderation
14. Dark mode

---

## Catatan Migrasi dari Rencana Supabase

| Dulu (Supabase) | Sekarang (Node.js) |
|-----------------|--------------------|
| Supabase Auth | NestJS JWT + Passport |
| Supabase DB client | Prisma + PostgreSQL |
| Supabase Realtime | Socket.io Gateway |
| Supabase Storage | S3 / Cloudinary |
| Edge Functions | NestJS controllers + BullMQ jobs |
| RLS policies | Guards + service-level authorization |
