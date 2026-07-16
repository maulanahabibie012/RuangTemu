"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { createEvent } from "@/lib/events-api";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import EventForm from "@/components/event/event-form";

export default function CreateEventPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      setError(null);
      const event = await createEvent(data);
      router.push(`/events/${event.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Gagal membuat event");
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
          <p className="text-muted mb-8">Anda harus login untuk membuat event.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-fg rounded-[var(--radius-md)] hover:opacity-90 transition-opacity">
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
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary">
          <ArrowLeft className="size-4" />
          Kembali
        </Link>
        <h1 className="text-3xl font-bold mb-8">Buat Event Baru</h1>
        {error && (
          <div className="mb-6 p-4 rounded-[var(--radius-md)] border border-error/30 bg-error-light/20 text-error text-sm">
            {error}
          </div>
        )}
        <EventForm onSubmit={handleSubmit} submitting={submitting} />
      </main>
      <Footer />
    </>
  );
}