# RuangTemu — Product Requirements Document (PRD)

> Platform dua sisi (two-sided marketplace) untuk gathering & komunitas  
> Versi: 1.1 — diselaraskan dengan `docs/mobile/implementation-plan.md`  
> Stack: React Native (Expo) + NestJS (Node.js/TS) + PostgreSQL

---

## 1. Ringkasan Produk

**RuangTemu** menghubungkan **peserta** yang mencari gathering dengan **penyelenggara** yang membuat & mengelola acara (board game, tech meetup, kuliner, olahraga, seni, musik, dll).

### Tujuan

- Memudahkan discovery gathering berdasarkan minat, tanggal, dan lokasi
- Menyediakan alur RSVP + e-tiket QR yang andal (termasuk hold kuota & pembayaran)
- Memberi tools manajemen ke penyelenggara (event builder, peserta, check-in, analytics)
- Membangun komunitas pra/pasca acara lewat chat, rating, dan galeri
- Menjaga keamanan platform lewat role-based access, report, dan moderasi admin

### Out of Scope (MVP)

- Web admin full-featured (cukup API + dashboard minimal Super Admin)
- Multi-currency di luar IDR
- Live streaming acara
- Marketplace merchandise

---

## 2. Aktor & Hak Akses

| Aktor | Deskripsi | Hak utama |
|-------|-----------|-----------|
| **Peserta** | Mencari & ikut gathering | Discovery, RSVP, e-tiket, chat, rating, gallery, bookmark, report |
| **Penyelenggara** | Membuat & mengelola gathering | Event builder, dashboard, manajemen peserta, check-in, broadcast, analytics |
| **Super Admin** | Moderasi & keamanan platform | Review report, hide/unhide event, suspend user, help-desk tickets |

**Catatan role:**

- Role dipilih saat registrasi (`peserta` | `penyelenggara` | `admin`)
- Penyelenggara **boleh juga bertindak sebagai peserta** (dual role di UI)
- Semua proteksi hak akses divalidasi di **backend** (JWT + RolesGuard), bukan hanya di frontend

---

## 3. User Flow (Produk)

### Flow 1 — Penyelenggara: Membuka Gathering

1. **Registrasi & verifikasi** — daftar role penyelenggara, verifikasi email (OTP)
2. **Event Builder (4 langkah)**
   - Info dasar: nama, deskripsi, kategori, cover image
   - Waktu & lokasi: tanggal/jam + pin peta (Maps)
   - Tiket & kuota: gratis/berbayar (harga IDR), max capacity, opsi acara selektif (perlu approve)
   - Preview → simpan draft atau publikasikan
3. **Publikasi** — status `active`, muncul di discovery peserta
4. **Manajemen hari-H** — scan QR e-tiket → status peserta `attended`

### Flow 2 — Peserta: Mencari & Ikut Gathering

1. **Discovery** — home rekomendasi, kategori, nearby; search + filter (keyword, tanggal, kategori, radius, free/paid)
2. **Detail & RSVP** — sisa kuota, daftar peserta, deskripsi, rating penyelenggara → tombol Daftar/RSVP
3. **Transaksi (jika berbayar)**
   - Hold 1 slot **15 menit**
   - Bayar via Midtrans: **QRIS / E-Wallet / Virtual Account**
   - Timeout/gagal → slot dikembalikan
4. **E-tiket** — QR Code di app + dikirim email setelah konfirmasi
5. **Forum/chat** — auto-join room chat per acara setelah registration confirmed

### Flow 3 — Pasca-Acara

1. **Notifikasi** — 1–2 jam setelah acara usai, notif ke peserta berstatus `attended`
2. **Rating & ulasan** — bintang 1–5 + teks
3. **Galeri** — peserta & penyelenggara upload foto dokumentasi

### Flow 4 — Moderasi & Keamanan

1. **Report** — di halaman acara & profil user
2. **Auto-hide** — event yang dilaporkan disembunyikan sementara (`is_reported`)
3. **Review Super Admin** — approve/reject report, restore/hide permanen, tindak lanjut user

---

## 4. Daftar Fitur per Modul

### Modul 1 — Eksplorasi & Interaksi (Peserta)

| Fitur | Requirement | Prioritas |
|-------|-------------|-----------|
| Home discovery | Rekomendasi, kategori carousel, nearby/segera dimulai | P0 |
| Pencarian & filter | Keyword, rentang tanggal, kategori, radius jarak, free/paid, sort (date/distance/popularity) | P0 |
| Event detail | Cover, jadwal, lokasi (buka maps), kuota, harga, penyelenggara, peserta, ulasan | P0 |
| Profil pengguna | Foto, bio, minat (tags), riwayat acara | P0 |
| Wishlist/bookmark | Simpan acara favorit | P1 |
| RSVP free | Daftar langsung jika kuota tersedia → e-tiket QR | P0 |
| RSVP paid | Hold 15 menit + payment Midtrans → e-tiket | P1 |
| E-tiket digital | QR unik per registrasi, tampil di My Tickets | P0 |
| Chat per acara | Grup realtime, auto-join setelah confirmed | P1 |
| Rating & ulasan | Hanya peserta `attended`, 1 review/user/event | P2 |
| Galeri acara | Upload & lihat foto komunal | P2 |
| Report | Laporkan event atau user + alasan | P2 |

