import { writeFileSync } from 'fs';
import { join } from 'path';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { AiController } from '../src/ai/ai.controller';
import { AiService } from '../src/ai/ai.service';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { ScopesGuard } from '../src/auth/scopes.guard';
import { MetricsService } from '../src/common/metrics.service';
import { configureSwaggerDocument } from '../src/config/swagger.config';
import { HealthController } from '../src/health/health.controller';
import { HealthService } from '../src/health/health.service';
import { MetricsController } from '../src/health/metrics.controller';
import { RecommendationsController } from '../src/recommendations/recommendations.controller';
import { RecommendationsService } from '../src/recommendations/recommendations.service';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

const emptyService = {};

@Module({
  controllers: [
    AiController,
    AuthController,
    HealthController,
    MetricsController,
    RecommendationsController,
    UsersController,
  ],
  providers: [
    MetricsService,
    ScopesGuard,
    { provide: AiService, useValue: emptyService },
    { provide: AuthService, useValue: emptyService },
    { provide: HealthService, useValue: emptyService },
    { provide: RecommendationsService, useValue: emptyService },
    { provide: UsersService, useValue: emptyService },
  ],
})
class OpenApiModule {}

async function exportOpenApi() {
  const app = await NestFactory.create(OpenApiModule, { logger: false });
  const document = SwaggerModule.createDocument(app, configureSwaggerDocument());
  writeFileSync(join(process.cwd(), 'openapi.json'), `${JSON.stringify(document, null, 2)}\n`);
  await app.close();
}

void exportOpenApi();
