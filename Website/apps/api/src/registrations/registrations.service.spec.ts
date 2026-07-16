/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion */
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsService } from './registrations.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

describe('RegistrationsService', () => {
  let service: RegistrationsService;
  let prisma: any;

  const mockPrisma = {
    event: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    registration: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RegistrationsService>(RegistrationsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const userId = 'user-1';
    const dto = { eventId: 'event-1' };

    it('should throw NotFoundException if event not found', async () => {
      prisma.event.findUnique.mockResolvedValue(null);
      await expect(service.register(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if event is not active', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        status: 'DRAFT',
        currentCount: 0,
        maxCapacity: 100,
        organizerId: 'other-user',
        ticketType: 'FREE',
      });
      await expect(service.register(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if event is full', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        status: 'ACTIVE',
        currentCount: 100,
        maxCapacity: 100,
        organizerId: 'other-user',
        ticketType: 'FREE',
      });
      await expect(service.register(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if organizer registers for own event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        status: 'ACTIVE',
        currentCount: 0,
        maxCapacity: 100,
        organizerId: userId,
        ticketType: 'FREE',
      });
      await expect(service.register(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if already registered', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        status: 'ACTIVE',
        currentCount: 0,
        maxCapacity: 100,
        organizerId: 'other-user',
        ticketType: 'FREE',
      });
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        status: 'CONFIRMED',
      });
      await expect(service.register(userId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should register free event and confirm immediately', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        status: 'ACTIVE',
        currentCount: 0,
        maxCapacity: 100,
        organizerId: 'other-user',
        ticketType: 'FREE',
      });
      prisma.registration.findUnique.mockResolvedValue(null);
      const mockReg = {
        id: 'reg-1',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        qrCode: 'RT-uuid',
      };
      prisma.$transaction.mockImplementation(async (fn: any) => {
        return fn({
          registration: { create: jest.fn().mockResolvedValue(mockReg) },
          event: { update: jest.fn() },
        });
      });

      const result = await service.register(userId, dto);
      expect(result).toEqual(mockReg);
    });

    it('should register paid event with PENDING status and heldUntil', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        status: 'ACTIVE',
        currentCount: 0,
        maxCapacity: 100,
        organizerId: 'other-user',
        ticketType: 'PAID',
        ticketPrice: 50000,
      });
      prisma.registration.findUnique.mockResolvedValue(null);
      const mockReg = {
        id: 'reg-1',
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        heldUntil: new Date(Date.now() + 15 * 60 * 1000),
      };
      prisma.$transaction.mockImplementation(async (fn: any) => {
        return fn({
          registration: { create: jest.fn().mockResolvedValue(mockReg) },
          event: { update: jest.fn() },
        });
      });

      const result = await service.register(userId, dto);
      expect(result.status).toBe('PENDING');
      expect(result.paymentStatus).toBe('UNPAID');
    });
  });

  describe('getMyRegistrations', () => {
    it('should return user registrations excluding cancelled', async () => {
      const mockRegs = [
        { id: 'reg-1', status: 'CONFIRMED', event: { title: 'Event 1' } },
      ];
      prisma.registration.findMany.mockResolvedValue(mockRegs);

      const result = await service.getMyRegistrations('user-1');
      expect(result).toEqual(mockRegs);
      expect(prisma.registration.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', status: { not: 'CANCELLED' } },
        }),
      );
    });
  });

  describe('getRegistrationById', () => {
    it('should throw NotFoundException if registration not found', async () => {
      prisma.registration.findUnique.mockResolvedValue(null);
      await expect(
        service.getRegistrationById('reg-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        userId: 'other-user',
      });
      await expect(
        service.getRegistrationById('reg-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return registration if owner', async () => {
      const mockReg = {
        id: 'reg-1',
        userId: 'user-1',
        event: { title: 'Test' },
        payment: null,
      };
      prisma.registration.findUnique.mockResolvedValue(mockReg);

      const result = await service.getRegistrationById('reg-1', 'user-1');
      expect(result).toEqual(mockReg);
    });
  });

  describe('cancelRegistration', () => {
    it('should throw NotFoundException if registration not found', async () => {
      prisma.registration.findUnique.mockResolvedValue(null);
      await expect(
        service.cancelRegistration('reg-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        userId: 'other-user',
        status: 'CONFIRMED',
        eventId: 'event-1',
      });
      await expect(
        service.cancelRegistration('reg-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if already cancelled', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        userId: 'user-1',
        status: 'CANCELLED',
        eventId: 'event-1',
      });
      await expect(
        service.cancelRegistration('reg-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should cancel registration and decrement count', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        userId: 'user-1',
        status: 'CONFIRMED',
        eventId: 'event-1',
      });
      const mockUpdated = { id: 'reg-1', status: 'CANCELLED' };
      prisma.$transaction.mockImplementation(async (fn: any) => {
        return fn({
          registration: { update: jest.fn().mockResolvedValue(mockUpdated) },
          event: { update: jest.fn() },
        });
      });

      const result = await service.cancelRegistration('reg-1', 'user-1');
      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('confirmPayment', () => {
    it('should throw NotFoundException if registration not found', async () => {
      prisma.registration.findUnique.mockResolvedValue(null);
      await expect(service.confirmPayment('reg-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if not pending', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        status: 'CONFIRMED',
      });
      await expect(service.confirmPayment('reg-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should confirm registration and generate QR code', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        status: 'PENDING',
      });
      const mockConfirmed = {
        id: 'reg-1',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        qrCode: 'RT-uuid',
      };
      prisma.registration.update.mockResolvedValue(mockConfirmed);

      const result = await service.confirmPayment('reg-1');
      expect(result.status).toBe('CONFIRMED');
      expect(result.qrCode).toContain('RT-');
    });
  });
});
