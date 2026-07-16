# RuangTemu Web — Skenario Biaya & Deployment

> Panduan memilih stack hosting berdasarkan budget  
> Referensi: `Website/docs/implementation-plan.md` (Deployment Strategy)  
> Update: Maret 2026 — **selalu cek harga resmi** (free tier sering berubah)

---

## Ringkasan Cepat

| Skenario | Biaya kasar | Cocok untuk |
|----------|-------------|-------------|
| **A. Full gratis (lokal + free tier)** | **Rp 0** | Belajar, develop, demo internal |
| **B. Demo online gratis** | **~Rp 0** (ada batasan) | Share link ke teman/reviewer |
| **C. MVP murah** | **~USD 5–15/bulan** | Soft launch, user terbatas, selalu “hidup” |
| **D. Production siap scale** | **~USD 20–50+/bulan** + fee Midtrans | Traffic nyata, queue & chat stabil |

**Rekomendasi jalur RuangTemu:**  
`A (lokal)` → `B (demo free)` → `C (MVP murah)` → `D / VPS` bila queue & traffic naik.

---

## Skenario A — Full Gratis (Development Lokal)

**Tujuan:** coding & testing tanpa bayar apa pun.

| Komponen | Solusi | Biaya |
|----------|--------|-------|
| Frontend Next.js | `localhost:3000` | Rp 0 |
| NestJS API | `localhost:3001` | Rp 0 |
| PostgreSQL | Docker Compose | Rp 0 |
| Redis | Docker Compose | Rp 0 |
| File upload | Local disk / Cloudinary free (opsional) | Rp 0 |
| Payment | Midtrans **Sandbox** | Rp 0 |
| Email | Console log / Mailtrap free / Resend free | Rp 0 |
| Maps | Google Maps key + billing alert (credit free) | Rp 0* |

\* Google tetap minta kartu kredit; set **budget alert $0–5** agar tidak kaget.

### Docker Compose (dev) — contoh minimal

```yaml
# docker-compose.yml (dev only)
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ruangtemu
      POSTGRES_PASSWORD: ruangtemu
      POSTGRES_DB: ruangtemu
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:
```

### Kelebihan
- 100% gratis  
- Cepat iterasi  
- Cocok Phase 0–4 development  

### Kekurangan
- Tidak bisa diakses publik (kecuali tunnel seperti ngrok free)  
- Webhook Midtrans perlu tunnel (ngrok / cloudflared)  

### Checklist Skenario A
- [ ] Node.js + pnpm/npm terpasang  
- [ ] Docker Desktop jalan  
- [ ] `docker compose up -d`  
- [ ] Env lokal `.env` (jangan commit)  
- [ ] Midtrans sandbox keys  
- [ ] Google Maps key + budget cap  

---

## Skenario B — Demo Online Gratis (ada batasan)

**Tujuan:** link publik untuk demo, masih ~Rp 0.

| Komponen | Platform free | Batasan penting |
|----------|---------------|-----------------|
| **Next.js** | **Vercel Hobby** | Bandwidth/build limit; cukup MVP kecil |
| **NestJS** | **Render Free** Web Service | **Sleep** setelah ~15 menit idle → request pertama lambat |
| **PostgreSQL** | Render Free Postgres **atau** Neon free | Storage/koneksi terbatas; Render free DB kadang expired policy |
| **Redis** | **Upstash Redis free** | Command/day limit; cukup hold tiket & job ringan |
| **File** | **Cloudinary free** | Storage & transform limit |
| **Email** | **Resend free** | ~3k email/bulan (cek limit terbaru) |
| **Payment** | Midtrans Sandbox | Bukan uang sungguhan |
| **Maps** | Google free credit | Wajib budget alert |

```
Browser → Vercel (Next.js)
              │
              ▼
         Render Free (NestJS)  ←── bisa sleep
              │
     ┌────────┼────────┐
     ▼        ▼        ▼
  Neon/     Upstash   Cloudinary
  Render    Redis
  Postgres
```

### Alternatif free backend
| Opsi | Catatan |
|------|---------|
| Render free | Mudah; sleep |
| Railway trial credit | Gratis sementara, lalu bayar |
| Fly.io free allowance | Sedikit lebih teknis |

### Kelebihan
- Bisa share URL  
- Biaya ~0  
- Arsitektur mirip production  

### Kekurangan
- API sleep → UX “loading lama”  
- Socket.io chat kurang nyaman di free sleep  
- Free Postgres bisa tidak cocok jangka panjang  
- Tidak ideal untuk payment production webhook yang harus selalu up  

### Tips biar tetap nyaman di free
1. Pakai **Upstash Redis** (serverless, jarang “sleep” seperti app)  
2. Jangan andalkan chat realtime untuk demo investor di free sleep — demo fitur auth + RSVP free dulu  
3. Vercel preview deploy per PR = bagus untuk review UI  
4. Siapkan halaman status “API sedang bangun (cold start ~30–60 dtk)”  

