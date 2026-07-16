import { AppService } from './app.service.js';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('returns health payload with ok status', () => {
    const health = service.getHealth();
    expect(health.status).toBe('ok');
    expect(health.name).toBe('RuangTemu API');
    expect(health.message).toBeTruthy();
  });
});
