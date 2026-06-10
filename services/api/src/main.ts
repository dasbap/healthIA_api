import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { MetricsService } from './common/metrics.service';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { configureSwagger } from './config/swagger.config';
import { env } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const metrics = app.get(MetricsService);

  app.use(requestIdMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(metrics));
  app.useGlobalInterceptors(new ResponseInterceptor(metrics));
  configureSwagger(app);

  await app.listen(env.apiPort);
}

void bootstrap();
