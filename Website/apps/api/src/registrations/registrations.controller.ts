import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service.js';
import { CreateRegistrationDto } from './dto/create-registration.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('registrations')
@UseGuards(JwtAuthGuard)
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  register(@Request() req: any, @Body() dto: CreateRegistrationDto) {
    return this.registrationsService.register(req.user.sub, dto);
  }

  @Get('me')
  getMyRegistrations(@Request() req: any) {
    return this.registrationsService.getMyRegistrations(req.user.sub);
  }

  @Get(':id')
  getRegistration(@Request() req: any, @Param('id') id: string) {
    return this.registrationsService.getRegistrationById(id, req.user.sub);
  }

  @Post(':id/cancel')
  cancelRegistration(@Request() req: any, @Param('id') id: string) {
    return this.registrationsService.cancelRegistration(id, req.user.sub);
  }
}
