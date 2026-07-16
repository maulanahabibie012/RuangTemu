import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { QueryEventsDto } from './dto/query-events.dto.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(organizerId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        organizerId,
        title: dto.title,
        description: dto.description,
        category: dto.category ?? 'OTHER',
        coverImageUrl: dto.coverImageUrl,
        locationName: dto.locationName,
        locationLat: dto.locationLat,
        locationLng: dto.locationLng,
        eventDate: new Date(dto.eventDate),
        eventEndDate: dto.eventEndDate ? new Date(dto.eventEndDate) : null,
        maxCapacity: dto.maxCapacity,
        ticketType: dto.ticketType ?? 'FREE',
        ticketPrice: dto.ticketPrice ?? 0,
        status: 'ACTIVE',
      },
      include: { organizer: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async findAll(query: QueryEventsDto) {
    const page = parseInt(query.page ?? '1', 10);
    const limit = Math.min(parseInt(query.limit ?? '12', 10), 50);
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {
      status: 'ACTIVE',
    };

    if (query.keyword) {
      where.OR = [
        { title: { contains: query.keyword, mode: 'insensitive' } },
        { description: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.city) {
      where.locationName = { contains: query.city, mode: 'insensitive' };
    }

    if (query.ticketType) {
      where.ticketType = query.ticketType;
    }

    if (query.dateFrom || query.dateTo) {
      where.eventDate = {};
      if (query.dateFrom) where.eventDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.eventDate.lte = new Date(query.dateTo);
    }

    let orderBy: Prisma.EventOrderByWithRelationInput = { eventDate: 'asc' };
    switch (query.sort) {
      case 'date_desc':
        orderBy = { eventDate: 'desc' };
        break;
      case 'price_asc':
        orderBy = { ticketPrice: 'asc' };
        break;
      case 'price_desc':
        orderBy = { ticketPrice: 'desc' };
        break;
      case 'popular':
        orderBy = { currentCount: 'desc' };
        break;
    }

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { organizer: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPopular() {
    return this.prisma.event.findMany({
      where: { status: 'ACTIVE', eventDate: { gte: new Date() } },
      orderBy: { currentCount: 'desc' },
      take: 8,
      include: { organizer: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { organizer: { select: { id: true, name: true, avatarUrl: true, email: true } } },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== userId) throw new ForbiddenException('Not your event');

    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        eventEndDate: dto.eventEndDate ? new Date(dto.eventEndDate) : undefined,
      },
      include: { organizer: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== userId) throw new ForbiddenException('Not your event');

    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event deleted' };
  }

  async findByOrganizer(organizerId: string) {
    return this.prisma.event.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' },
      include: { organizer: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
  // ponytail: app-level Haversine; upgrade to PostGIS extension when > 10k events
  async findNearby(lat: number, lng: number, radiusKm = 25) {
    const events: Array<{
      locationLat: number | null;
      locationLng: number | null;
      [key: string]: unknown;
    }> = await this.prisma.event.findMany({
      where: {
        status: 'ACTIVE',
        eventDate: { gte: new Date() },
        locationLat: { not: null },
        locationLng: { not: null },
      },
      include: {
        organizer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    const R = 6371;
    return events
      .map((e) => {
        const eLat = e.locationLat as number;
        const eLng = e.locationLng as number;
        const dLat = ((eLat - lat) * Math.PI) / 180;
        const dLng = ((eLng - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((eLat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return { ...e, distanceKm: Math.round(dist * 10) / 10 };
      })
      .filter((e) => e.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }
  /* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
}
