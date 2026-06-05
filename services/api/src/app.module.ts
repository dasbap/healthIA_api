import { Module } from '@nestjs/common';

import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, AiModule, RecommendationsModule, HealthModule],
})
export class AppModule {}
