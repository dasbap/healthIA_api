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
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';
import { AiFeedbackDto } from './dto/feedback.dto';
import { MealAnalysisDto } from './dto/meal-analysis.dto';
import { NutritionRequestDto } from './dto/nutrition-request.dto';
import { SportRequestDto } from './dto/sport-request.dto';

type AuthRequest = Request & { user: { sub: string } };

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health')
  health() {
    return this.aiService.health();
  }

  @Post('meal/analyze')
  analyzeMeal(@Req() request: AuthRequest, @Body() dto: MealAnalysisDto) {
    return this.aiService.analyzeMeal(request.user.sub, dto);
  }

  @Post('nutrition/recommend')
  recommendNutrition(@Req() request: AuthRequest, @Body() dto: NutritionRequestDto) {
    return this.aiService.recommendNutrition(request.user.sub, dto);
  }

  @Post('sport/recommend')
  recommendSport(@Req() request: AuthRequest, @Body() dto: SportRequestDto) {
    return this.aiService.recommendSport(request.user.sub, dto);
  }

  @Get('recommendations')
  history(
    @Req() request: AuthRequest,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.aiService.history(request.user.sub, limit);
  }

  @Post('feedback')
  feedback(@Req() request: AuthRequest, @Body() dto: AiFeedbackDto) {
    return this.aiService.feedback(request.user.sub, dto);
  }
}
