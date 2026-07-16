'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getRegistrationById } from '@/lib/registrations-api';
import type { Registration } from '@/types/registration';
import { useAuthStore } from '@/stores/auth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CheckCircle2, Clock, XCircle, Ticket } from 'lucide-react';
import Link from 'next/link';

export default function PaymentResultPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const registrationId = searchParams.get('registrationId');
  const statusParam = searchParams.get('status');

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!registrationId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const reg = await getRegistrationById(registrationId);
        setRegistration(reg);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, registrationId, router]);

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

  const isSuccess = statusParam === 'success' || registration?.status === 'CONFIRMED';
  const isPending = statusParam === 'pending' || registration?.status === 'PENDING';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 mt-16 max-w-lg">
        <div className="border rounded-xl p-8 text-center space-y-6">
          {isSuccess && (
            <>
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h1>
                <p className="text-muted">
                  Tiket Anda telah dikonfirmasi. Anda akan menerima e-ticket melalui email.
                </p>
              </div>
              {registration?.event && (
                <div className="border rounded-lg p-4 text-left bg-muted/5">
                  <p className="font-semibold">{registration.event.title}</p>
                  <p className="text-sm text-muted mt-1">
                    {new Date(registration.event.eventDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Link
                  href={registrationId ? `/my-tickets/${registrationId}` : '/my-tickets'}
                  className="w-full py-3 px-6 bg-primary text-primary-fg rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Ticket className="w-5 h-5" />
                  Lihat E-Ticket
                </Link>
                <Link
                  href={`/events/${params.id}`}
                  className="w-full py-3 px-6 border rounded-lg font-medium hover:bg-muted/20 transition-colors"
                >
                  Kembali ke Event
                </Link>
              </div>
            </>
          )}

          {isPending && !isSuccess && (
            <>
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Menunggu Pembayaran</h1>
                <p className="text-muted">
                  Pembayaran Anda sedang diproses. Tiket akan dikonfirmasi setelah pembayaran selesai.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/my-tickets"
                  className="w-full py-3 px-6 bg-primary text-primary-fg rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Lihat Tiket Saya
                </Link>
                <Link
                  href={`/events/${params.id}`}
                  className="w-full py-3 px-6 border rounded-lg font-medium hover:bg-muted/20 transition-colors"
                >
                  Kembali ke Event
                </Link>
              </div>
            </>
          )}

          {!isSuccess && !isPending && (
            <>
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Pembayaran Gagal</h1>
                <p className="text-muted">
                  Pembayaran tidak berhasil. Silakan coba lagi atau hubungi support.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href={`/events/${params.id}`}
                  className="w-full py-3 px-6 bg-primary text-primary-fg rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Coba Lagi
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
