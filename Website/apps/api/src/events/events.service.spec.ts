/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion */
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventsService } from './events.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockEvent = {
  id: 'evt-1',
  organizerId: 'user-1',
  title: 'Test Event',
  description: 'Desc',
  category: 'TECHNOLOGY',
  coverImageUrl: null,
  locationName: 'Jakarta',
  locationLat: -6.2,
  locationLng: 106.8,
  eventDate: new Date('2026-08-01'),
  eventEndDate: null,
  maxCapacity: 50,
  currentCount: 10,
  ticketType: 'FREE',
  ticketPrice: 0,
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
  organizer: { id: 'user-1', name: 'Org', avatarUrl: null },
};

const mockPrisma = {
  event: {
    create: jest.fn<any>().mockResolvedValue(mockEvent),
    findMany: jest.fn<any>().mockResolvedValue([mockEvent]),
    findUnique: jest.fn<any>().mockResolvedValue(mockEvent),
    count: jest.fn<any>().mockResolvedValue(1),
    update: jest.fn<any>().mockResolvedValue(mockEvent),
    delete: jest.fn<any>().mockResolvedValue(mockEvent),
  },
};

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create event', async () => {
      const dto = {
        title: 'Test Event',
        description: 'Desc',
        locationName: 'Jakarta',
        eventDate: '2026-08-01',
        maxCapacity: 50,
      };
      const result = await service.create('user-1', dto as any);
      expect(result).toEqual(mockEvent);
      expect(mockPrisma.event.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      const result = await service.findAll({});
      expect(result.data).toEqual([mockEvent]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 12,
        total: 1,
        totalPages: 1,
      });
    });

    it('should filter by keyword', async () => {
      await service.findAll({ keyword: 'test' });
      const call = (mockPrisma.event.findMany as any).mock.calls[0][0];
      expect(call.where.OR).toBeDefined();
    });

    it('should filter by category', async () => {
      await service.findAll({ category: 'MUSIC' } as any);
      const call = (mockPrisma.event.findMany as any).mock.calls[0][0];
      expect(call.where.category).toBe('MUSIC');
    });

    it('should limit max 50', async () => {
      await service.findAll({ limit: '999' });
      const call = (mockPrisma.event.findMany as any).mock.calls[0][0];
      expect(call.take).toBe(50);
    });
  });

  describe('findPopular', () => {
    it('should return popular events', async () => {
      const result = await service.findPopular();
      expect(result).toEqual([mockEvent]);
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { currentCount: 'desc' },
          take: 8,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return event by id', async () => {
      const result = await service.findOne('evt-1');
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if not found', async () => {
      (mockPrisma.event.findUnique as any).mockResolvedValueOnce(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update own event', async () => {
      const result = await service.update('evt-1', 'user-1', {
        title: 'Updated',
      } as any);
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if event missing', async () => {
      (mockPrisma.event.findUnique as any).mockResolvedValueOnce(null);
      await expect(
        service.update('bad', 'user-1', {} as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      await expect(
        service.update('evt-1', 'other-user', {} as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete own event', async () => {
      const result = await service.remove('evt-1', 'user-1');
      expect(result).toEqual({ message: 'Event deleted' });
    });

    it('should throw ForbiddenException if not owner', async () => {
      await expect(
        service.remove('evt-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findByOrganizer', () => {
    it('should return organizer events', async () => {
      const result = await service.findByOrganizer('user-1');
      expect(result).toEqual([mockEvent]);
    });
  });

  describe('findNearby', () => {
    it('should filter by distance', async () => {
      (mockPrisma.event.findMany as any).mockResolvedValueOnce([
        { ...mockEvent, locationLat: -6.2, locationLng: 106.8 },
        { ...mockEvent, id: 'far', locationLat: 0, locationLng: 0 },
      ]);
      const result = await service.findNearby(-6.2, 106.8, 10);
      expect(result.length).toBe(1);
      expect(result[0].distanceKm).toBeLessThanOrEqual(10);
    });
  });
});