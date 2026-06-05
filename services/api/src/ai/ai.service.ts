import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { env } from '../config/env.config';
import { AiFeedbackDto } from './dto/feedback.dto';
import { MealAnalysisDto } from './dto/meal-analysis.dto';
import { NutritionRequestDto } from './dto/nutrition-request.dto';
import { SportRequestDto } from './dto/sport-request.dto';

@Injectable()
export class AiService {
  private readonly baseUrl = env.aiServiceUrl.replace(/\/$/, '');

  health() {
    return this.get('/health');
  }

  analyzeMeal(userId: string, dto: MealAnalysisDto) {
    return this.post('/ai/meal/analyze', { userId, ...dto });
  }

  recommendNutrition(userId: string, dto: NutritionRequestDto) {
    return this.post('/ai/nutrition/recommend', { userId, ...dto });
  }

  recommendSport(userId: string, dto: SportRequestDto) {
    return this.post('/ai/sport/recommend', { userId, ...dto });
  }

  history(userId: string, limit = 20) {
    return this.get(`/ai/recommendations/${encodeURIComponent(userId)}?limit=${limit}`);
  }

  feedback(userId: string, dto: AiFeedbackDto) {
    return this.post('/ai/feedback', { userId, ...dto });
  }

  private async get(path: string) {
    return this.request(path);
  }

  private async post(path: string, body: unknown) {
    return this.request(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  private async request(path: string, init?: RequestInit) {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, init);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ServiceUnavailableException(payload);
      }

      return payload;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      throw new ServiceUnavailableException('AI service unavailable');
    }
  }
}
