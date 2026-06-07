import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class UserProfile {
  @Prop({ min: 12, max: 100 })
  age?: number;

  @Prop({ enum: ['female', 'male', 'other'] })
  sex?: string;

  @Prop({ min: 120, max: 230 })
  heightCm?: number;

  @Prop({ min: 35, max: 250 })
  weightKg?: number;
}

@Schema({ _id: false })
export class UserPreferences {
  @Prop({ type: [String], default: [] })
  dietaryRestrictions: string[];

  @Prop({ enum: ['low', 'moderate', 'high'], default: 'moderate' })
  activityLevel: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop({ type: [String], default: ['profile:read', 'profile:write', 'ai:recommend', 'ai:read', 'feedback:write'] })
  scopes: string[];

  @Prop({ type: UserProfile, default: {} })
  profile: UserProfile;

  @Prop({ type: UserPreferences, default: { dietaryRestrictions: [], activityLevel: 'moderate' } })
  preferences: UserPreferences;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ createdAt: -1 });
