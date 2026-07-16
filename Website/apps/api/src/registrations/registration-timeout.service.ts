import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * Checks for expired PENDING registrations every minute and cancels them.
 * In production, replace this with BullMQ delayed jobs for more precision.
 * This cron-style approach works for MVP without requiring Redis.
 */
@Injectable()
export class RegistrationTimeoutService implements OnModuleInit {
  private readonly logger = new Logger(RegistrationTimeoutService.name);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    // Check every 60 seconds for expired registrations
    this.intervalId = setInterval(() => {
      this.cancelExpiredRegistrations().catch((err) => {
        this.logger.error('Error cancelling expired registrations', err);
      });
    }, 60_000);

    this.logger.log('Registration timeout checker started (60s interval)');
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async cancelExpiredRegistrations() {
    const now = new Date();

    // Find all PENDING registrations past their heldUntil time
    const expired = await this.prisma.registration.findMany({
      where: {
        status: 'PENDING',
        heldUntil: { lt: now },
      },
    });

    if (expired.length === 0) return;

    this.logger.log(`Found ${expired.length} expired registration(s), cancelling...`);

    for (const reg of expired) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.registration.update({
            where: { id: reg.id },
            data: { status: 'EXPIRED', paymentStatus: 'FAILED' },
          });

          await tx.event.update({
            where: { id: reg.eventId },
            data: { currentCount: { decrement: 1 } },
          });
        });

        this.logger.log(`Cancelled expired registration ${reg.id}`);
      } catch (err) {
        this.logger.error(`Failed to cancel registration ${reg.id}`, err);
      }
    }
  }
}
