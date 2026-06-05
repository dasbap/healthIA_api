import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsInt()
  @Min(12)
  @Max(100)
  age?: number;

  @IsOptional()
  @IsIn(['female', 'male', 'other'])
  sex?: string;

  @IsOptional()
  @IsNumber()
  @Min(120)
  @Max(230)
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(35)
  @Max(250)
  weightKg?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];

  @IsOptional()
  @IsIn(['low', 'moderate', 'high'])
  activityLevel?: string;
}
