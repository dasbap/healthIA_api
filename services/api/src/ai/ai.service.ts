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

  analyzeMeal(userId: string, dto: MealAnalysisDto, requestId?: string) {
    return this.post('/ai/meal/analyze', { userId, ...dto }, requestId);
  }

  recommendNutrition(userId: string, dto: NutritionRequestDto, requestId?: string) {
    return this.post('/ai/nutrition/recommend', { userId, ...dto }, requestId);
  }

  recommendSport(userId: string, dto: SportRequestDto, requestId?: string) {
    return this.post('/ai/sport/recommend', { userId, ...dto }, requestId);
  }

  history(userId: string, limit = 20, requestId?: string) {
    return this.get(`/ai/recommendations/${encodeURIComponent(userId)}?limit=${limit}`, requestId);
  }

  feedback(userId: string, dto: AiFeedbackDto, requestId?: string) {
    return this.post('/ai/feedback', { userId, ...dto }, requestId);
  }

  private async get(path: string, requestId?: string) {
    return this.request(path, undefined, requestId);
  }

  private async post(path: string, body: unknown, requestId?: string) {
    return this.request(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }, requestId);
  }

  private async request(path: string, init?: RequestInit, requestId?: string) {
    try {
      const headers = new Headers(init?.headers);
      if (env.aiServiceToken) {
        headers.set('x-service-token', env.aiServiceToken);
      }
      if (requestId) {
        headers.set('x-request-id', requestId);
      }

      const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
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
