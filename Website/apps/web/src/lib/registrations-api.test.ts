import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  registerForEvent,
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration,
  createPayment,
  simulatePayment,
} from './registrations-api';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn().mockReturnValue('test-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('registrations-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-token');
  });

  describe('registerForEvent', () => {
    it('should POST to /api/registrations with eventId', async () => {
      const mockReg = { id: 'reg-1', status: 'CONFIRMED' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockReg),
      });

      const result = await registerForEvent('event-1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/registrations'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ eventId: 'event-1' }),
        }),
      );
      expect(result).toEqual(mockReg);
    });
  });

  describe('getMyRegistrations', () => {
    it('should GET /api/registrations/me', async () => {
      const mockRegs = [{ id: 'reg-1' }, { id: 'reg-2' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRegs),
      });

      const result = await getMyRegistrations();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/registrations/me'),
        expect.any(Object),
      );
      expect(result).toEqual(mockRegs);
    });
  });

  describe('getRegistrationById', () => {
    it('should GET /api/registrations/:id', async () => {
      const mockReg = { id: 'reg-1', qrCode: 'RT-abc' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockReg),
      });

      const result = await getRegistrationById('reg-1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/registrations/reg-1'),
        expect.any(Object),
      );
      expect(result).toEqual(mockReg);
    });
  });

  describe('cancelRegistration', () => {
    it('should POST /api/registrations/:id/cancel', async () => {
      const mockResult = { id: 'reg-1', status: 'CANCELLED' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await cancelRegistration('reg-1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/registrations/reg-1/cancel'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('createPayment', () => {
    it('should POST /api/payments/create with registrationId', async () => {
      const mockPayment = { id: 'pay-1', snapToken: 'snap-123' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPayment),
      });

      const result = await createPayment('reg-1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/payments/create'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ registrationId: 'reg-1' }),
        }),
      );
      expect(result).toEqual(mockPayment);
    });
  });

  describe('simulatePayment', () => {
    it('should POST /api/payments/simulate/:registrationId', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'paid' }),
      });

      const result = await simulatePayment('reg-1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/payments/simulate/reg-1'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result).toEqual({ status: 'paid' });
    });
  });

  describe('error handling', () => {
    it('should throw error when response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Registration not found' }),
      });

      await expect(getRegistrationById('invalid')).rejects.toThrow(
        'Registration not found',
      );
    });

    it('should include Authorization header when token exists', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await getMyRegistrations();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });
  });
});
