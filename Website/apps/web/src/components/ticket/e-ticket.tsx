'use client';

import { useEffect, useRef, useState } from 'react';
import { toDataURL } from 'qrcode';
import { CalendarDays, MapPin, Download, Printer } from 'lucide-react';
import type { Registration } from '@/types/registration';

interface ETicketProps {
  registration: Registration;
}

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

export function ETicket({ registration }: ETicketProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (registration.qrCode) {
      toDataURL(registration.qrCode, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      }).then(setQrUrl).catch(() => setQrUrl(null));
    }
  }, [registration.qrCode]);

  const handleDownload = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `ticket-${registration.id}.png`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!registration.qrCode || registration.status !== 'CONFIRMED') {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Print-friendly ticket */}
      <div
        ref={ticketRef}
        className="border rounded-xl p-6 bg-white dark:bg-card print:shadow-none"
        id="e-ticket"
      >
        {/* Header */}
        <div className="text-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold">E-Ticket</h2>
          <p className="text-sm text-muted">RuangTemu</p>
        </div>

        {/* Event Info */}
        {registration.event && (
          <div className="space-y-2 mb-4">
            <h3 className="text-lg font-semibold">{registration.event.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted">
              <CalendarDays className="w-4 h-4" />
              <span>
                {formatDate(registration.event.eventDate)} · {formatTime(registration.event.eventDate)} WIB
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPin className="w-4 h-4" />
              <span>{registration.event.locationName}</span>
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="flex flex-col items-center py-4 border-t border-dashed">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="QR Code Tiket"
              className="w-48 h-48"
              width={200}
              height={200}
            />
          ) : (
            <div className="w-48 h-48 bg-muted/20 flex items-center justify-center rounded">
              <span className="text-sm text-muted">Generating QR...</span>
            </div>
          )}
          <p className="text-xs text-muted mt-2 font-mono">{registration.qrCode}</p>
        </div>

        {/* Registration Info */}
        <div className="border-t pt-4 mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted">ID Registrasi</p>
            <p className="font-mono text-xs">{registration.id}</p>
          </div>
          <div>
            <p className="text-muted">Status</p>
            <p className="font-medium text-green-600">Terkonfirmasi</p>
          </div>
          <div>
            <p className="text-muted">Tipe Tiket</p>
            <p className="font-medium">
              {registration.event?.ticketType === 'FREE' ? 'Gratis' : 'Berbayar'}
            </p>
          </div>
          <div>
            <p className="text-muted">Tanggal Daftar</p>
            <p className="font-medium">
              {new Date(registration.createdAt).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t mt-4 pt-4 text-center text-xs text-muted">
          <p>Tunjukkan QR code ini saat check-in di lokasi event.</p>
          <p className="mt-1">Jangan bagikan kode ini kepada orang lain.</p>
        </div>
      </div>

      {/* Action Buttons (hidden when printing) */}
      <div className="flex gap-3 print:hidden">
        <button
          onClick={handleDownload}
          className="flex-1 py-3 px-4 border rounded-lg font-medium hover:bg-muted/20 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download QR
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 py-3 px-4 border rounded-lg font-medium hover:bg-muted/20 transition-colors flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Cetak Tiket
        </button>
      </div>
    </div>
  );
}
