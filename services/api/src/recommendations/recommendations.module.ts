import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Feedback, FeedbackSchema } from './schemas/feedback.schema';
import { Recommendation, RecommendationSchema } from './schemas/recommendation.schema';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recommendation.name, schema: RecommendationSchema },
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
