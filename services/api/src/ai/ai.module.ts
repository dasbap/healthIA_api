import { Module } from '@nestjs/common';

import { ScopesGuard } from '../auth/scopes.guard';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  controllers: [AiController],
  providers: [AiService, ScopesGuard],
  exports: [AiService],
})
export class AiModule {}
