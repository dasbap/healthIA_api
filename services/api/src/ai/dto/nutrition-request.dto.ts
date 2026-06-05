import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class NutritionRequestDto {
  @IsInt()
  @Min(12)
  @Max(100)
  age: number;

  @IsIn(['female', 'male', 'other'])
  sex: string;

  @IsNumber()
  @Min(120)
  @Max(230)
  heightCm: number;

  @IsNumber()
  @Min(35)
  @Max(250)
  weightKg: number;

  @IsIn(['lose_weight', 'maintain', 'gain_muscle'])
  goal: string;

  @IsIn(['low', 'moderate', 'high'])
  activityLevel: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];
}
