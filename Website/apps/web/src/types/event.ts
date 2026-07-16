export interface EventOrganizer {
  id: string;
  name: string;
  avatarUrl: string | null;
  email?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  coverImageUrl: string | null;
  locationName: string;
  locationLat: number | null;
  locationLng: number | null;
  eventDate: string;
  eventEndDate: string | null;
  maxCapacity: number | null;
  currentCount: number;
  ticketType: TicketType;
  ticketPrice: number;
  status: EventStatus;
  organizerId: string;
  organizer: EventOrganizer;
  createdAt: string;
  updatedAt: string;
}

export type EventCategory =
  | 'MUSIC'
  | 'SPORTS'
  | 'EDUCATION'
  | 'TECHNOLOGY'
  | 'ART'
  | 'FOOD'
  | 'BUSINESS'
  | 'HEALTH'
  | 'SOCIAL'
  | 'OTHER';

export type TicketType = 'FREE' | 'PAID';

export type EventStatus = 'DRAFT' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED';

export interface EventsResponse {
  data: Event[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EventQueryParams {
  keyword?: string;
  category?: EventCategory;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  ticketType?: TicketType;
  sort?: 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc' | 'popular';
  page?: string;
  limit?: string;
}