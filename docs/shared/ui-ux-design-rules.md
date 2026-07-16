# UI/UX Design Rules untuk RuangTemu

> Diadaptasi dari [UI/UX Pro Max Skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)

## 1. Visual Hierarchy & Spacing

### Spacing System
- Gunakan skala spacing yang konsisten: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- Minimum 16px padding pada semua sisi container
- 24-32px gap antara elemen yang berhubungan
- 48-64px gap antara section yang berbeda
- Jangan pernah membiarkan elemen menyentuh tepi container tanpa padding

### Typography
- Hierarki tipe yang jelas: Hero (48-72px), H1 (36-48px), H2 (24-36px), H3 (20-24px), Body (16-18px), Small (14px), Caption (12px)
- Line height: 1.5 untuk body text, 1.2-1.3 untuk heading
- Lebar baris maksimum: 65-75 karakter untuk keterbacaan
- Gunakan variasi font-weight untuk penekanan (400, 500, 600, 700)
- Ukuran font minimum: 14px (jangan pernah di bawah 12px)

### Color
- Gunakan warna primer dengan 2-3 shade (light, base, dark)
- Gunakan warna sekunder/aksen secara hemat untuk penekanan
- Rasio kontras 4.5:1 untuk teks normal (WCAG AA)
- Rasio kontras 3:1 untuk teks besar dan komponen UI
- Warna semantik: Success (hijau), Warning (amber/kuning), Error (merah), Info (biru)
- Batasi palet ke 5-7 warna maksimum (termasuk neutral)

### Shadows & Depth
- Gunakan layered shadows untuk kedalaman realistis
- Shadow yang lebih besar untuk elemen elevated (modal, dropdown)
- Shadow subtle (1-2px blur) untuk elevasi ringan (card, button)
- Arah shadow harus konsisten

## 2. Responsive Design

### Breakpoints
- Mobile: 320px - 480px
- Tablet: 481px - 768px
- Desktop: 769px - 1024px
- Large Desktop: 1025px - 1440px
- Ultra-wide: 1441px+

### Mobile-First
- Desain untuk mobile terlebih dahulu, lalu tingkatkan untuk layar yang lebih besar
- Gunakan unit relatif (rem, em, %, vw, vh)
- Minimum touch target: 44x44px (Apple) / 48x48px (Material Design)
- Minimum spacing antar touch target: 8px
- Stack layout vertikal di mobile, gunakan grid di desktop

### Fluid Design
- Gunakan CSS clamp() untuk typography fluid
- Gunakan minmax() dalam grid layout
- Gambar harus responsive dengan max-width: 100%
- Gunakan aspect-ratio untuk mencegah layout shift

## 3. Animasi & Micro-interactions

### Timing
- Feedback instan: 50-100ms (tekan tombol, toggle)
- Animasi cepat: 150-200ms (hover effects, transisi kecil)
- Animasi standar: 250-350ms (transisi halaman, modal)
- Animasi kompleks: 400-500ms
- Jangan melebihi 500ms untuk transisi UI

### Easing
- ease-out untuk elemen masuk
- ease-in untuk elemen keluar
- ease-in-out untuk elemen yang bergerak
- Jangan gunakan linear untuk animasi UI

### Motion Principles
- Animasikan opacity dan transform (GPU-accelerated)
- Hindari animasi width, height, top, left
- Hormati prefers-reduced-motion
- Stagger animasi untuk list (50-100ms delay antar item)

## 4. Accessibility (WCAG)

### Keyboard Navigation
- Semua elemen interaktif harus bisa diakses via keyboard
- Focus indicator yang terlihat (min 2px outline)
- Tab order yang logis
- Sediakan skip-to-content link
- Dukung Escape untuk menutup modal/overlay

### Screen Readers
- Gunakan elemen HTML semantik (nav, main, article, section, aside)
- Tambahkan aria-labels untuk tombol icon-only
- Gunakan aria-live untuk konten dinamis
- Sediakan alt text untuk semua gambar bermakna

### Visual Accessibility
- Jangan gunakan warna saja untuk menyampaikan informasi
- Dukung text scaling hingga 200%
- Pastikan kontras warna yang cukup di semua state

## 5. Component Design Patterns

