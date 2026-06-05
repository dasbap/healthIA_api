import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AiLogDocument = HydratedDocument<AiLog>;

@Schema({ timestamps: true })
export class AiLog {
  @Prop({ required: true, index: true })
  event: string;

  @Prop({ type: Object, default: {} })
  payload: Record<string, unknown>;
}

export const AiLogSchema = SchemaFactory.createForClass(AiLog);
AiLogSchema.index({ createdAt: -1 });
AiLogSchema.index({ event: 1, createdAt: -1 });