### Checklist Skenario B
- [ ] Repo GitHub public/private  
- [ ] Deploy `apps/web` → Vercel  
- [ ] Deploy `apps/api` → Render Web Service  
- [ ] Neon/Render Postgres + `DATABASE_URL`  
- [ ] Upstash `REDIS_URL`  
- [ ] `CORS_ORIGIN` = domain Vercel  
- [ ] Midtrans sandbox webhook via URL Render (public)  
- [ ] Cloudinary + Resend free  

---

## Skenario C — MVP Murah (~USD 5–15/bulan)

**Tujuan:** soft launch, API **selalu nyala**, chat & hold tiket andal.

### Susunan yang disarankan (best value)

| Komponen | Provider | Estimasi* |
|----------|----------|-----------|
| Next.js | **Vercel Hobby** | **$0** |
| NestJS always-on | **Railway** hobby / Render Starter | **~$5** |
| PostgreSQL | Railway/Render managed | **~$0–5** (sering bundle kecil) |
| Redis | Railway Redis **atau** Upstash payg | **~$0–3** |
| Cloudinary | Free tier | **$0** |
| Resend | Free tier | **$0** |
| Domain (opsional) | Namecheap/Niagahoster/Cloudflare | **~$1/bulan** rata-rata tahunan |
| Midtrans | Production fee **per transaksi** | Bukan sewa bulanan |
| **Total bulanan** | | **~USD 5–15** |

\*Harga berubah; anggap **order of magnitude**, bukan invoice pasti.

### Arsitektur Skenario C

```
┌─────────────────┐      HTTPS/WSS      ┌──────────────────────┐
│ Vercel (gratis) │ ──────────────────► │ Railway ~$5–10       │
│ Next.js         │                     │ NestJS always-on     │
│ app.domain.com  │                     │ Postgres + Redis     │
└─────────────────┘                     │ api.domain.com       │
                                        └──────────┬───────────┘
                                                   │
                          Midtrans production · Cloudinary · Resend
```

### Apa yang “layak bayar” dulu?
1. **API always-on** — prioritas #1 (webhook Midtrans, BullMQ hold 15 menit, Socket.io)  
2. **Postgres managed backup** — jangan andalkan free DB untuk data user  
3. **Domain** — kredibilitas & cookie/CORS lebih rapi  

### Apa yang tetap free?
- Vercel frontend  
- Cloudinary free (selama kuota cukup)  
- Resend free (volume email kecil)  
- Midtrans: bayar hanya saat ada transaksi sukses  

### Checklist Skenario C
- [ ] Railway project: API + Postgres + Redis  
- [ ] Custom domain: `app.` (Vercel) + `api.` (Railway)  
- [ ] Cookie JWT: `Secure; SameSite=None` atau subdomain strategy  
- [ ] Midtrans **production** keys + webhook signature verify  
- [ ] `prisma migrate deploy` di release command  
- [ ] Budget alert Google Maps  
- [ ] Backup DB mingguan (snapshot provider)  

### Perkiraan biaya Indonesia (kasar)
| Item | IDR/bulan (approx) |
|------|---------------------|
| Railway/Render starter stack | Rp 80.000 – 250.000 |
| Domain (dibagi 12) | Rp 15.000 – 25.000 |
| Cloudinary/Resend free | Rp 0 |
| **Total** | **~Rp 100.000 – 300.000** |

---

## Skenario D — Production / Scale (nanti)

**Kapan pindah:**
- User aktif nyata  
- BullMQ/Redis melewati limit  
- Butuh worker terpisah, multi-instance, kontrol biaya prediktif  

| Komponen | Opsi |
|----------|------|
| Frontend | Tetap **Vercel** (Pro bila perlu) |
| Backend | **VPS** (DigitalOcean, Contabo, IDCloudHost, dll.) + **Docker Compose** |
| DB | Managed Postgres **atau** Postgres di VPS + backup |
| Redis | Di VPS atau managed |
| Monitoring | UptimeRobot free + Sentry free tier |

```
Vercel → VPS Docker
           ├── api (NestJS)
           ├── worker (BullMQ, opsional)
           ├── postgres
           └── redis
```

Estimasi VPS kecil: **~$6–20/bulan** tergantung spek & lokasi.

---

## Perbandingan Fitur vs Skenario

| Fitur RuangTemu | A Lokal | B Free online | C MVP murah | D Scale |
|-----------------|---------|---------------|-------------|---------|
| Auth + RSVP free | ✅ | ✅ | ✅ | ✅ |
| Event builder | ✅ | ✅ | ✅ | ✅ |
| E-tiket QR | ✅ | ✅ | ✅ | ✅ |
| Midtrans sandbox | ✅ (+tunnel) | ✅ | ✅ | ✅ |
| Midtrans production | ❌ | ⚠️ risk sleep | ✅ | ✅ |
| Hold 15 menit (BullMQ) | ✅ | ⚠️ | ✅ | ✅ |
| Chat Socket.io | ✅ | ⚠️ cold start | ✅ | ✅ |
| Email e-tiket | mock/free | free tier | free/paid | paid |
| SEO SSR | ✅ local | ✅ Vercel | ✅ | ✅ |
| Admin moderasi | ✅ | ✅ | ✅ | ✅ |

