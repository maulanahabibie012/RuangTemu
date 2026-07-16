# Ponytail Coding Rules untuk RuangTemu

> Diadaptasi dari [Ponytail](https://github.com/DietrichGebert/ponytail) — "The lazy senior dev"
> Filosofi: **Kode terbaik adalah kode yang tidak pernah ditulis.**

## Inti Filosofi

- **Lazy = efisien**, bukan ceroboh
- ~54% lebih sedikit kode, ~20% lebih murah, ~27% lebih cepat, 100% aman
- Tulis hanya yang dibutuhkan task, jangan pernah potong validasi, error handling, security, atau accessibility

## The Ladder (Tangga Keputusan)

Berhenti di anak tangga pertama yang berhasil:

```
1. Apakah ini perlu ada?         → tidak: skip (YAGNI)
2. Sudah ada di codebase ini?    → reuse, jangan tulis ulang
3. Stdlib bisa?                  → gunakan stdlib
4. Fitur platform native?        → gunakan (<input type="date"> daripada lib picker)
5. Dependency yang sudah install? → gunakan, jangan tambah dependency baru
6. Bisa satu baris?              → satu baris
7. Baru kemudian:                → kode minimum yang berfungsi
```

**Penting**: Tangga ini dijalankan SETELAH memahami masalah, bukan sebagai pengganti pemahaman. Baca task dan kode yang terdampak dulu, telusuri alur sebenarnya, baru pilih anak tangga.

## Aturan Coding

### Jangan Lakukan
- ❌ Abstraksi yang tidak diminta: interface dengan satu implementasi, factory untuk satu produk
- ❌ Boilerplate atau scaffolding "untuk nanti"
- ❌ Config untuk nilai yang tidak pernah berubah
- ❌ Dependency baru untuk hal yang bisa diselesaikan beberapa baris kode
- ❌ Essay panjang menjelaskan kode — jika penjelasan lebih panjang dari kode, hapus penjelasannya

### Lakukan
- ✅ Deletion lebih dari addition
- ✅ Boring lebih dari clever (clever = yang di-decode orang jam 3 pagi)
- ✅ File sesedikit mungkin
- ✅ Diff terpendek yang berfungsi
- ✅ Tandai simplifikasi yang sengaja dengan komentar `ponytail:` yang menamai batasan dan jalur upgrade

### Format Output
```
[kode] → skipped: [X], tambah ketika [Y].
```

## Contoh Before/After

| Task | Tanpa Ponytail | Dengan Ponytail |
|------|---------------|-----------------|
| Email Validation | 75 baris (class validator) | 3 baris (`"@" in email`) |
| Debounce | 116 baris | 10 baris |
| CSV Sum | 20 baris | 3 baris |
| Countdown Timer (React) | 267 baris | 9 baris |
| Rate Limiting | 128 baris | 10 baris |
| Date Picker | Install flatpickr + wrapper + stylesheet | `<input type="date">` |

## Level Intensitas

| Level | Perilaku |
|-------|----------|
| **lite** | Bangun yang diminta, tapi sebutkan alternatif lebih lazy dalam satu baris |
| **full** | Tangga ditegakkan. Stdlib dan native duluan. Diff & penjelasan terpendek (default) |
| **ultra** | YAGNI ekstremis. Deletion sebelum addition. Kirim one-liner, tantang sisa requirement |

### Contoh: "Tambah cache untuk API responses ini"
- **lite**: "Done, cache ditambah. FYI: `functools.lru_cache` bisa handle ini dalam satu baris."
- **full**: "`@lru_cache(maxsize=1000)` di fetch function. Skip custom cache class, tambah ketika lru_cache terukur kurang."
- **ultra**: "Belum cache sampai profiler bilang perlu. Kalau perlu: `@lru_cache`. Hand-rolled TTL cache class = pabrik bug."

## JANGAN Pernah Disederhanakan (Safety Guards)

1. **Input validation di trust boundaries** — selalu validasi
2. **Error handling yang mencegah data loss** — selalu handle
3. **Security measures** — jangan pernah potong
4. **Accessibility basics** — wajib ada
5. **Hal yang explicitly diminta user** — jika user minta versi lengkap, bangun tanpa debat ulang

## Bug Fix = Root Cause

- Laporan bug menamai gejala, bukan penyebab
- Sebelum edit, grep semua caller dari fungsi yang akan diubah
- Fix lazy = fix root cause: satu guard di shared function lebih kecil diff-nya dari guard di setiap caller
- Patch hanya jalur yang di-ticket = setiap caller sibling masih broken

## Review untuk Over-Engineering

Format review:
```
L<baris>: <tag> <apa>. <pengganti>.
```

Tags:
- `delete:` — kode mati, fleksibilitas tidak terpakai, fitur spekulatif
- `stdlib:` — hal hand-rolled yang stdlib sudah sediakan
- `native:` — dependency yang platform sudah bisa
- `yagni:` — abstraksi dengan satu implementasi, config yang tidak pernah diset
- `shrink:` — logika sama, baris lebih sedikit

Contoh:
```
L12-38: stdlib: 27-line validator class. "@" in email, 1 line.
L4: native: moment.js import untuk satu format call. Intl.DateTimeFormat, 0 deps.
L52-71: delete: retry wrapper pada idempotent local call. Tidak perlu pengganti.
```

Akhiri dengan: `net: -<N> baris possible.`
Jika tidak ada yang dipotong: `Lean already. Ship.`

## Prinsip untuk RuangTemu

1. **Prefer native browser features** — `<input type="date">`, `<dialog>`, `<details>`, CSS Grid/Flexbox
2. **Prefer stdlib** — `fetch()` daripada axios, `URL` daripada lib parser, `Intl` daripada moment.js
3. **Reuse existing code** — cari dulu di codebase sebelum menulis baru
4. **Minimal dependencies** — setiap dependency = maintenance burden
5. **Satu file jika bisa** — jangan pecah ke banyak file tanpa alasan
6. **Test minimal tapi cukup** — satu assert-based check untuk logika non-trivial
7. **Kode pendek, benar, dan aman** — bukan kode pendek yang salah