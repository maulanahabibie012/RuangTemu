import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): { name: string; status: string; message: string } {
    return this.appService.getHealth();
  }

  @Get('health')
  health(): { ok: boolean; service: string } {
    return { ok: true, service: 'ruangtemu-api' };
  }
}
