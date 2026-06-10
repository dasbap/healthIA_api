import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { MetricsService } from '../src/common/metrics.service';
import { requestIdMiddleware } from '../src/common/middleware/request-id.middleware';

describe('Health and metrics (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app?.close();
  });

  it('returns a standardized health response with a request id', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .set('x-request-id', 'e2e-request')
      .expect(200);

    expect(response.headers['x-request-id']).toBe('e2e-request');
    expect(response.body).toMatchObject({
      success: true,
      data: { status: 'ok', service: 'api' },
    });
  });

  it('exposes prometheus-compatible metrics', async () => {
    const response = await request(app.getHttpServer()).get('/metrics').expect(200);

    expect(response.text).toContain('http_requests_total');
  });
});
