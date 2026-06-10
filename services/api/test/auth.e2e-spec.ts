import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { MetricsService } from '../src/common/metrics.service';
import { requestIdMiddleware } from '../src/common/middleware/request-id.middleware';

describe('Auth (e2e)', () => {
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

  it('registers, logs in and blocks unauthenticated protected routes', async () => {
    const email = `e2e-${Date.now()}@example.com`;
    const password = 'password123';

    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);

    expect(register.body.data.accessToken).toEqual(expect.any(String));
    expect(register.body.data.user.email).toBe(email);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    expect(login.body.data.tokenType).toBe('Bearer');

    await request(app.getHttpServer()).get('/users/me').expect(401);
  });
});
