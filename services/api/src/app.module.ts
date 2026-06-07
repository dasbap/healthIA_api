import { Module } from '@nestjs/common';

import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { MetricsService } from './common/metrics.service';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { MetricsController } from './health/metrics.controller';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, AiModule, RecommendationsModule, HealthModule],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class AppModule {}
