import type { Registration, Payment } from '@/types/registration';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
}

export async function registerForEvent(eventId: string): Promise<Registration> {
  return fetchWithAuth(`${API_URL}/api/registrations`, {
    method: 'POST',
    body: JSON.stringify({ eventId }),
  });
}

export async function getMyRegistrations(): Promise<Registration[]> {
  return fetchWithAuth(`${API_URL}/api/registrations/me`);
}

export async function getRegistrationById(id: string): Promise<Registration> {
  return fetchWithAuth(`${API_URL}/api/registrations/${id}`);
}

export async function cancelRegistration(id: string): Promise<Registration> {
  return fetchWithAuth(`${API_URL}/api/registrations/${id}/cancel`, {
    method: 'POST',
  });
}

export async function createPayment(registrationId: string): Promise<Payment> {
  return fetchWithAuth(`${API_URL}/api/payments/create`, {
    method: 'POST',
    body: JSON.stringify({ registrationId }),
  });
}

export async function simulatePayment(registrationId: string): Promise<{ status: string }> {
  return fetchWithAuth(`${API_URL}/api/payments/simulate/${registrationId}`, {
    method: 'POST',
  });
}
