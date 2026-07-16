export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  qrCode: string | null;
  heldUntil: string | null;
  checkedInAt: string | null;
  createdAt: string;
  updatedAt: string;
  event?: {
    id: string;
    title: string;
    coverImageUrl: string | null;
    locationName: string;
    eventDate: string;
    eventEndDate: string | null;
    ticketType: 'FREE' | 'PAID';
    ticketPrice: number;
    status: string;
  };
  payment?: Payment | null;
}

export interface Payment {
  id: string;
  registrationId: string;
  amount: number;
  platformFee: number;
  method: 'MIDTRANS' | 'MANUAL';
  externalId: string | null;
  snapToken: string | null;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}
