import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns api health status', () => {
    expect(new HealthService().status()).toEqual({
      status: 'ok',
      service: 'api',
    });
  });
});
