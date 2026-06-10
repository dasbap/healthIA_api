import { IsArray, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SportRequestDto {
  @IsInt()
  @Min(12)
  @Max(100)
  age: number;

  @IsIn(['fat_loss', 'endurance', 'strength', 'mobility'])
  goal: string;

  @IsIn(['beginner', 'intermediate', 'advanced'])
  level: string;

  @IsInt()
  @Min(1)
  @Max(7)
  sessionsPerWeek: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  limitations?: string[];
}
