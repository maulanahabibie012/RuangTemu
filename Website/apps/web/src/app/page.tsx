import Link from "next/link";
import { ArrowRight, Compass, Sparkles, Users } from "lucide-react";
import { EventCard } from "@/components/event/event-card";
import { Button } from "@/components/ui/button";
import { CATEGORIES, DEMO_EVENTS } from "@/lib/demo-events";

export default function HomePage() {
  const popular = DEMO_EVENTS.slice(0, 3);
  const upcoming = DEMO_EVENTS;

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary-light/60 to-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:gap-12 lg:py-20">
          <div className="flex-1 space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-surface-elevated px-3 py-1 text-xs font-medium text-primary shadow-sm ring-1 ring-border">
              <Sparkles className="size-3.5" aria-hidden />
              Demo MVP · Web first
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
              Temukan gathering yang{" "}
              <span className="text-primary">pas buat kamu</span>
            </h1>
            <p className="max-w-xl text-base text-muted sm:text-lg">
              Board game, tech meetup, kuliner, olahraga, seni, musik — RSVP, e-tiket QR,
              dan komunitas dalam satu platform.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/search">
                <Button size="lg" className="w-full sm:w-auto">
                  Cari gathering
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/organizer/events/new">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Buat event
                </Button>
              </Link>
            </div>
            <dl className="grid grid-cols-3 gap-4 pt-2 text-center sm:max-w-md sm:text-left">
              <div>
                <dt className="text-xs text-muted">Kategori</dt>
                <dd className="text-lg font-semibold text-foreground">6+</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Demo event</dt>
                <dd className="text-lg font-semibold text-foreground">{DEMO_EVENTS.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Mode</dt>
                <dd className="text-lg font-semibold text-foreground">Gratis</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-1 flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface-elevated p-5 shadow-md sm:p-6">
            <p className="text-sm font-medium text-foreground">Cari cepat</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="home-search">
                Kata kunci
              </label>
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder="Board game, meetup, futsal…"
                className="h-12 w-full flex-1 rounded-[var(--radius-md)] border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                readOnly
                aria-describedby="home-search-hint"
              />
              <Link href="/search" className="sm:shrink-0">
                <Button size="lg" className="w-full">
                  Cari
                </Button>
              </Link>
            </div>
            <p id="home-search-hint" className="text-xs text-muted">
              Search penuh menyusul di Phase 2 — tombol mengarah ke /search.
            </p>
            <ul className="mt-2 grid gap-3 sm:grid-cols-3">
              <li className="flex items-start gap-2 rounded-[var(--radius-md)] bg-surface p-3 text-sm">
                <Compass className="mt-0.5 size-4 text-primary" aria-hidden />
                <span>
                  <strong className="block font-medium text-foreground">Discovery</strong>
                  <span className="text-muted">Minat & lokasi</span>
                </span>
              </li>
              <li className="flex items-start gap-2 rounded-[var(--radius-md)] bg-surface p-3 text-sm">
                <Users className="mt-0.5 size-4 text-secondary" aria-hidden />
                <span>
                  <strong className="block font-medium text-foreground">Komunitas</strong>
                  <span className="text-muted">Chat & rating</span>
                </span>
              </li>
              <li className="flex items-start gap-2 rounded-[var(--radius-md)] bg-surface p-3 text-sm">
                <Sparkles className="mt-0.5 size-4 text-success" aria-hidden />
                <span>
                  <strong className="block font-medium text-foreground">E-tiket</strong>
                  <span className="text-muted">QR check-in</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="cat-heading">
        <h2 id="cat-heading" className="mb-4 text-xl font-semibold text-foreground">
          Kategori
        </h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={cat === "Semua" ? "/search" : `/search?category=${encodeURIComponent(cat)}`}
              className="rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Popular */}
      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6" aria-labelledby="popular-heading">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 id="popular-heading" className="text-xl font-semibold text-foreground sm:text-2xl">
              Populer
            </h2>
            <p className="mt-1 text-sm text-muted">Gathering yang sedang ramai diminati</p>
          </div>
          <Link
            href="/search"
            className="text-sm font-medium text-primary hover:underline"
          >
            Lihat semua
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Upcoming */}
      <section
        className="border-t border-border bg-surface py-12"
        aria-labelledby="upcoming-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2
                id="upcoming-heading"
                className="text-xl font-semibold text-foreground sm:text-2xl"
              >
                Segera dimulai
              </h2>
              <p className="mt-1 text-sm text-muted">Data demo — API NestJS menyusul</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