### Modul 2 — Manajemen (Penyelenggara)

| Fitur | Requirement | Prioritas |
|-------|-------------|-----------|
| Event builder | Multi-step form: info, waktu/lokasi, tiket/kuota, preview publish/draft | P0 |
| Edit / cancel event | Update draft/active; cancel mengubah status | P0 |
| Dashboard metrics | Views (opsional), RSVP, revenue, konversi | P2 |
| Manajemen peserta | List peserta; approve/reject jika `is_selective` | P1 |
| Broadcast | Kirim pesan/notif ke semua peserta registered | P1 |
| Check-in scanner | Kamera scan QR → validasi → status `attended` | P1 |
| Analytics event | Grafik pendaftaran per hari, total pendapatan | P2 |

### Modul 3 — Sistem Inti & Keamanan (Backend + Platform)

| Fitur | Requirement | Prioritas |
|-------|-------------|-----------|
| Auth | Register, login, refresh JWT, logout, OTP email, forgot/reset password | P0 |
| RBAC | Role `peserta` / `penyelenggara` / `admin` di API | P0 |
| Payment gateway | Midtrans Snap: QRIS, VA, E-Wallet + **platform fee/komisi** | P1 |
| Hold tiket | Timeout 15 menit via queue job; release slot otomatis | P1 |
| Kuota concurrency | Transaction lock; cegah overbooking saat RSVP bersamaan | P0 |
| Notifikasi | Push (Expo) + email (e-tiket, verifikasi, pengingat H-1) | P1 |
| File storage | Avatar, cover event, galeri (S3/Cloudinary) | P0 |
| Realtime | Chat Socket.io; opsional update status kuota/payment | P1 |
| Super Admin | Review reports, hide event, kelola help tickets | P2 |
| Pusat bantuan | Ticketing: user submit kendala; admin resolve | P2 |

---

## 5. Layar Utama (Mobile)

### Auth
- Welcome / onboarding
- Login, Register (pilih role), OTP verify, Forgot password

### Peserta (tabs)
- **Home** — discovery
- **Search** — filter lanjutan
- **My Events** — tiket upcoming & past + detail QR
- **Chat** — daftar room
- **Profile** — edit profil, wishlist, settings

### Event
- Event detail, RSVP confirm, Payment, Payment status
- Rate event, Gallery, Report

### Penyelenggara
- Dashboard, Create/Edit event
- Participants, Check-in scanner, Analytics, Broadcast

### Super Admin (minimal)
- Report queue, ticket help-desk (bisa web sederhana di fase lanjut)

---

## 6. Entitas Data (Ringkas)

Selaras dengan schema di implementation plan:

| Entitas | Fungsi |
|---------|--------|
| `users` | Akun, role, profil, minat, verifikasi |
| `events` | Gathering, lokasi, kuota, harga, status |
| `registrations` | RSVP, hold, QR, check-in |
| `payments` | Transaksi Midtrans + platform fee |
| `chat_rooms` / `messages` | Chat per event |
| `reviews` | Rating & ulasan |
| `event_gallery` | Foto dokumentasi |
| `bookmarks` | Wishlist |
| `reports` | Laporan event/user |
| `device_tokens` | Expo push token |
| `help_tickets` *(P2)* | Pusat bantuan |

### Status penting

**Event:** `draft` → `active` → `full` | `cancelled` | `completed`  

**Registration:** `pending` → `confirmed` | `cancelled` | `attended`  

**Payment:** `pending` → `success` | `failed` | `expired`

---

## 7. Aturan Bisnis Kunci

1. **Kuota** — `current_count` tidak boleh melebihi `max_capacity`; RSVP concurrent harus atomic (transaction)
2. **Event gratis** — RSVP langsung `confirmed` + generate QR jika slot tersedia
3. **Event berbayar** — RSVP `pending`, `held_until = now + 15m`, count naik tentative; sukses bayar → `confirmed`; gagal/timeout → cancel + count turun
4. **Acara selektif** — setelah daftar, butuh approve penyelenggara sebelum fully confirmed (jika diaktifkan)
5. **E-tiket QR** — payload memuat registration/event/user id + hash server-side; check-in sekali saja
6. **Chat** — hanya user dengan registration `confirmed` (atau organizer) yang boleh join room
7. **Review** — hanya peserta `attended`; satu review per user per event
8. **Report** — event auto-hide sementara; Super Admin meninjau
9. **Komisi platform** — dihitung saat payment success; disimpan di `payments.platform_fee`
10. **Post-event** — job otomatis set `completed` setelah end time + delay; trigger notif minta rating

