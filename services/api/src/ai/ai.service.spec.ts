import { ServiceUnavailableException } from '@nestjs/common';

import { AiService } from './ai.service';

describe('AiService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
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
      'http://localhost:8001/ai/nutrition/recommend',
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

  it('maps network errors to service unavailable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    await expect(new AiService().health()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
