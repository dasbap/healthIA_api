import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class UserPreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];

  @IsOptional()
  @IsIn(['low', 'moderate', 'high'])
  activityLevel?: string;
}
