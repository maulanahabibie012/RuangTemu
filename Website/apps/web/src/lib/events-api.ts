import { api } from './api';
import type { Event, EventsResponse, EventQueryParams } from '../types/event';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Server-side fetch (no auth needed for public endpoints)
async function serverFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}

// Public endpoints — used in Server Components
export async function getEvents(params?: EventQueryParams): Promise<EventsResponse> {
  const sp = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
  }
  const qs = sp.toString();
  return serverFetch<EventsResponse>(`/events${qs ? `?${qs}` : ''}`);
}

export async function getPopularEvents(): Promise<Event[]> {
  return serverFetch<Event[]>('/events/popular');
}

export async function getEvent(id: string): Promise<Event> {
  return serverFetch<Event>(`/events/${id}`);
}

export async function getOrganizerEvents(organizerId: string): Promise<Event[]> {
  return serverFetch<Event[]>(`/events/organizer/${organizerId}`);
}

// Client-side (authenticated) endpoints
export async function createEvent(data: Record<string, unknown>) {
  return api.post<Event>('/events', data).then((r) => r.data);
}

export async function updateEvent(id: string, data: Record<string, unknown>) {
  return api.patch<Event>(`/events/${id}`, data).then((r) => r.data);
}

export async function deleteEvent(id: string) {
  return api.delete(`/events/${id}`).then((r) => r.data);
}

// Client-side fetch for search page (no auth needed)
export async function fetchEventsClient(params: Record<string, string>): Promise<EventsResponse> {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) sp.set(k, v);
  });
  const qs = sp.toString();
  const res = await fetch(`${API_URL}/events${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<EventsResponse>;
}
