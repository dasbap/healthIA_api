import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MealAnalysisDocument = HydratedDocument<MealAnalysis>;

@Schema({ _id: false })
export class DetectedFood {
  @Prop({ required: true })
  name: string;

  @Prop({ min: 0, max: 1 })
  confidence?: number;

  @Prop({ required: true, min: 0 })
  calories: number;

  @Prop({ min: 0 })
  proteins?: number;

  @Prop({ min: 0 })
  carbs?: number;

  @Prop({ min: 0 })
  fats?: number;
}

@Schema({ timestamps: true })
export class MealAnalysis {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ type: [DetectedFood], required: true })
  detectedFoods: DetectedFood[];

  @Prop({ required: true, min: 0 })
  totalCalories: number;

  @Prop()
  summary?: string;

  @Prop({ default: false })
  fallbackUsed: boolean;
}

export const MealAnalysisSchema = SchemaFactory.createForClass(MealAnalysis);
MealAnalysisSchema.index({ userId: 1, createdAt: -1 });
