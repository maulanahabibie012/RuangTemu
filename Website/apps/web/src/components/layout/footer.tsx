import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-sm">
          <p className="text-base font-semibold text-foreground">RuangTemu</p>
          <p className="mt-2 text-sm text-muted">
            Temukan gathering, komunitas, dan pengalaman seru di sekitarmu.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-foreground">Produk</span>
            <Link href="/search" className="text-muted hover:text-primary">
              Cari event
            </Link>
            <Link href="/organizer/events/new" className="text-muted hover:text-primary">
              Buat event
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-foreground">Akun</span>
            <Link href="/login" className="text-muted hover:text-primary">
              Masuk
            </Link>
            <Link href="/register" className="text-muted hover:text-primary">
              Daftar
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} RuangTemu · Demo MVP
      </div>
    </footer>
  );
}