---

## Rekomendasi Eksekusi Bertahap (Best Practice)

### Tahap 1 — Minggu 1–4 (Phase 0–2)
**Skenario A only**  
Fokus: setup monorepo, auth, design system, DB schema.

### Tahap 2 — Setelah ada UI + API dasar
**Skenario B**  
Deploy Vercel + Render free + Neon/Upstash  
Demo: register → home → event detail → RSVP free → QR.

### Tahap 3 — Sebelum soft launch / bayar sungguhan
**Naik ke Skenario C**  
Railway always-on + Midtrans production + domain.

### Tahap 4 — Setelah ada traction
**Skenario D** bila biaya managed naik atau butuh kontrol Docker penuh.

---

## Matriks Keputusan Cepat

```
Apakah hanya coding di laptop?
  └─ Ya → Skenario A

Perlu link demo, budget Rp 0?
  └─ Ya → Skenario B (terima cold start)

Perlu payment production + chat stabil?
  └─ Ya → Skenario C (~$5–15/bln)

Traffic & queue membesar / butuh worker?
  └─ Ya → Skenario D (VPS Docker)
```

---

## Biaya Tersembunyi (sering dilupakan)

| Item | Risiko |
|------|--------|
| **Google Maps** | Tagihan mendadak tanpa budget cap |
| **Egress bandwidth** | Vercel/Railway overage |
| **Postgres storage** | Foto di DB (jangan) — pakai Cloudinary |
| **Email spam complaint** | Domain + SPF/DKIM saat production |
| **Midtrans MDR/fee** | Potong dari setiap transaksi sukses |
| **Sleep Render** | Webhook Midtrans gagal jika instance tidur |

---

## Stack “Full Gratis Dulu” (resep siap pakai)

```
Local:
  Docker: Postgres + Redis
  Next.js + NestJS di laptop

Online demo (Rp 0):
  Web     → Vercel Hobby
  API     → Render Free Web Service
  DB      → Neon Free Postgres
  Redis   → Upstash Free
  Images  → Cloudinary Free
  Email   → Resend Free (atau matikan dulu, log only)
  Pay     → Midtrans Sandbox
  Maps    → Google Maps (budget alert $1–5)
```

## Stack “MVP Murah ~$10/bulan” (resep siap pakai)

```
Web     → Vercel Hobby ($0)
API     → Railway (~$5) always-on NestJS
DB      → Railway Postgres (included / kecil)
Redis   → Railway Redis atau Upstash
Images  → Cloudinary Free
Email   → Resend Free
Pay     → Midtrans Production (fee per trx)
Domain  → opsional (~$10–15/tahun)
Maps    → Google (budget alert)
```

**Default pilihan RuangTemu:**  
Development = **A**, Demo = **B**, Soft launch = **C** (Railway + Vercel).

---

## Env vars per skenario (checklist)

| Variable | A | B | C |
|----------|---|---|---|
| `DATABASE_URL` | localhost | Neon/Render | Railway |
| `REDIS_URL` | localhost | Upstash | Railway/Upstash |
| `JWT_SECRET` | dev secret | kuat | kuat + rotate plan |
| `CORS_ORIGIN` | http://localhost:3000 | *.vercel.app | app.domain.com |
| `NEXT_PUBLIC_API_URL` | localhost:3001 | render URL | api.domain.com |
| `MIDTRANS_*` | sandbox | sandbox | **production** |
| `CLOUDINARY_*` / `S3_*` | optional | free | free/paid |
| `RESEND_API_KEY` | optional | free | free/paid |

---

## FAQ

**Q: Bisa production full gratis?**  
A: Bisa “online gratis” sebentar (Skenario B), tapi **tidak direkomendasikan** untuk payment & data user nyata karena sleep, limit, dan reliability.

**Q: Vercel saja cukup?**  
A: Untuk **frontend** ya. Untuk NestJS + Socket.io + BullMQ → **tidak** (bukan long-running server).

**Q: Railway vs Render untuk bayar kecil?**  
A: Keduanya OK. **Railway** sering lebih nyaman monorepo/always-on; **Render** free bagus untuk demo dulu.

**Q: Kapan beli domain?**  
A: Saat Skenario C / mau Midtrans production & cookie rapi. Demo cukup `*.vercel.app`.

---

## Dokumen terkait

| File | Isi |
|------|-----|
| `Website/docs/implementation-plan.md` | Deployment Strategy teknis |
| `Website/docs/product-requirements.md` | Requirement produk web |
| `docs/ui-ux-design-rules.md` | UI tokens |

---

*Gunakan dokumen ini untuk memutuskan budget sebelum Phase 0 deploy. Harga free tier berubah — verifikasi di dashboard provider saat akan deploy.*
