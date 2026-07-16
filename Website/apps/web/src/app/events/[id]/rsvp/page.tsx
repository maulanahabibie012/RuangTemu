'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEvent } from '@/lib/events-api';
import { registerForEvent } from '@/lib/registrations-api';
import type { Event } from '@/types/event';
import { useAuthStore } from '@/stores/auth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CalendarDays, MapPin, Ticket, ArrowLeft, CheckCircle2 } from 'lucide-react';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RSVPPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchEvent = async () => {
      try {
        const data = await getEvent(params.id as string);
        setEvent(data);
      } catch {
        setError('Event tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id, user, router]);

  const handleRegister = async () => {
    if (!event) return;
    setRegistering(true);
    setError(null);

    try {
      const registration = await registerForEvent(event.id);

      if (event.ticketType === 'PAID') {
        // Redirect to payment page
        router.push(`/events/${event.id}/payment?registrationId=${registration.id}`);
      } else {
        // FREE event — go to ticket detail
        router.push(`/my-tickets/${registration.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftar');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Tidak Ditemukan</h1>
          <p className="text-muted">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 mt-16 max-w-2xl">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="border rounded-xl p-6 space-y-6">
          <h1 className="text-2xl font-bold">Konfirmasi Pendaftaran</h1>

          {/* Event Summary */}
          <div className="border rounded-lg p-4 space-y-3 bg-muted/5">
            <h2 className="text-lg font-semibold">{event.title}</h2>

            <div className="flex items-center gap-2 text-sm text-muted">
              <CalendarDays className="w-4 h-4" />
              <span>
                {formatDate(event.eventDate)} · {formatTime(event.eventDate)} WIB
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPin className="w-4 h-4" />
              <span>{event.locationName}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted">
              <Ticket className="w-4 h-4" />
              <span>
                {event.ticketType === 'FREE'
                  ? 'Gratis'
                  : `Rp ${event.ticketPrice.toLocaleString('id-ID')}`}
              </span>
            </div>
          </div>

          {/* Confirmation Details */}
          <div className="space-y-3">
            <h3 className="font-semibold">Detail Peserta</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted">Nama</p>
                <p className="font-medium">{user?.name || '-'}</p>
              </div>
              <div>
                <p className="text-muted">Email</p>
                <p className="font-medium">{user?.email || '-'}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {event.ticketType === 'PAID' && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Harga tiket</span>
                <span>Rp {event.ticketPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Biaya layanan (5%)</span>
                <span>Rp {Math.round(event.ticketPrice * 0.05).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total</span>
                <span>Rp {Math.round(event.ticketPrice * 1.05).toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}

          {/* Terms */}
          <div className="flex items-start gap-2 text-sm text-muted">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <p>
              Dengan mendaftar, Anda menyetujui syarat dan ketentuan event ini.
              {event.ticketType === 'PAID' && ' Anda memiliki waktu 15 menit untuk menyelesaikan pembayaran.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 py-3 px-6 border rounded-lg font-medium hover:bg-muted/20 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleRegister}
              disabled={registering}
              className="flex-1 py-3 px-6 bg-primary text-primary-fg rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {registering
                ? 'Memproses...'
                : event.ticketType === 'PAID'
                  ? 'Lanjut ke Pembayaran'
                  : 'Daftar Sekarang'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
