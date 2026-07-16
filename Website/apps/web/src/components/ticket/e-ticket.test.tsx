import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ETicket } from './e-ticket';
import type { Registration } from '@/types/registration';

// Mock qrcode
vi.mock('qrcode', () => ({
  toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockqr'),
}));

const mockRegistration: Registration = {
  id: 'reg-1',
  userId: 'user-1',
  eventId: 'event-1',
  status: 'CONFIRMED',
  paymentStatus: 'PAID',
  qrCode: 'RT-abc123',
  heldUntil: null,
  checkedInAt: null,
  createdAt: '2026-07-10T10:00:00.000Z',
  updatedAt: '2026-07-10T10:00:00.000Z',
  event: {
    id: 'event-1',
    title: 'Tech Meetup Jakarta',
    coverImageUrl: null,
    locationName: 'Jakarta Convention Center',
    eventDate: '2026-08-01T09:00:00.000Z',
    eventEndDate: '2026-08-01T17:00:00.000Z',
    ticketType: 'FREE',
    ticketPrice: 0,
    status: 'ACTIVE',
  },
};

describe('ETicket', () => {
  it('renders ticket with event info and QR code section', () => {
    render(<ETicket registration={mockRegistration} />);

    expect(screen.getByText('E-Ticket')).toBeInTheDocument();
    expect(screen.getByText('Tech Meetup Jakarta')).toBeInTheDocument();
    expect(screen.getByText('Jakarta Convention Center')).toBeInTheDocument();
    expect(screen.getByText('RT-abc123')).toBeInTheDocument();
    expect(screen.getByText('Terkonfirmasi')).toBeInTheDocument();
  });

  it('renders download and print buttons', () => {
    render(<ETicket registration={mockRegistration} />);

    expect(screen.getByText('Download QR')).toBeInTheDocument();
    expect(screen.getByText('Cetak Tiket')).toBeInTheDocument();
  });

  it('shows free ticket type label', () => {
    render(<ETicket registration={mockRegistration} />);
    expect(screen.getByText('Gratis')).toBeInTheDocument();
  });

  it('renders null if status is not CONFIRMED', () => {
    const pending: Registration = { ...mockRegistration, status: 'PENDING' };
    const { container } = render(<ETicket registration={pending} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders null if no qrCode', () => {
    const noQr: Registration = { ...mockRegistration, qrCode: null };
    const { container } = render(<ETicket registration={noQr} />);
    expect(container.innerHTML).toBe('');
  });
});
