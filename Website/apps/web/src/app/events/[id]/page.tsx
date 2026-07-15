import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_EVENTS } from "@/lib/demo-events";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const event = DEMO_EVENTS.find((e) => e.id === id);
  return {
    title: event?.title ?? "Event",
    description: event
      ? `${event.title} · ${event.location} · ${event.dateLabel}`
      : "Detail gathering RuangTemu",
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = DEMO_EVENTS.find((e) => e.id === id);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Kembali
      </Link>

      <div
        className={`mb-6 aspect-[21/9] w-full rounded-[var(--radius-xl)] bg-gradient-to-br ${event.coverGradient} shadow-md`}
        aria-hidden
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="primary">{event.category}</Badge>
        <Badge variant={event.isFree ? "success" : "secondary"}>{event.priceLabel}</Badge>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {event.title}
      </h1>

      <ul className="mt-6 space-y-3 text-sm text-muted">
        <li className="flex items-center gap-2">
          <Calendar className="size-4 text-primary" aria-hidden />
          {event.dateLabel}
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" aria-hidden />
          {event.location}
        </li>
        <li className="flex items-center gap-2">
          <Users className="size-4 text-primary" aria-hidden />
          {event.quotaLabel}
        </li>
      </ul>

      <div className="mt-8 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-foreground">Tentang event</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Ini halaman detail demo (SSR-ready). Deskripsi, peta, daftar peserta, dan tombol RSVP
          nyata akan terhubung ke NestJS di Phase 2–4. Desain mengikuti{" "}
          <code className="text-xs">docs/ui-ux-design-rules.md</code>.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="w-full sm:w-auto" disabled>
          RSVP (menyusul API)
        </Button>
        <Link href="/login" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full">
            Masuk untuk ikut
          </Button>
        </Link>
      </div>
    </div>
  );
}
