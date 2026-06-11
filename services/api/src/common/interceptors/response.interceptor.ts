import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map, tap } from 'rxjs';

import { MetricsService } from '../metrics.service';
import { nowIso } from '../utils/dates';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly metrics?: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<{ method?: string; route?: { path?: string }; url?: string }>();
    const response = http.getResponse<{ statusCode?: number }>();
    const recordMetrics = () => {
      this.metrics?.record(
        request.route?.path ?? request.url ?? 'unknown',
        request.method ?? 'GET',
        response.statusCode ?? 200,
        Date.now() - startedAt,
      );
    };

    if (request.url === '/metrics') {
      return next.handle().pipe(tap(recordMetrics));
    }

    return next.handle().pipe(
      tap(recordMetrics),
      map((data) => ({
        success: true,
        data,
        timestamp: nowIso(),
      })),
    );
  }
}
