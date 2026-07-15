import { EventCard } from "@/components/event/event-card";
import { DEMO_EVENTS } from "@/lib/demo-events";

export const metadata = {
  title: "Cari gathering",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Cari gathering</h1>
        <p className="text-muted">
          Filter lengkap (tanggal, radius, gratis/berbayar) di Phase 2. Saat ini menampilkan data
          demo.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Kata kunci…"
          className="h-12 w-full flex-1 rounded-[var(--radius-md)] border border-border bg-surface-elevated px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Kata kunci pencarian"
          readOnly
        />
      </div>

      <p className="mb-4 text-sm text-muted">{DEMO_EVENTS.length} event demo</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_EVENTS.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
