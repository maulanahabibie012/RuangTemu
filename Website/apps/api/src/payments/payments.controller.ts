import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  createPayment(@Request() req: any, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(req.user.sub, dto);
  }

  @Post('webhook')
  handleWebhook(
    @Body() body: { order_id: string; transaction_status: string; fraud_status?: string },
  ) {
    return this.paymentsService.handleWebhook(body);
  }

  @Post('simulate/:registrationId')
  @UseGuards(JwtAuthGuard)
  simulatePayment(
    @Request() req: any,
    @Param('registrationId') registrationId: string,
  ) {
    return this.paymentsService.simulatePayment(req.user.sub, registrationId);
  }
}
