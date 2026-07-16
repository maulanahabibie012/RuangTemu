n# RuangTemu Web — Product Requirements Document (PRD)

> Platform dua sisi (two-sided marketplace) untuk gathering & komunitas — **versi Web**  
> Versi: 1.0-web — diadaptasi dari `docs/product-requirements.md` (mobile) + implementation plan  
> Stack: **Next.js (React/TS)** + **NestJS (Node.js/TS)** + **PostgreSQL**

---

## 1. Ringkasan Produk

**RuangTemu Web** adalah aplikasi web responsif yang menghubungkan **peserta** pencari gathering dengan **penyelenggara** pembuat acara (board game, tech meetup, kuliner, olahraga, seni, musik, dll).

Fokus rilis pertama: **web-first** (desktop + mobile browser). Aplikasi native (Expo) dapat menyusul dengan API yang sama.

### Tujuan

- Discovery gathering berdasarkan minat, tanggal, dan lokasi
- RSVP + e-tiket QR (hold kuota + pembayaran Midtrans)
- Tools penyelenggara: event builder, peserta, check-in, analytics
- Komunitas pra/pasca acara: chat, rating, galeri
- Keamanan: RBAC, report, moderasi Super Admin (dashboard web)

### Out of Scope (MVP Web)

- Aplikasi native iOS/Android (fase terpisah; API tetap dipakai)
- Multi-currency di luar IDR
- Live streaming acara
- Marketplace merchandise
- Background GPS tracking (cukup geolocation browser on-demand)

### Perbedaan penting vs Mobile App

| Aspek | Mobile (Expo) | Web (Next.js) |
|-------|---------------|---------------|
| Runtime | React Native | Browser (React DOM) |
| Navigasi | Expo Router | Next.js App Router |
| Token storage | SecureStore | httpOnly cookie + optional localStorage |
| Kamera check-in | expo-camera | Browser Camera API / html5-qrcode |
| GPS | expo-location | Browser Geolocation API |
| Push | Expo Push | Web Push (opsional) + email primer |
| Maps | react-native-maps | Google Maps JS / Mapbox |
| Payment UI | WebView Snap | Midtrans Snap.js embed / redirect |

---

## 2. Aktor & Hak Akses

| Aktor | Deskripsi | Hak utama |
|-------|-----------|-----------|
| **Peserta** | Mencari & ikut gathering | Discovery, RSVP, e-tiket, chat, rating, gallery, bookmark, report |
| **Penyelenggara** | Membuat & mengelola gathering | Event builder, dashboard, peserta, check-in, broadcast, analytics |
| **Super Admin** | Moderasi platform | Review report, hide event, suspend user, help-desk (dashboard web) |

**Catatan role:**

- Role dipilih saat registrasi: `peserta` | `penyelenggara` | `admin`
- Penyelenggara boleh dual-role (ikut event sebagai peserta)
- Proteksi di **backend** (JWT + RolesGuard); frontend hanya menyembunyikan UI

---

## 3. User Flow (Web)

### Flow 1 — Penyelenggara: Membuka Gathering

1. **Registrasi & verifikasi email (OTP)** di `/register`, `/verify`
2. **Event Builder** di `/organizer/events/new` (multi-step wizard)
   - Info dasar + cover upload
   - Waktu & lokasi (date picker + peta pin)
   - Tiket & kuota (gratis/berbayar IDR, capacity, selective approve)
   - Preview → draft atau publish
3. **Publikasi** — status `active`, tampil di discovery
4. **Check-in hari-H** — `/organizer/events/[id]/checkin` scan QR via kamera browser / input manual

### Flow 2 — Peserta: Mencari & Ikut

1. **Discovery** — `/` home (rekomendasi, kategori, nearby)
2. **Search** — `/search` filter keyword, tanggal, kategori, radius, free/paid
3. **Detail** — `/events/[id]` → RSVP
4. **Berbayar** — hold 15 menit → `/events/[id]/payment` (Midtrans Snap) → sukses/gagal
5. **E-tiket** — `/my-tickets/[registrationId]` tampil QR + email
6. **Chat** — `/chat/[eventId]` auto-join setelah confirmed

