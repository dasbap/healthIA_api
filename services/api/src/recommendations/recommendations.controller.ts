import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Scopes } from '../auth/scopes.decorator';
import { ScopesGuard } from '../auth/scopes.guard';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { RecommendationFilterDto } from './dto/recommendation-filter.dto';
import { RecommendationsService } from './recommendations.service';

type AuthRequest = Request & { user: { sub: string } };

@ApiTags('recommendations')
@ApiBearerAuth()
@Controller('recommendations')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  @Scopes('ai:read')
  findMine(@Req() request: AuthRequest, @Query() filter: RecommendationFilterDto) {
    return this.recommendationsService.findForUser(request.user.sub, filter);
  }

  @Post('feedback')
  @Scopes('feedback:write')
  createFeedback(@Req() request: AuthRequest, @Body() dto: CreateFeedbackDto) {
    return this.recommendationsService.createFeedback(request.user.sub, dto);
  }
}
