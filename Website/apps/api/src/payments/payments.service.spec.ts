/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion */
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegistrationsService } from '../registrations/registrations.service.js';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  const mockPrisma = {
    registration: { findUnique: jest.fn() },
    payment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    event: { findUnique: jest.fn() },
  };

  const mockRegistrationsService = {
    confirmPayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RegistrationsService, useValue: mockRegistrationsService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    const userId = 'user-1';
    const dto = { registrationId: 'reg-1' };

    it('should throw NotFoundException if registration not found', async () => {
      prisma.registration.findUnique.mockResolvedValue(null);
      await expect(service.createPayment(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if not owner', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        userId: 'other-user',
        status: 'PENDING',
        event: { ticketType: 'PAID', ticketPrice: 50000 },
      });
      await expect(service.createPayment(userId, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if not pending', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        userId,
        status: 'CONFIRMED',
        event: { ticketType: 'PAID', ticketPrice: 50000 },
      });
      await expect(service.createPayment(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if event is free', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        userId,
        status: 'PENDING',
        event: { ticketType: 'FREE', ticketPrice: 0 },
      });
      await expect(service.createPayment(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create payment with snap token for paid event', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        userId,
        status: 'PENDING',
        event: { ticketType: 'PAID', ticketPrice: 50000 },
      });
      prisma.payment.findUnique.mockResolvedValue(null);
      const mockPayment = {
        id: 'pay-1',
        registrationId: 'reg-1',
        amount: 50000,
        platformFee: 2500,
        snapToken: 'snap-uuid',
        status: 'PENDING',
      };
      prisma.payment.create.mockResolvedValue(mockPayment);

      const result = await service.createPayment(userId, dto);
      expect(result.amount).toBe(50000);
      expect(result.platformFee).toBe(2500);
      expect(result.status).toBe('PENDING');
    });
  });

  describe('handleWebhook', () => {
    it('should throw NotFoundException if payment not found', async () => {
      prisma.payment.findFirst.mockResolvedValue(null);
      await expect(
        service.handleWebhook({
          order_id: 'ORDER-123',
          transaction_status: 'settlement',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should confirm payment on settlement', async () => {
      prisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        registrationId: 'reg-1',
      });
      prisma.payment.update.mockResolvedValue({});
      mockRegistrationsService.confirmPayment.mockResolvedValue({});

      const result = await service.handleWebhook({
        order_id: 'ORDER-123',
        transaction_status: 'settlement',
      });
      expect(result).toEqual({ status: 'ok' });
      expect(prisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pay-1' },
          data: expect.objectContaining({ status: 'PAID' }),
        }),
      );
      expect(mockRegistrationsService.confirmPayment).toHaveBeenCalledWith(
        'reg-1',
      );
    });

    it('should mark payment as failed on cancel', async () => {
      prisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        registrationId: 'reg-1',
      });
      prisma.payment.update.mockResolvedValue({});

      const result = await service.handleWebhook({
        order_id: 'ORDER-123',
        transaction_status: 'cancel',
      });
      expect(result).toEqual({ status: 'ok' });
      expect(prisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'FAILED' }),
        }),
      );
    });

    it('should mark payment as failed on expire', async () => {
      prisma.payment.findFirst.mockResolvedValue({
        id: 'pay-1',
        registrationId: 'reg-1',
      });
      prisma.payment.update.mockResolvedValue({});

      const result = await service.handleWebhook({
        order_id: 'ORDER-123',
        transaction_status: 'expire',
      });
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('simulatePayment', () => {
    it('should throw NotFoundException if registration not found', async () => {
      prisma.registration.findUnique.mockResolvedValue(null);
      await expect(
        service.simulatePayment('user-1', 'reg-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        userId: 'other-user',
        eventId: 'event-1',
      });
      await expect(
        service.simulatePayment('user-1', 'reg-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should simulate payment and confirm registration', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        userId: 'user-1',
        eventId: 'event-1',
      });
      prisma.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        registrationId: 'reg-1',
      });
      prisma.payment.update.mockResolvedValue({});
      mockRegistrationsService.confirmPayment.mockResolvedValue({});

      const result = await service.simulatePayment('user-1', 'reg-1');
      expect(result).toEqual({ status: 'paid' });
      expect(mockRegistrationsService.confirmPayment).toHaveBeenCalledWith(
        'reg-1',
      );
    });
  });
});