### Flow 3 — Pasca-Acara

1. Notifikasi email (+ Web Push jika diizinkan) 1–2 jam setelah selesai
2. Rating di `/events/[id]/review`
3. Galeri di `/events/[id]/gallery`

### Flow 4 — Moderasi

1. Report dari halaman event/profil
2. Auto-hide event (`is_reported`)
3. Super Admin review di `/admin/reports`

---

## 4. Fitur per Modul + Prioritas

### Modul 1 — Peserta

| Fitur | Requirement | Prioritas |
|-------|-------------|-----------|
| Home discovery | Hero, kategori, populer, upcoming | P0 |
| Search & filter | Keyword, tanggal, kategori, radius, free/paid, sort | P0 |
| Event detail | Cover, jadwal, maps, kuota, harga, organizer, peserta | P0 |
| Profil | Avatar, bio, minat, riwayat | P0 |
| Bookmark | Wishlist event | P1 |
| RSVP free | Langsung confirmed + QR | P0 |
| RSVP paid | Hold 15m + Midtrans | P1 |
| E-tiket QR | Halaman tiket + download/print | P0 |
| Chat | Realtime per event | P1 |
| Rating | 1–5 + teks, hanya `attended` | P2 |
| Gallery | Upload/lihat foto | P2 |
| Report | Event/user | P2 |

### Modul 2 — Penyelenggara

| Fitur | Requirement | Prioritas |
|-------|-------------|-----------|
| Event builder | Wizard 4 step, draft/publish | P0 |
| Edit/cancel | Ubah event / batalkan | P0 |
| Dashboard | Ringkasan RSVP & revenue | P2 |
| Peserta | List + approve/reject selective | P1 |
| Broadcast | Notif/email ke peserta | P1 |
| Check-in | Kamera browser / manual code | P1 |
| Analytics | Chart pendaftaran & revenue | P2 |

### Modul 3 — Platform

| Fitur | Requirement | Prioritas |
|-------|-------------|-----------|
| Auth | Register, login, refresh, OTP, reset password | P0 |
| RBAC | Roles di API + route protection Next.js | P0 |
| Payment | Midtrans Snap + komisi platform | P1 |
| Hold tiket | BullMQ 15 menit | P1 |
| Kuota lock | Transaction atomic | P0 |
| Notifikasi | Email primer; Web Push opsional | P1 |
| Storage | S3/Cloudinary | P0 |
| Realtime | Socket.io chat | P1 |
| Admin web | Reports & help tickets | P2 |
| Help desk | Ticketing user → admin | P2 |
| SEO/SSR | Halaman public event indexable | P1 |
| Tema UI | Light / Dark (toggle Navbar) | P0 |



---

## 5. Peta Halaman (Routes Web)

### Public
| Route | Halaman |
|-------|---------|
| `/` | Home discovery |
| `/search` | Search & filter |
| `/events/[id]` | Event detail |
| `/organizers/[id]` | Profil penyelenggara |
| `/login` `/register` `/verify` `/forgot-password` | Auth |

### Authenticated — Peserta
| Route | Halaman |
|-------|---------|
| `/my-tickets` | Daftar tiket |
| `/my-tickets/[id]` | Detail + QR |
| `/chat` | List room |
| `/chat/[eventId]` | Room chat |
| `/profile` `/profile/edit` | Profil |
| `/wishlist` | Bookmark |
| `/events/[id]/payment` | Pembayaran |
| `/events/[id]/review` | Rating |
| `/events/[id]/gallery` | Galeri |

### Authenticated — Penyelenggara
| Route | Halaman |
|-------|---------|
| `/organizer` | Dashboard |
| `/organizer/events/new` | Create event |
| `/organizer/events/[id]/edit` | Edit |
| `/organizer/events/[id]/participants` | Peserta |
| `/organizer/events/[id]/checkin` | Check-in |
| `/organizer/events/[id]/analytics` | Analytics |
| `/organizer/events/[id]/broadcast` | Broadcast |

### Super Admin
| Route | Halaman |
|-------|---------|
| `/admin` | Overview |
| `/admin/reports` | Moderasi report |
| `/admin/tickets` | Help desk |

---

