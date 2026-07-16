'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyRegistrations } from '@/lib/registrations-api';
import type { Registration } from '@/types/registration';
import { Badge } from '@/components/ui/badge';

export default function MyTicketsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRegistrations() {
      try {
        const data = await getMyRegistrations();
        setRegistrations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    }
    fetchRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Tiket Saya</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Tiket Saya</h1>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tiket Saya</h1>

      {registrations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Belum ada tiket</p>
          <Link
            href="/search"
            className="text-primary hover:underline"
          >
            Jelajahi event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <Link
              key={reg.id}
              href={`/my-tickets/${reg.id}`}
              className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {reg.event?.coverImageUrl && (
                  <img
                    src={reg.event.coverImageUrl}
                    alt={reg.event.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {reg.event?.title || 'Event'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {reg.event?.eventDate
                      ? new Date(reg.event.eventDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {reg.event?.locationName}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={
                      reg.status === 'CONFIRMED'
                        ? 'success'
                        : reg.status === 'PENDING'
                          ? 'warning'
                          : 'error'
                    }
                  >
                    {reg.status === 'CONFIRMED'
                      ? 'Terkonfirmasi'
                      : reg.status === 'PENDING'
                        ? 'Menunggu'
                        : reg.status === 'CANCELLED'
                          ? 'Dibatalkan'
                          : reg.status}
                  </Badge>
                  {reg.event?.ticketType === 'PAID' && (
                    <span className="text-xs text-muted-foreground">
                      Rp {reg.event.ticketPrice.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
