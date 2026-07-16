"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { getOrganizerEvents } from "@/lib/events-api";
import { EventCard } from "@/components/event/event-card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import type { Event, EventStatus } from "@/types/event";

const STATUS_FILTERS: { value: EventStatus | ""; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

export default function MyEventsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<EventStatus | "">("");

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getOrganizerEvents(user.id)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user]);

  const filtered = statusFilter ? events.filter((e) => e.status === statusFilter) : events;

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Login Diperlukan</h1>
          <p className="text-muted mb-8">Anda harus login untuk melihat event Anda.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-fg rounded-[var(--radius-md)]">
            Masuk
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Event Saya</h1>
          <Link href="/events/create">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Buat Event
            </Button>
          </Link>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-primary-fg"
                  : "bg-[var(--surface)] text-muted hover:text-foreground border border-[var(--border)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <CalendarDays className="size-16 text-muted/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {events.length === 0 ? "Belum ada event" : "Tidak ada event dengan status ini"}
            </h2>
            <p className="text-muted mb-6">
              {events.length === 0 ? "Mulai buat event pertama Anda!" : "Coba filter status lain"}
            </p>
            {events.length === 0 && (
              <Link href="/events/create">
                <Button className="gap-1.5">
                  <Plus className="size-4" />
                  Buat Event
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}