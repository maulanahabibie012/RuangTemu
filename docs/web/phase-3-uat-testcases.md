# Phase 3 — Registration & Ticketing: UAT Test Cases

**Project:** RuangTemu Web  
**Phase:** 3 — Registration & Ticketing  
**Date:** 16 Juli 2026  
**Environment:** http://localhost:3000 (web) + http://localhost:4000 (API)

---

## Prerequisites

1. Database PostgreSQL running (`docker compose up -d`)
2. Backend API running (`cd Website/apps/api && npm run start:dev`)
3. Frontend running (`cd Website/apps/web && npm run dev`)
4. Seed data loaded (`cd Website/apps/api && npm run prisma:seed`)
5. Akun user terdaftar dan terverifikasi (bisa login)
6. Minimal 1 event ACTIVE dengan tiket FREE dan 1 event dengan tiket PAID

---

## TC-3.01: RSVP Event Gratis (FREE Ticket)

| # | Step | Expected Result |
|---|------|----------------|
| 1 | Login sebagai user biasa | Redirect ke home, navbar menunjukkan nama user |
| 2 | Buka halaman detail event yang FREE | Muncul tombol "Daftar Sekarang" / "RSVP" |
| 3 | Klik tombol RSVP | Redirect ke halaman `/events/[id]/rsvp` |
| 4 | Konfirmasi pendaftaran (pilih ticket qty = 1) | Loading indicator saat proses |
| 5 | Cek hasil | Redirect ke halaman sukses, status registrasi = CONFIRMED |
| 6 | Kembali ke detail event | Tombol berubah menjadi "Sudah Terdaftar" / disabled |

**Status:** ☐ Pass / ☐ Fail  
**Catatan:** _____________________

---

## TC-3.02: Registrasi Event Berbayar (PAID Ticket)

| # | Step | Expected Result |
|---|------|----------------|
| 1 | Login sebagai user biasa | Berhasil masuk |
| 2 | Buka detail event PAID | Muncul harga tiket dan tombol "Daftar" |
| 3 | Klik tombol Daftar | Redirect ke `/events/[id]/rsvp` |
| 4 | Konfirmasi pendaftaran | Status registrasi = PENDING_PAYMENT, redirect ke halaman payment |
| 5 | Di halaman payment, pilih metode pembayaran (BANK_TRANSFER/E_WALLET) | Form pembayaran tampil sesuai metode |
| 6 | Submit pembayaran | Loading indicator, lalu redirect ke payment result page |
| 7 | Cek payment result | Status menunjukkan "Menunggu Konfirmasi" / PENDING |

**Status:** ☐ Pass / ☐ Fail  
**Catatan:** _____________________

---

## TC-3.03: Konfirmasi Pembayaran (Admin/Auto)

| # | Step | Expected Result |
|---|------|----------------|
| 1 | Setelah TC-3.02, payment sudah dibuat | Payment record ada di database |
| 2 | Payment diverifikasi (via API/admin: PATCH /payments/:id/verify) | Payment status berubah ke VERIFIED |
| 3 | Registration status berubah | PENDING_PAYMENT → CONFIRMED |
| 4 | User melihat halaman My Tickets | Tiket muncul dengan status CONFIRMED |

**Status:** ☐ Pass / ☐ Fail  
**Catatan:** _____________________

---

## TC-3.04: Halaman My Tickets

| # | Step | Expected Result |
|---|------|----------------|
| 1 | Login sebagai user yang sudah daftar event | Berhasil masuk |
| 2 | Navigasi ke "Tiket Saya" di navbar | Halaman `/my-tickets` terbuka |
| 3 | Cek daftar tiket | Semua registrasi user ditampilkan (event name, date, status) |
| 4 | Cek filter status (jika ada) | Filter berfungsi sesuai status |
| 5 | Klik salah satu tiket | Redirect ke detail tiket `/my-tickets/[id]` |

**Status:** ☐ Pass / ☐ Fail  
**Catatan:** _____________________

---

## TC-3.05: Detail E-Ticket & QR Code

| # | Step | Expected Result |
|---|------|----------------|
| 1 | Buka detail tiket yang CONFIRMED | Halaman `/my-tickets/[id]` terbuka |
| 2 | Cek informasi tiket | Nama event, tanggal, lokasi, tipe tiket, status ditampilkan |
| 3 | Cek QR Code | QR code ter-generate dan ditampilkan |
| 4 | QR Code berisi data yang valid | Data berisi registration ID / unique code |
| 5 | Cek tampilan visual | Layout e-ticket rapi, bisa di-screenshot |

**Status:** ☐ Pass / ☐ Fail  
**Catatan:** _____________________

---

## TC-3.06: Pembatalan Registrasi

