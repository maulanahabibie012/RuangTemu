import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegistrationsService } from '../registrations/registrations.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private registrationsService: RegistrationsService,
  ) {}

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: dto.registrationId },
      include: { event: true },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.userId !== userId) {
      throw new ForbiddenException('Not your registration');
    }

    if (registration.status !== 'PENDING') {
      throw new BadRequestException('Registration is not pending payment');
    }

    if (registration.event.ticketType !== 'PAID') {
      throw new BadRequestException('Event is free, no payment needed');
    }

    // Check if payment already exists
    const existingPayment = await this.prisma.payment.findUnique({
      where: { registrationId: dto.registrationId },
    });

    if (existingPayment && existingPayment.status === 'PAID') {
      throw new BadRequestException('Payment already completed');
    }

    // For demo: simulate Midtrans snap token generation
    const externalId = `ORDER-${randomUUID()}`;
    const snapToken = `snap-${randomUUID()}`;
    const amount = registration.event.ticketPrice;
    const platformFee = Math.round(amount * 0.05); // 5% platform fee

    if (existingPayment) {
      return this.prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          amount,
          platformFee,
          externalId,
          snapToken,
          status: 'PENDING',
        },
      });
    }

    return this.prisma.payment.create({
      data: {
        registrationId: dto.registrationId,
        amount,
        platformFee,
        method: 'MIDTRANS',
        externalId,
        snapToken,
        status: 'PENDING',
      },
    });
  }

  async handleWebhook(body: {
    order_id: string;
    transaction_status: string;
    fraud_status?: string;
  }) {
    const payment = await this.prisma.payment.findFirst({
      where: { externalId: body.order_id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const { transaction_status, fraud_status } = body;

    // Midtrans transaction status handling
    if (
      transaction_status === 'capture' ||
      transaction_status === 'settlement'
    ) {
      if (fraud_status === 'accept' || !fraud_status) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'PAID', paidAt: new Date() },
        });

        await this.registrationsService.confirmPayment(payment.registrationId);
      }
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire'
    ) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }

    return { status: 'ok' };
  }

  async simulatePayment(userId: string, registrationId: string) {
    // For demo/sandbox: instantly confirm payment
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.userId !== userId) {
      throw new ForbiddenException('Not your registration');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { registrationId },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID', paidAt: new Date() },
      });
    } else {
      const event = await this.prisma.event.findUnique({
        where: { id: registration.eventId },
      });

      await this.prisma.payment.create({
        data: {
          registrationId,
          amount: event?.ticketPrice || 0,
          platformFee: Math.round((event?.ticketPrice || 0) * 0.05),
          method: 'MIDTRANS',
          externalId: `ORDER-${randomUUID()}`,
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }

    await this.registrationsService.confirmPayment(registrationId);

    return { status: 'paid' };
  }
}