---

## 8. Tantangan Teknis & Solusi (Produk → Teknis)

| Tantangan (PRD) | Solusi (Implementation Plan) |
|-----------------|------------------------------|
| Manajemen kuota concurrent | Prisma `$transaction` + lock / constraint |
| Keamanan hak akses | JWT + Passport + RolesGuard di NestJS |
| Hold tiket 15 menit | BullMQ delayed job + update registration |
| Real-time chat & update | Socket.io Gateway + push notif |
| Validasi QR | HMAC/SHA hash + cek status DB saat check-in |
| Payment Indonesia | Midtrans Snap + webhook signed |
| File media | S3 / Cloudinary via Uploads module |

---

## 9. Tech Stack (Wajib)

| Layer | Teknologi |
|-------|-----------|
| Mobile | React Native (Expo) + TypeScript + Expo Router |
| State / data client | Zustand + TanStack React Query + Axios |
| Backend | NestJS (Node.js + TypeScript) |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + Passport + bcrypt + refresh token |
| Realtime | Socket.io |
| Queue / cron | BullMQ + Redis |
| Storage | AWS S3 / Cloudinary |
| Payment | Midtrans |
| Push | Expo Push Notifications |
| Maps | Google Maps API + react-native-maps |
| Email | Resend / Nodemailer |

**Referensi implementasi detail:** `docs/mobile/implementation-plan.md`  
**UI/UX:** `docs/shared/ui-ux-design-rules.md`  
**Coding:** `docs/shared/ponytail-coding-rules.md`  
**Practices:** `docs/shared/claude-fable5-best-practices.md`

---

## 10. Non-Functional Requirements

| Aspek | Target |
|-------|--------|
| Performa list | First page event ≤ 2s pada jaringan normal |
| Keamanan | Password hashed; token di SecureStore; validasi input DTO |
| Ketersediaan payment webhook | Idempotent; verifikasi signature Midtrans |
| Offline UX | Indikator offline; cache list dengan React Query |
| Aksesibilitas | Label & testID untuk elemen kritis |
| Platform | iOS & Android via Expo |

---

## 11. Prioritas Rilis (MVP)

### P0 — Must Have
1. Auth (register/login/role/JWT)
2. Home discovery + search/filter
3. Event detail + RSVP **gratis**
4. Event builder penyelenggara (publish/draft)
5. My Tickets + QR e-tiket

### P1 — Should Have
6. Payment Midtrans (paid events + hold 15 menit)
7. Check-in scanner
8. Push notifications (+ email e-tiket)
9. Chat per acara (Socket.io)
10. Manajemen peserta + broadcast

### P2 — Nice to Have
11. Dashboard analytics
12. Rating & review
13. Gallery
14. Report + Super Admin moderation
15. Pusat bantuan (ticketing)
16. Dark mode
17. Bookmark/wishlist (bisa dinaikkan ke P1 jika dibutuhkan early)

---

## 12. Milestone (selaras Implementation Plan)

| Sprint | Fokus | Deliverable produk |
|--------|-------|--------------------|
| S1 | Setup | Repo mobile + API, design tokens, DB schema awal |
| S2 | Auth | Login/register/profil/role |
| S3 | Discovery | Home, search, event detail |
| S4 | RSVP & bayar | Free RSVP, hold, Midtrans, e-tiket |
| S5 | Organizer | Builder, peserta, check-in |
| S6 | Chat | Room realtime per event |
| S7 | Post-event | Rating, gallery, report |
| S8 | Polish | Notif, empty/error states, stabilisasi MVP |

**Estimasi MVP lengkap:** ~9.5 minggu (tergantung scope P0–P1)

---

## 13. Kriteria Sukses MVP

- Peserta bisa menemukan event, RSVP (minimal gratis), dan menampilkan QR valid
- Penyelenggara bisa membuat event, melihat peserta, dan check-in via QR
- Tidak ada overbooking pada uji concurrent RSVP
- Payment sandbox Midtrans (jika P1 aktif) sukses end-to-end + webhook
- Role peserta vs penyelenggara vs admin terpisah di API

---

## 14. Dokumen Terkait

| Dokumen | Isi |
|---------|-----|
| `docs/mobile/implementation-plan.md` | Arsitektur, API, schema, sprint teknis |
| `docs/shared/ui-ux-design-rules.md` | Design tokens & aturan UI |
| `docs/shared/ponytail-coding-rules.md` | Prinsip coding efisien |
| `docs/shared/claude-fable5-best-practices.md` | Best practices development |

---

*PRD ini adalah sumber kebenaran kebutuhan produk. Detail teknis eksekusi mengikuti implementation plan selama tidak bertentangan dengan requirement di dokumen ini.*
