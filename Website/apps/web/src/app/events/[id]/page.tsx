'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Event, EventCategory, EventStatus } from '@/types/event';
import { getEvent, deleteEvent } from '@/lib/events-api';
import { registerForEvent } from '@/lib/registrations-api';
import { DEMO_EVENTS } from '@/lib/demo-events';
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowLeft,
  Ticket,
  Share2,
  Heart,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';

const categoryLabels: Record<EventCategory, string> = {
  TECHNOLOGY: 'Teknologi',
  BUSINESS: 'Bisnis',
  ART: 'Seni',
  SPORTS: 'Olahraga',
  MUSIC: 'Musik',
  FOOD: 'Makanan',
  HEALTH: 'Kesehatan',
  EDUCATION: 'Pendidikan',
  SOCIAL: 'Sosial',
  OTHER: 'Lainnya',
};

const statusLabels: Record<EventStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Aktif',
  CANCELLED: 'Dibatalkan',
  COMPLETED: 'Selesai',
};

const statusColors: Record<EventStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

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

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [registering, setRegistering] = useState(false);

  const isOwner = !!(user && event && event.organizerId === user.id);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteEvent(event!.id);
      router.push('/my-events');
    } catch {
      setError('Gagal menghapus event');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventId = params.id as string;
        const data = await getEvent(eventId);
        setEvent(data);
      } catch {
        // Fallback to demo data — map DemoEvent to Event shape
        const eventId = params.id as string;
        const demo = DEMO_EVENTS.find((e) => e.id === eventId);
        if (demo) {
          setEvent({
            id: demo.id,
            title: demo.title,
            description: '',
            category: 'OTHER' as EventCategory,
            coverImageUrl: null,
            locationName: demo.location,
            locationLat: null,
            locationLng: null,
            eventDate: new Date().toISOString(),
            eventEndDate: null,
            maxCapacity: 20,
            currentCount: 0,
            ticketType: demo.isFree ? 'FREE' : 'PAID',
            ticketPrice: 0,
            status: 'ACTIVE' as EventStatus,
            organizerId: '',
            organizer: { id: '', name: 'Demo', avatarUrl: null },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          setError('Event tidak ditemukan');
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

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

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Tidak Ditemukan</h1>
          <p className="text-muted mb-8">{error || 'Event yang Anda cari tidak tersedia.'}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-fg rounded-lg hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const spotsLeft = event.maxCapacity ? event.maxCapacity - event.currentCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
              {event.coverImageUrl ? (
                <img
                  src={event.coverImageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CalendarDays className="w-24 h-24 text-primary/30" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[event.status]}`}>
                  {statusLabels[event.status]}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/90 text-white">
                  {categoryLabels[event.category]}
                </span>
              </div>
            </div>

            {/* Title & Actions */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <div className="flex gap-2 shrink-0">
                {isOwner && (
                  <>
                    <Link href={`/events/${event.id}/edit`} className="p-2 rounded-lg border hover:bg-muted/20 transition-colors" title="Edit">
                      <Pencil className="w-5 h-5" />
                    </Link>
                    <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-lg border hover:bg-red-50 text-red-500 transition-colors" title="Hapus">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button className="p-2 rounded-lg border hover:bg-muted/20 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg border hover:bg-muted/20 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)}>
                <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl p-6 max-w-md mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-lg font-semibold">Hapus Event</h3>
                  <p className="text-muted">Yakin ingin menghapus &ldquo;{event.title}&rdquo;? Tindakan ini tidak dapat dibatalkan.</p>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-lg border hover:bg-muted/20 transition-colors text-sm">
                      Batal
                    </button>
                    <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm disabled:opacity-50">
                      {deleting ? 'Menghapus...' : 'Hapus'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Tentang Event</h2>
              <p className="text-muted leading-relaxed whitespace-pre-wrap">
                {event.description || 'Belum ada deskripsi.'}
              </p>
            </div>

            {/* Organizer */}
            {event.organizer && (
              <div className="border rounded-xl p-4">
                <h3 className="font-semibold mb-2">Diselenggarakan oleh</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {event.organizer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{event.organizer.name}</p>
                    {event.organizer.email && (
                      <p className="text-sm text-muted">{event.organizer.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="border rounded-xl p-6 space-y-4 sticky top-24">
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{formatDate(event.eventDate)}</p>
                  <p className="text-sm text-muted">
                    {formatTime(event.eventDate)}
                    {event.eventEndDate && ` - ${formatTime(event.eventEndDate)}`}
                    {' WIB'}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{event.locationName}</p>
                  {event.locationLat && event.locationLng && (
                    <a
                      href={`https://maps.google.com/?q=${event.locationLat},${event.locationLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Lihat di Google Maps
                    </a>
                  )}
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">
                    {event.maxCapacity
                      ? `${event.currentCount} / ${event.maxCapacity} peserta`
                      : `${event.currentCount} peserta`}
                  </p>
                  {spotsLeft !== null && (
                    <p className={`text-sm ${isFull ? 'text-red-500' : 'text-muted'}`}>
                      {isFull ? 'Event sudah penuh' : `${spotsLeft} spot tersisa`}
                    </p>
                  )}
                </div>
              </div>

              {/* Ticket Type */}
              <div className="flex items-start gap-3">
                <Ticket className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">
                    {event.ticketType === 'FREE' ? 'Gratis' : `Rp ${event.ticketPrice.toLocaleString('id-ID')}`}
                  </p>
                  <p className="text-sm text-muted">
                    {event.ticketType === 'FREE' ? 'Event gratis untuk semua' : 'Tiket berbayar'}
                  </p>
                </div>
              </div>

              {/* Register Button */}
              <button
                disabled={isFull || event.status !== 'ACTIVE' || registering || isOwner}
                onClick={async () => {
                  if (!user) {
                    router.push('/login');
                    return;
                  }
                  setRegistering(true);
                  try {
                    const reg = await registerForEvent(event.id);
                    router.push(`/my-tickets/${reg.id}`);
                  } catch (err) {
                    alert(err instanceof Error ? err.message : 'Gagal mendaftar');
                  } finally {
                    setRegistering(false);
                  }
                }}
                className="w-full py-3 px-6 bg-primary text-primary-fg rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFull
                  ? 'Event Penuh'
                  : event.status !== 'ACTIVE'
                    ? 'Event Tidak Tersedia'
                    : isOwner
                      ? 'Event Anda'
                      : registering
                        ? 'Mendaftar...'
                        : 'Daftar Sekarang'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
