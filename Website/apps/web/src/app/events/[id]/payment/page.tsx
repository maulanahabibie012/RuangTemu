'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { createPayment, getRegistrationById, simulatePayment } from '@/lib/registrations-api';
import type { Registration, Payment } from '@/types/registration';
import { useAuthStore } from '@/stores/auth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CreditCard, Clock, ArrowLeft, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    snap?: {
      pay: (token: string, callbacks: {
        onSuccess?: (result: unknown) => void;
        onPending?: (result: unknown) => void;
        onError?: (result: unknown) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const registrationId = searchParams.get('registrationId');

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!registrationId) {
      setError('Registration ID tidak ditemukan');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const reg = await getRegistrationById(registrationId);
        setRegistration(reg);

        if (reg.status === 'CONFIRMED') {
          router.push(`/events/${params.id}/payment/result?registrationId=${registrationId}&status=success`);
          return;
        }

        // Create payment if needed
        const pay = await createPayment(registrationId);
        setPayment(pay);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data pembayaran');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, registrationId, router, params.id]);

  // Countdown timer for heldUntil
  useEffect(() => {
    if (!registration?.heldUntil) return;

    const updateTimer = () => {
      const remaining = Math.max(0, new Date(registration.heldUntil!).getTime() - Date.now());
      setTimeLeft(Math.floor(remaining / 1000));

      if (remaining <= 0) {
        setError('Waktu pembayaran habis. Silakan daftar ulang.');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [registration?.heldUntil]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMidtransPay = useCallback(() => {
    if (!payment?.snapToken) return;

    if (window.snap) {
      window.snap.pay(payment.snapToken, {
        onSuccess: () => {
          router.push(`/events/${params.id}/payment/result?registrationId=${registrationId}&status=success`);
        },
        onPending: () => {
          router.push(`/events/${params.id}/payment/result?registrationId=${registrationId}&status=pending`);
        },
        onError: () => {
          setError('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: () => {
          // User closed the popup
        },
      });
    }
  }, [payment?.snapToken, params.id, registrationId, router]);

  const handleSimulatePayment = async () => {
    if (!registrationId) return;
    setProcessing(true);
    try {
      await simulatePayment(registrationId);
      router.push(`/events/${params.id}/payment/result?registrationId=${registrationId}&status=success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses pembayaran');
    } finally {
      setProcessing(false);
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Pembayaran</h1>
            {timeLeft !== null && timeLeft > 0 && (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold">{formatCountdown(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {registration?.event && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/5">
              <h2 className="font-semibold">{registration.event.title}</h2>
              <div className="space-y-1 text-sm">
                {payment && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted">Harga tiket</span>
                      <span>Rp {(payment.amount - payment.platformFee).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Biaya layanan</span>
                      <span>Rp {payment.platformFee.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>Total</span>
                      <span>Rp {payment.amount.toLocaleString('id-ID')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Payment Actions */}
          {timeLeft !== null && timeLeft > 0 && !error && (
            <div className="space-y-4">
              {/* Midtrans Snap Button */}
              <button
                onClick={handleMidtransPay}
                disabled={!payment?.snapToken}
                className="w-full py-3 px-6 bg-primary text-primary-fg rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Bayar dengan Midtrans
              </button>

              {/* Demo/Sandbox: Simulate Payment */}
              <div className="border-t pt-4">
                <p className="text-sm text-muted mb-3 text-center">
                  Atau gunakan mode simulasi (sandbox):
                </p>
                <button
                  onClick={handleSimulatePayment}
                  disabled={processing}
                  className="w-full py-3 px-6 border-2 border-dashed border-primary/50 text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Simulasi Pembayaran Berhasil'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Expired */}
          {(timeLeft === 0 || (timeLeft !== null && timeLeft <= 0)) && (
            <div className="text-center space-y-4">
              <p className="text-red-500 font-medium">Waktu pembayaran telah habis</p>
              <button
                onClick={() => router.push(`/events/${params.id}`)}
                className="px-6 py-3 border rounded-lg hover:bg-muted/20 transition-colors"
              >
                Kembali ke Event
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
