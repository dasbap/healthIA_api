import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RecommendationDocument = HydratedDocument<Recommendation>;

@Schema({ timestamps: true })
export class Recommendation {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: ['nutrition', 'sport'] })
  type: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, unknown>;
}

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation);
RecommendationSchema.index({ userId: 1, createdAt: -1 });
RecommendationSchema.index({ userId: 1, type: 1, createdAt: -1 });
