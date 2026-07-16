'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getRegistrationById, cancelRegistration, simulatePayment } from '@/lib/registrations-api';
import type { Registration } from '@/types/registration';
import { Badge } from '@/components/ui/badge';
import { ETicket } from '@/components/ticket/e-ticket';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchRegistration() {
      try {
        const data = await getRegistrationById(id);
        setRegistration(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    }
    fetchRegistration();
  }, [id]);

  async function handleCancel() {
    if (!confirm('Apakah Anda yakin ingin membatalkan registrasi ini?')) return;
    setActionLoading(true);
    try {
      await cancelRegistration(id);
      router.push('/my-tickets');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membatalkan');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSimulatePayment() {
    setActionLoading(true);
    try {
      await simulatePayment(id);
      const data = await getRegistrationById(id);
      setRegistration(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal memproses pembayaran');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <p className="text-destructive">{error || 'Tiket tidak ditemukan'}</p>
        <Link href="/my-tickets" className="text-primary hover:underline mt-4 inline-block">
          ← Kembali
        </Link>
      </div>
    );
  }

  const event = registration.event;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/my-tickets" className="text-primary hover:underline mb-6 inline-block">
        ← Kembali ke Tiket Saya
      </Link>

      <div className="border rounded-lg overflow-hidden">
        {/* Event Info Header */}
        {event?.coverImageUrl && (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">{event?.title || 'Event'}</h1>
              <p className="text-muted-foreground mt-1">
                {event?.eventDate
                  ? new Date(event.eventDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''}
              </p>
              <p className="text-muted-foreground">{event?.locationName}</p>
            </div>
            <Badge
              variant={
                registration.status === 'CONFIRMED'
                  ? 'success'
                  : registration.status === 'PENDING'
                    ? 'warning'
                    : 'error'
              }
            >
              {registration.status === 'CONFIRMED'
                ? 'Terkonfirmasi'
                : registration.status === 'PENDING'
                  ? 'Menunggu Pembayaran'
                  : registration.status === 'CANCELLED'
                    ? 'Dibatalkan'
                    : registration.status}
            </Badge>
          </div>

          {/* QR E-Ticket Section */}
          {registration.status === 'CONFIRMED' && registration.qrCode && (
            <div className="border-t pt-6 mt-6">
              <ETicket registration={registration} />
            </div>
          )}

          {/* Payment Section for PENDING paid events */}
          {registration.status === 'PENDING' && event?.ticketType === 'PAID' && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold mb-2">Pembayaran</h2>
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span>Harga tiket</span>
                  <span>Rp {event.ticketPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>Rp {event.ticketPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>
              {registration.heldUntil && (
                <p className="text-sm text-warning mb-4">
                  Selesaikan pembayaran sebelum{' '}
                  {new Date(registration.heldUntil).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
              <button
                onClick={handleSimulatePayment}
                disabled={actionLoading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {actionLoading ? 'Memproses...' : 'Bayar Sekarang (Demo)'}
              </button>
            </div>
          )}

          {/* Cancel button */}
          {(registration.status === 'CONFIRMED' || registration.status === 'PENDING') && (
            <div className="border-t pt-4 mt-6">
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="w-full border border-destructive text-destructive py-2 rounded-lg hover:bg-destructive/10 disabled:opacity-50"
              >
                {actionLoading ? 'Membatalkan...' : 'Batalkan Registrasi'}
              </button>
            </div>
          )}

          {/* Registration details */}
          <div className="border-t pt-4 mt-6 text-sm text-muted-foreground">
            <p>ID Registrasi: {registration.id}</p>
            <p>Terdaftar: {new Date(registration.createdAt).toLocaleDateString('id-ID')}</p>
            {registration.checkedInAt && (
              <p>Check-in: {new Date(registration.checkedInAt).toLocaleString('id-ID')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
