import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      name: 'RuangTemu API',
      status: 'ok',
      message: 'Phase 0 scaffold — auth & modules coming next',
    };
  }
}
