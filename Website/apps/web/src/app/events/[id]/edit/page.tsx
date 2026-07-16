"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { getEvent, updateEvent } from "@/lib/events-api";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import EventForm from "@/components/event/event-form";
import type { Event } from "@/types/event";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEvent(params.id as string);
        setEvent(data);
      } catch {
        setError("Event tidak ditemukan");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      setError(null);
      await updateEvent(params.id as string, data);
      router.push(`/events/${params.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Gagal mengupdate event");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Login Diperlukan</h1>
          <p className="text-muted mb-8">Anda harus login untuk mengedit event.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-fg rounded-[var(--radius-md)] hover:opacity-90 transition-opacity">
            Masuk
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center py-32">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
        </div>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted mb-8">{error || "Event tidak ditemukan"}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-fg rounded-[var(--radius-md)]">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (user && event.organizerId !== user.id) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
          <p className="text-muted mb-8">Anda tidak memiliki izin untuk mengedit event ini.</p>
          <Link href={`/events/${event.id}`} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-fg rounded-[var(--radius-md)]">
            <ArrowLeft className="size-4" />
            Kembali ke Event
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link href={`/events/${event.id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary">
          <ArrowLeft className="size-4" />
          Kembali ke Event
        </Link>
        <h1 className="text-3xl font-bold mb-8">Edit Event</h1>
        {error && (
          <div className="mb-6 p-4 rounded-[var(--radius-md)] border border-error/30 bg-error-light/20 text-error text-sm">
            {error}
          </div>
        )}
        <EventForm initialData={event} onSubmit={handleSubmit} submitting={submitting} isEdit />
      </main>
      <Footer />
    </>
  );
}