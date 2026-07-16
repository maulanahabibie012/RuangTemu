import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRegistrationDto } from './dto/create-registration.dto.js';
import { randomUUID } from 'crypto';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  async register(userId: string, dto: CreateRegistrationDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'ACTIVE') {
      throw new BadRequestException('Event is not active');
    }

    if (event.currentCount >= event.maxCapacity) {
      throw new BadRequestException('Event is full');
    }

    if (event.organizerId === userId) {
      throw new BadRequestException('Organizer cannot register for own event');
    }

    // Check if user already registered
    const existing = await this.prisma.registration.findUnique({
      where: { userId_eventId: { userId, eventId: dto.eventId } },
    });

    if (existing && existing.status !== 'CANCELLED') {
      throw new ConflictException('Already registered for this event');
    }

    // For FREE events: confirm immediately
    if (event.ticketType === 'FREE') {
      const qrCode = `RT-${randomUUID()}`;

      const registration = await this.prisma.$transaction(async (tx) => {
        const reg = existing
          ? await tx.registration.update({
              where: { id: existing.id },
              data: {
                status: 'CONFIRMED',
                paymentStatus: 'PAID',
                qrCode,
              },
            })
          : await tx.registration.create({
              data: {
                userId,
                eventId: dto.eventId,
                status: 'CONFIRMED',
                paymentStatus: 'PAID',
                qrCode,
              },
            });

        await tx.event.update({
          where: { id: dto.eventId },
          data: { currentCount: { increment: 1 } },
        });

        return reg;
      });

      return registration;
    }

    // For PAID events: hold seat for 15 minutes
    const heldUntil = new Date(Date.now() + 15 * 60 * 1000);

    const registration = await this.prisma.$transaction(async (tx) => {
      const reg = existing
        ? await tx.registration.update({
            where: { id: existing.id },
            data: {
              status: 'PENDING',
              paymentStatus: 'UNPAID',
              heldUntil,
              qrCode: null,
            },
          })
        : await tx.registration.create({
            data: {
              userId,
              eventId: dto.eventId,
              status: 'PENDING',
              paymentStatus: 'UNPAID',
              heldUntil,
            },
          });

      await tx.event.update({
        where: { id: dto.eventId },
        data: { currentCount: { increment: 1 } },
      });

      return reg;
    });

    return registration;
  }

  async getMyRegistrations(userId: string) {
    return this.prisma.registration.findMany({
      where: { userId, status: { not: 'CANCELLED' } },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            coverImageUrl: true,
            locationName: true,
            eventDate: true,
            eventEndDate: true,
            ticketType: true,
            ticketPrice: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRegistrationById(id: string, userId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            coverImageUrl: true,
            locationName: true,
            locationLat: true,
            locationLng: true,
            eventDate: true,
            eventEndDate: true,
            ticketType: true,
            ticketPrice: true,
            status: true,
            organizer: {
              select: { id: true, name: true },
            },
          },
        },
        payment: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.userId !== userId) {
      throw new ForbiddenException('Not your registration');
    }

    return registration;
  }

  async cancelRegistration(id: string, userId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.userId !== userId) {
      throw new ForbiddenException('Not your registration');
    }

    if (registration.status === 'CANCELLED') {
      throw new BadRequestException('Registration already cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.registration.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      await tx.event.update({
        where: { id: registration.eventId },
        data: { currentCount: { decrement: 1 } },
      });

      return updated;
    });
  }

  async confirmPayment(registrationId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status !== 'PENDING') {
      throw new BadRequestException('Registration is not pending');
    }

    const qrCode = `RT-${randomUUID()}`;

    return this.prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        qrCode,
      },
    });
  }
}
