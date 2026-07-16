import { Injectable, Logger } from '@nestjs/common';

/**
 * Email service for sending ticket confirmations.
 * In production, integrate with SendGrid, AWS SES, or similar.
 * For MVP, this logs the email content to console.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendTicketConfirmation(params: {
    to: string;
    userName: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    qrCode: string;
    registrationId: string;
  }) {
    // In production: send actual email via SMTP/API
    this.logger.log(`📧 Sending ticket confirmation email to ${params.to}`);
    this.logger.log(`   Event: ${params.eventTitle}`);
    this.logger.log(`   Date: ${params.eventDate}`);
    this.logger.log(`   Location: ${params.eventLocation}`);
    this.logger.log(`   QR Code: ${params.qrCode}`);
    this.logger.log(`   Registration: ${params.registrationId}`);

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return { success: true, messageId: `mock-${Date.now()}` };
  }

  async sendPaymentReminder(params: {
    to: string;
    userName: string;
    eventTitle: string;
    heldUntil: string;
    paymentUrl?: string;
  }) {
    this.logger.log(`📧 Sending payment reminder to ${params.to}`);
    this.logger.log(`   Event: ${params.eventTitle}`);
    this.logger.log(`   Deadline: ${params.heldUntil}`);

    await new Promise((resolve) => setTimeout(resolve, 100));

    return { success: true, messageId: `mock-${Date.now()}` };
  }

  async sendRegistrationCancelled(params: {
    to: string;
    userName: string;
    eventTitle: string;
    reason: string;
  }) {
    this.logger.log(`📧 Sending cancellation email to ${params.to}`);
    this.logger.log(`   Event: ${params.eventTitle}`);
    this.logger.log(`   Reason: ${params.reason}`);

    await new Promise((resolve) => setTimeout(resolve, 100));

    return { success: true, messageId: `mock-${Date.now()}` };
  }
}