## 6. Entitas Data

Sama dengan backend mobile (satu API):

| Entitas | Fungsi |
|---------|--------|
| `users` | Akun, role, profil |
| `events` | Gathering |
| `registrations` | RSVP, hold, QR, check-in |
| `payments` | Midtrans + platform fee |
| `chat_rooms` / `messages` | Chat |
| `reviews` | Rating |
| `event_gallery` | Foto |
| `bookmarks` | Wishlist |
| `reports` | Laporan |
| `device_tokens` / `web_push_subscriptions` | Notifikasi |
| `help_tickets` | Bantuan (P2) |

**Status:**  
Event: `draft` | `active` | `full` | `cancelled` | `completed`  
Registration: `pending` | `confirmed` | `cancelled` | `attended`  
Payment: `pending` | `success` | `failed` | `expired`

---

## 7. Aturan Bisnis Kunci

1. Kuota atomic — no overbooking  
2. Free → confirmed + QR langsung  
3. Paid → hold 15 menit; timeout release slot  
4. Selective event → perlu approve organizer  
5. QR hash server-side; check-in sekali  
6. Chat hanya confirmed + organizer  
7. Review hanya `attended`; 1x per user/event  
8. Report → auto-hide sementara  
9. `platform_fee` saat payment success  
10. Job post-event → `completed` + minta rating  
11. **Web:** halaman public event support SSR/SEO; auth pages client-side  
12. **Web check-in:** dukung scan kamera **atau** ketik kode manual (fallback desktop tanpa kamera)

---

## 8. Tantangan Teknis (Web)

| Tantangan | Solusi |
|-----------|--------|
| Kuota concurrent | Prisma transaction di NestJS |
| Auth aman di browser | JWT access pendek + refresh di **httpOnly cookie** (prefer) / BFF pattern |
| Hold 15 menit | BullMQ delayed job |
| Chat realtime | Socket.io (same origin / CORS) |
| QR check-in di browser | `html5-qrcode` / BarcodeDetector API |
| Geolocation | `navigator.geolocation` + fallback input kota |
| Payment | Midtrans Snap.js |
| SEO event | Next.js Server Components / SSR untuk detail public |
| Responsive UI | Mobile-first CSS (Tailwind) |
| Tema light/dark | `next-themes` class strategy + design tokens CSS vars |


---

## 9. Tech Stack Web (Wajib)

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router) + TypeScript + React |
| **Styling** | Tailwind CSS + design tokens (selaras UI rules) |
| **State** | Zustand + TanStack React Query |
| **Forms** | React Hook Form + Zod |
| **Backend** | NestJS (Node.js + TypeScript) |
| **Database** | PostgreSQL + Prisma |
| **Auth** | JWT + Passport; cookie/session strategy untuk web |
| **Realtime** | Socket.io |
| **Queue** | BullMQ + Redis |
| **Storage** | AWS S3 / Cloudinary |
| **Payment** | Midtrans Snap |
| **Maps** | Google Maps JavaScript API |
| **Email** | Resend / Nodemailer |
| **QR generate** | `qrcode` / similar di client atau server |
| **QR scan** | html5-qrcode |
| **Charts** | Recharts (organizer analytics) |

**UI/UX rules:** sesuaikan dari `docs/ui-ux-design-rules.md` (spacing, warna, tipografi) ke CSS/Tailwind.  
**Coding:** `docs/ponytail-coding-rules.md`  
**Practices:** `docs/claude-fable5-best-practices.md`  
**Plan teknis:** `Website/docs/implementation-plan.md`

---

## 10. Non-Functional Requirements

| Aspek | Target |
|-------|--------|
| LCP home | ≤ 2.5s (good network) |
| Responsive | 320px – desktop; mobile-first |
| Security | httpOnly cookies, CSRF strategy, helmet, rate limit, DTO validation |
| Payment webhook | Idempotent + signature verify |
| Accessibility | Semantic HTML, keyboard nav, aria labels |
| **Tema UI** | Light / Dark (`next-themes` + CSS variables) |

| Browser support | Chrome, Safari, Firefox, Edge (2 versi terakhir) |
| SEO | Metadata + OG tags untuk event public |


