import { ServiceUnavailableException } from '@nestjs/common';

import { env } from '../config/env.config';
import { AiService } from './ai.service';

describe('AiService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    env.aiServiceToken = undefined;
    jest.restoreAllMocks();
  });

  it('forwards nutrition requests with authorized user id', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ fallbackUsed: true }),
    } as Response);

    const response = await new AiService().recommendNutrition('user_123', {
      age: 29,
      sex: 'female',
      heightCm: 168,
      weightKg: 64,
      goal: 'maintain',
      activityLevel: 'moderate',
      dietaryRestrictions: ['vegetarian'],
    });

    expect(response).toEqual({ fallbackUsed: true });
    expect(global.fetch).toHaveBeenCalledWith(
      `${env.aiServiceUrl.replace(/\/$/, '')}/ai/nutrition/recommend`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          userId: 'user_123',
          age: 29,
          sex: 'female',
          heightCm: 168,
          weightKg: 64,
          goal: 'maintain',
          activityLevel: 'moderate',
          dietaryRestrictions: ['vegetarian'],
        }),
      }),
    );
  });

  it('propagates internal service token and request id', async () => {
    env.aiServiceToken = 'service-secret';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' }),
    } as Response);

    await new AiService().history('user_123', 20, 'req-123');

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    const headers = init.headers as Headers;
    expect(headers.get('x-service-token')).toBe('service-secret');
    expect(headers.get('x-request-id')).toBe('req-123');
  });

  it('maps network errors to service unavailable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    await expect(new AiService().health()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