### Buttons
- Primary: Filled/solid, kontras tinggi
- Secondary: Outlined atau subtle fill
- Tertiary/Ghost: Text-only atau minimal
- Minimum width: 80px
- Padding konsisten: 12px 24px (standard), 8px 16px (compact)
- Loading state dengan spinner + disabled saat async
- Hover: perubahan background subtle, shadow lift
- Active: scale down (0.98) atau background lebih gelap
- Disabled: 50% opacity, cursor: not-allowed

### Cards
- Border-radius konsisten (8-16px)
- Hierarki konten yang jelas
- Hover state jika clickable
- Minimum padding: 16px internal
- Skeleton loading state
- Tinggi konsisten dalam grid

### Modals & Overlays
- Backdrop overlay (rgba(0,0,0,0.5))
- Center secara vertikal dan horizontal
- Max width: 600px (standard), 400px (confirm)
- Tombol close di kanan atas
- Close on backdrop click dan Escape
- Trap focus dalam modal
- Animasi: fade + scale up dari 0.95
- Cegah body scroll

### Dropdowns & Select
- Max height: 300-400px dengan scroll
- Highlight item yang dipilih
- Support keyboard navigation
- Search/filter untuk list > 10 item
- Posisi cerdas (flip jika dekat viewport edge)

## 6. Form Design

### Input Fields
- Minimum height: 44px
- Label yang jelas di atas input (bukan hanya placeholder)
- Border: 1-2px solid
- Focus state: colored border + subtle box-shadow
- Error state: border merah + pesan error di bawah
- Success state: border hijau + checkmark icon

### Form Layout
- Single column untuk sebagian besar form
- Group field yang berhubungan
- Label di atas input
- Indikator required: asterisk (*) atau "(required)"
- Action button di bawah, primary di kanan
- Inline validation on blur

### Error Handling
- Error di bawah input terkait
- Pesan error yang deskriptif
- Scroll ke error pertama saat submit
- Pertahankan data yang sudah dimasukkan
- Error summary di atas untuk form panjang

## 7. Navigation

### Primary Navigation
- Maksimum 7 item (±2)
- Indikasi halaman aktif yang jelas
- Breadcrumbs untuk hierarki dalam (3+ level)
- Mobile: hamburger menu atau bottom tab bar (max 5 item)
- Sticky navigation untuk halaman panjang

### Information Architecture
- Hierarki flat (sedikit klik untuk mencapai konten)
- Link text yang deskriptif
- Tunjukkan lokasi user saat ini
- Sediakan search untuk situs konten berat

## 8. Images & Media

- WebP/AVIF dengan fallback
- Lazy loading untuk gambar below-the-fold
- Alt text yang sesuai
- Srcset untuk gambar responsive
- Placeholder/blur-up saat loading
- Pertahankan aspect ratio

### Icons
- Set icon yang konsisten
- Minimum size: 20x20px untuk icon interaktif
- Label atau tooltip untuk icon-only action
- Outline untuk inactive, filled untuk active

## 9. Loading & Performance UX

### Loading States
- Skeleton screen daripada spinner untuk area konten
- Progress bar untuk loading determinate
- Spinner untuk wait singkat (< 3 detik)
- Jangan tampilkan layar kosong saat loading

### Optimistic UI
- Tampilkan hasil yang diharapkan segera, revert jika gagal
- Cache data yang sudah dimuat
- Prioritaskan konten above-the-fold

## 10. Dark Mode & Theming