| # | Step | Expected Result |
|---|------|----------------|
| 1 | Login sebagai user yang sudah terdaftar di event | Berhasil masuk |
| 2 | Buka My Tickets, pilih tiket yang CONFIRMED/PENDING | Detail tiket terbuka |
| 3 | Klik tombol "Batalkan" | Confirm dialog muncul |
| 4 | Konfirmasi pembatalan | Status berubah ke CANCELLED |
| 5 | Kembali ke daftar tiket | Tiket menunjukkan status CANCELLED |
| 6 | Buka kembali event detail | Tombol "Daftar" muncul kembali (bisa re-register) |

**Status:** ☐ Pass / ☐ Fail  
**Catatan:** _____________________

---

## TC-3.07: Kuota Event Penuh

| # | Step | Expected Result |
|---|------|----------------|
| 1 | Event dengan maxAttendees sudah tercapai (currentCount = maxAttendees) | — |
| 2 | Login sebagai user baru yang belum daftar | Berhasil masuk |
| 3 | Buka detail event tersebut | Badge "Penuh" / kuota habis ditampilkan |
| 4 | Tombol Daftar | Disabled atau tidak muncul |
| 5 | Jika dipaksa via API (POST /registrations) | Return error 400: "Event is full" |

**Status:** ☐ Pass / ☐ Fail  
**Catatan:** _____________________

---

## TC-3.08: User Belum Login Coba RSVP

| # | Step | Expected Result |
|---|------|----------------|
| 1 | Buka event detail tanpa login | Detail event tampil |
| 2 | Klik tombol Daftar/RSVP | Redirect ke halaman login |
| 3 | Setelah login | Redirect kembali ke halaman event / RSVP |

**Status:** ☐ Pass / ☐ Fail  
**Catatan:** _____________________

---

## TC-3.09: Duplikat Registrasi

| # | Step | Expected Result |
|---|------|----------------|
| 1 | Login sebagai user yang SUDAH terdaftar di event | Berhasil masuk |
| 2 | Buka detail event yang sudah didaftar | Tombol "Sudah Terdaftar" / disabled |
| 3 | Jika dipaksa via API (POST /registrations) | Return error 400: "Already registered" |

**Status:** ☐ Pass / ☐ Fail  
**Catatan:** _____________________

---

## TC-3.10: Timeout Pembayaran

| # | Step | Expected Result |
|---|------|----------------|
| 1 | Registrasi event PAID, status PENDING_PAYMENT | — |
| 2 | Tunggu sampai melewati batas waktu (atau simulasi via API) | — |
| 3 | Cek status registrasi | Status berubah ke EXPIRED / CANCELLED |
| 4 | Slot kuota event | Dikembalikan (currentCount berkurang) |

**Status:** ☐ Pass / ☐ Fail  
**Catatan:** _____________________

---

## TC-3.11: Navigasi & Responsiveness

| # | Step | Expected Result |
|---|------|----------------|
| 1 | Buka di browser desktop | Layout normal, sidebar/navbar lengkap |
| 2 | Resize ke tablet (768px) | Layout responsive, tidak ada overflow |
| 3 | Resize ke mobile (375px) | Navigation collapse, konten readable |
| 4 | Navigasi: Home → Event → RSVP → My Tickets | Semua route berfungsi tanpa 404 |

**Status:** ☐ Pass / ☐ Fail  
**Catatan:** _____________________

---

## TC-3.12: API Error Handling

| # | Step | Expected Result |
|---|------|----------------|
| 1 | Matikan backend API | — |
| 2 | Coba akses My Tickets | Error message yang user-friendly ditampilkan |
| 3 | Coba RSVP event | Error message ditampilkan, tidak crash |
| 4 | Nyalakan kembali API | Halaman bisa di-refresh dan berfungsi normal |

**Status:** ☐ Pass / ☐ Fail  
**Catatan:** _____________________

---

## Ringkasan UAT

| Test Case | Deskripsi | Status |
|-----------|-----------|--------|
| TC-3.01 | RSVP Event Gratis | ☐ |
| TC-3.02 | Registrasi Event Berbayar | ☐ |
| TC-3.03 | Konfirmasi Pembayaran | ☐ |
| TC-3.04 | Halaman My Tickets | ☐ |
| TC-3.05 | Detail E-Ticket & QR Code | ☐ |
| TC-3.06 | Pembatalan Registrasi | ☐ |
| TC-3.07 | Kuota Event Penuh | ☐ |
| TC-3.08 | User Belum Login Coba RSVP | ☐ |
| TC-3.09 | Duplikat Registrasi | ☐ |
| TC-3.10 | Timeout Pembayaran | ☐ |
| TC-3.11 | Navigasi & Responsiveness | ☐ |
| TC-3.12 | API Error Handling | ☐ |

**Total Test Cases:** 12  
**Pass:** ___  
**Fail:** ___  
**Blocked:** ___  

**Tester:** _____________________  
**Tanggal Testing:** _____________________  
**Sign-off:** _____________________
