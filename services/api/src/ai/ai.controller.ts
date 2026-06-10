import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Scopes } from '../auth/scopes.decorator';
import { ScopesGuard } from '../auth/scopes.guard';
import { RequestWithId } from '../common/middleware/request-id.middleware';
import { AiService } from './ai.service';
import { AiFeedbackDto } from './dto/feedback.dto';
import { MealAnalysisDto } from './dto/meal-analysis.dto';
import { NutritionRequestDto } from './dto/nutrition-request.dto';
import { SportRequestDto } from './dto/sport-request.dto';

type AuthRequest = RequestWithId & { user: { sub: string } };

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health')
  @Scopes('ai:read')
  health() {
    return this.aiService.health();
  }

  @Post('meal/analyze')
  @Scopes('ai:recommend')
  analyzeMeal(@Req() request: AuthRequest, @Body() dto: MealAnalysisDto) {
    return this.aiService.analyzeMeal(request.user.sub, dto, request.requestId);
  }

  @Post('nutrition/recommend')
  @Scopes('ai:recommend')
  recommendNutrition(@Req() request: AuthRequest, @Body() dto: NutritionRequestDto) {
    return this.aiService.recommendNutrition(request.user.sub, dto, request.requestId);
  }

  @Post('sport/recommend')
  @Scopes('ai:recommend')
  recommendSport(@Req() request: AuthRequest, @Body() dto: SportRequestDto) {
    return this.aiService.recommendSport(request.user.sub, dto, request.requestId);
  }

  @Get('recommendations')
  @Scopes('ai:read')
  history(
    @Req() request: AuthRequest,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.aiService.history(request.user.sub, limit, request.requestId);
  }

  @Post('feedback')
  @Scopes('feedback:write')
  feedback(@Req() request: AuthRequest, @Body() dto: AiFeedbackDto) {
    return this.aiService.feedback(request.user.sub, dto, request.requestId);
  }
}
