import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { RecommendationFilterDto } from './dto/recommendation-filter.dto';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { Recommendation, RecommendationDocument } from './schemas/recommendation.schema';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectModel(Recommendation.name)
    private readonly recommendations: Model<RecommendationDocument>,
    @InjectModel(Feedback.name)
    private readonly feedbacks: Model<FeedbackDocument>,
  ) {}

  async findForUser(userId: string, filter: RecommendationFilterDto) {
    const query = { userId, ...(filter.type ? { type: filter.type } : {}) };
    const items = await this.recommendations
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filter.limit)
      .lean()
      .exec();

    return { userId, items };
  }

  async createFeedback(userId: string, dto: CreateFeedbackDto) {
    const recommendation = await this.recommendations.findById(dto.recommendationId).exec();
    if (!recommendation) {
      throw new NotFoundException('Recommendation not found');
    }
    if (recommendation.userId !== userId) {
      throw new ForbiddenException('Cannot access another user recommendation');
    }

    return this.feedbacks.create({ userId, ...dto });
  }
}
