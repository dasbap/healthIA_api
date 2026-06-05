import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class MealAnalysisDto {
  @ApiProperty({ example: 'https://example.com/meal.jpg' })
  @IsUrl({ require_protocol: true })
  imageUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
