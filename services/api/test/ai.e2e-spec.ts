import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { MetricsService } from '../src/common/metrics.service';
import { requestIdMiddleware } from '../src/common/middleware/request-id.middleware';

describe('AI proxy (e2e)', () => {
  const originalFetch = global.fetch;
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    const metrics = app.get(MetricsService);
    app.use(requestIdMiddleware);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter(metrics));
    app.useGlobalInterceptors(new ResponseInterceptor(metrics));
    await app.init();

    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: `ai-e2e-${Date.now()}@example.com`, password: 'password123' });
    token = register.body.data.accessToken;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('proxies all AI routes with the authenticated user id', async () => {
    global.fetch = jest.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const path = String(url);
      const requestBody = init?.body ? JSON.parse(String(init.body)) : {};

      if (path.endsWith('/health')) {
        return jsonResponse({ status: 'ok' });
      }
      if (path.includes('/meal/analyze')) {
        return jsonResponse({ id: 'meal_1', userId: requestBody.userId, fallbackUsed: true });
      }
      if (path.includes('/nutrition/recommend')) {
        return jsonResponse({ id: 'nutrition_1', userId: requestBody.userId, type: 'nutrition', fallbackUsed: true });
      }
      if (path.includes('/sport/recommend')) {
        return jsonResponse({ id: 'sport_1', userId: requestBody.userId, type: 'sport', fallbackUsed: true });
      }
      if (path.includes('/recommendations/')) {
        return jsonResponse({ userId: path.split('/').at(-1)?.split('?')[0], items: [] });
      }
      return jsonResponse({ id: 'feedback_1', userId: requestBody.userId, rating: requestBody.rating });
    }) as jest.Mock;

    await request(app.getHttpServer())
      .get('/ai/health')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/ai/meal/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({ imageUrl: 'https://example.com/meal.jpg', notes: 'salad' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/ai/nutrition/recommend')
      .set('Authorization', `Bearer ${token}`)
      .send({
        age: 29,
        sex: 'female',
        heightCm: 168,
        weightKg: 64,
        goal: 'maintain',
        activityLevel: 'moderate',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/ai/sport/recommend')
      .set('Authorization', `Bearer ${token}`)
      .send({ age: 31, goal: 'strength', level: 'beginner', sessionsPerWeek: 3 })
      .expect(201);

    await request(app.getHttpServer())
      .get('/ai/recommendations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/ai/feedback')
      .set('Authorization', `Bearer ${token}`)
      .send({ recommendationId: 'nutrition_1', rating: 5 })
      .expect(201);

    const nutritionCall = (global.fetch as jest.Mock).mock.calls.find(([url]) =>
      String(url).includes('/nutrition/recommend'),
    );
    expect(JSON.parse(nutritionCall[1].body).userId).toEqual(expect.any(String));
  });

  it('rejects invalid AI payloads before proxying', async () => {
    global.fetch = jest.fn() as jest.Mock;

    await request(app.getHttpServer())
      .post('/ai/meal/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({ imageUrl: 'not-a-url' })
      .expect(400);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns service unavailable when FastAPI is offline', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const response = await request(app.getHttpServer())
      .get('/ai/health')
      .set('Authorization', `Bearer ${token}`)
      .expect(503);

    expect(response.body.error.code).toBe('AI_SERVICE_UNAVAILABLE');
  });
});

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}