- Jangan gunakan pure black (#000); gunakan dark grays (#121212, #1a1a1a)
- Kurangi intensitas shadow di dark mode
- Gunakan CSS custom properties untuk semua warna
- Dua mode saja: Light ↔ Dark (tanpa mode system/auto)
- Transisi smooth antar tema (0.3s)
- Desaturate warna primer sedikit untuk background gelap
- Pastikan rasio kontras terpenuhi di kedua tema

### Implementasi Web (RuangTemu)

| Item | Detail |
|------|--------|
| Library | `next-themes` |
| Strategy | Class pada `<html>` (`.dark`) — **bukan** hanya media query |
| Default | `light` |
| Kontrol user | Toggle Navbar: **light ↔ dark** (2 mode saja) |
| Tokens light | `:root` di `Website/apps/web/src/app/globals.css` |
| Tokens dark | `.dark { ... }` di file yang sama |
| Provider | `ThemeProvider` di root layout (`suppressHydrationWarning` pada `<html>`) |

Semua komponen UI wajib memakai token (`bg-background`, `text-foreground`, `bg-primary`, dll.) agar light & dark konsisten tanpa hardcode warna per mode.


## 11. Data Display

### Tables
- Sticky header
- Alternating row colors (subtle)
- Sortable columns
- Responsive: horizontal scroll atau card layout di mobile
- Minimum cell padding: 12px
- Right-align data numerik, left-align teks
- Pagination atau virtual scrolling untuk dataset besar

### Empty States
- Empty state yang bermakna dengan ilustrasi
- Call-to-action yang jelas
- Pesan yang ramah dan membantu

## 12. Notifications & Feedback

### Toast Notifications
- Posisi: top-right atau bottom-right (konsisten)
- Auto-dismiss 3-5 detik
- Tombol dismiss
- Stack multiple toasts
- Warna semantik yang sesuai

### Progress Indicators
- Step indicator untuk proses multi-step
- Label untuk setiap step
- Izinkan navigasi kembali ke step yang sudah selesai
- Tampilkan persentase atau step count

## 13. Search & Filtering

### Search
- Search bar yang prominent
- Recent searches dan suggestions
- Debounce input (300ms)
- Tampilkan jumlah hasil
- Highlight teks yang cocok
- Handle zero results dengan saran

### Filters
- Tampilkan jumlah filter aktif
- "Clear all filters" option
- Update jumlah hasil saat filter berubah
- Collapsible di mobile

## 14. Mobile-Specific Patterns

- Support swipe gestures
- Pull-to-refresh
- Bottom sheet daripada modal
- FAB untuk aksi kreasi utama
- Bottom tab bar untuk navigasi utama
- Thumb-zone aware placement

## 15. Layout & Grid Systems

- 12-column grid
- Gutter: 16px mobile, 24px desktop
- Max content width: 1200-1440px
- Center main content container
- CSS Grid untuk 2D, Flexbox untuk 1D

## 16. Call-to-Action (CTA)

- Satu CTA primer per viewport/section
- Kontras tinggi
- Teks action-oriented: "Mulai Sekarang", "Buat Akun"
- Hierarki ukuran
- Sticky CTA di mobile untuk aksi konversi

## 17. Content Strategy

- Microcopy yang jelas dan ringkas
- Active voice
- Front-load informasi penting
- Sentence case untuk UI text
- Progressive disclosure
- Truncate teks panjang dengan "Baca selengkapnya"

## 18. Error Prevention & Edge Cases

- Disable submit button sampai form valid
- Konfirmasi aksi destruktif
- Auto-save draft untuk form panjang
- Warning unsaved changes
- Handle offline state
- Desain untuk panjang konten ekstrem

## 19. State Management UI

- Visual yang jelas untuk setiap state: default, hover, active, focused, disabled, loading, error, success
- Transisi antar state (bukan perubahan mendadak)
- Konsistensi state di seluruh aplikasi

## 20. Advanced Interaction Patterns

### Drag & Drop
- Drop zone yang jelas
- Grab cursor dan drag preview
- Position indicator
- Keyboard alternative
- Animasi reposisi yang smooth

### Infinite Scroll vs Pagination
- Infinite scroll untuk konten feed
- Pagination untuk konten searchable/filterable
- "Load more" sebagai pendekatan hybrid
- Pertahankan scroll position saat navigasi kembali

## Prinsip Umum

1. **Konsistensi**: Pola yang sama di seluruh aplikasi
2. **Feedback**: Setiap aksi user harus ada feedback visual
3. **Pengampunan**: Izinkan undo, konfirmasi untuk aksi destruktif
4. **Efisiensi**: Minimalkan klik/tap untuk task umum
5. **Kejelasan**: UI harus self-explanatory
6. **Kegembiraan**: Polish yang subtle untuk pengalaman menyenangkan
7. **Performa**: UI cepat = UI bagus
8. **Inklusivitas**: Desain untuk semua kemampuan, perangkat, dan konteks