### Deployment & biaya (keputusan produk)

**Keputusan saat ini:** mulai **full gratis untuk demo**, lalu **migrasi ke berbayar** tanpa rewrite aplikasi.

| Tahap | Skenario | Biaya | Platform |
|-------|----------|-------|----------|
| **1. Develop** | A — lokal | Rp 0 | Laptop + Docker (Postgres, Redis) |
| **2. Demo publik** | B — online gratis | ~Rp 0 | Vercel (web) + Render free (API) + Neon/Upstash free |
| **3. Soft launch** | C — MVP murah | ~USD 5–15/bln | Vercel + Railway always-on + Postgres + Redis |
| **4. Scale** | D — production | lebih tinggi | Vercel + VPS Docker (opsional) |

| Layer | Demo gratis (sekarang) | Migrasi berbayar (nanti) |
|-------|------------------------|---------------------------|
| Frontend Next.js | **Vercel Hobby** | Tetap Vercel |
| NestJS API | **Render Free** (boleh sleep) | **Railway** always-on (atau Render paid) |
| PostgreSQL | Neon / Render free | Railway/Render managed |
| Redis | **Upstash free** | Railway Redis / Upstash paid |
| File | Cloudinary free | Sama (URL tetap) |
| Payment | Midtrans **Sandbox** | Midtrans **Production** (ganti keys) |

**Migrasi gratis → berbayar:** ganti hosting + env vars (+ dump/restore DB bila perlu). **Kode app & schema tetap.**  
Detail biaya & checklist: `Website/docs/deployment-cost-scenarios.md`  
Detail teknis deploy: `Website/docs/implementation-plan.md` → **Deployment Strategy**.


---

## 11. Prioritas Rilis MVP Web

### P0
1. Auth web (register/login/role)
2. Home + search + event detail (SSR)
3. RSVP gratis + e-tiket QR
4. Event builder penyelenggara
5. My Tickets
6. **Light / Dark theme** (toggle Navbar — Phase 0 ✅)


### P1
7. Midtrans + hold 15 menit  
8. Check-in (kamera + manual)  
9. Email notifikasi  
10. Chat Socket.io  
11. Manajemen peserta + broadcast  
12. SEO & share meta event  

### P2
13. Analytics dashboard  
14. Rating, gallery, report  
15. Admin moderation  
16. Help desk  
17. Web Push  


---

## 12. Milestone

| Sprint | Fokus | Deliverable |
|--------|-------|-------------|
| S1 | Setup | Next.js + NestJS + Prisma + Tailwind tokens + **theme light/dark** |

| S2 | Auth | ✅ Login/register, cookie JWT, profil (Selesai) |
| S3 | Discovery | Home, search, event detail SSR |
| S4 | RSVP & pay | Free RSVP, hold, Midtrans, e-tiket |
| S5 | Organizer | Builder, peserta, check-in web |
| S6 | Chat | Socket.io rooms |
| S7 | Post-event | Rating, gallery, report, admin |
| S8 | Polish | Email, loading/error, SEO, a11y |

---

## 13. Kriteria Sukses MVP Web

- User bisa daftar, login, temukan event, RSVP gratis, lihat QR di browser
- Organizer bisa create event & check-in (kamera atau manual)
- Tidak ada overbooking pada uji concurrent
- Event detail public bisa di-share (meta/OG)
- Role terpisah di API; route web terproteksi

---

## 14. Dokumen Terkait

| Dokumen | Lokasi |
|---------|--------|
| Implementation Plan (Web) | `Website/docs/implementation-plan.md` |
| Biaya & skenario deploy (A–D) | `Website/docs/deployment-cost-scenarios.md` |
| PRD Mobile (referensi) | `docs/product-requirements.md` |
| Plan Mobile (referensi) | `docs/implementation-plan.md` |
| UI/UX Rules | `docs/ui-ux-design-rules.md` |
| Coding Rules | `docs/ponytail-coding-rules.md` |

---

*PRD Web ini adalah sumber kebenaran untuk produk web. Detail teknis ada di implementation plan web. Backend NestJS dirancang **API-first** agar bisa dipakai ulang oleh app mobile nanti.*
