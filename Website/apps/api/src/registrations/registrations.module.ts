import { Module } from '@nestjs/common';
import { RegistrationsService } from './registrations.service.js';
import { RegistrationsController } from './registrations.controller.js';
import { RegistrationTimeoutService } from './registration-timeout.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService, RegistrationTimeoutService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
