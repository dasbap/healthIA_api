import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { MetricsService } from '../metrics.service';
import { nowIso } from '../utils/dates';

const errorCodes: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'AI_SERVICE_UNAVAILABLE',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly metrics?: MetricsService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';
    const message =
      typeof payload === 'object' && payload && 'message' in payload
        ? payload.message
        : payload;

    this.metrics?.record(request.route?.path ?? request.url, request.method, status, 0);

    response.status(status).json({
      success: false,
      error: {
        code: errorCodes[status] ?? 'INTERNAL_ERROR',
        message,
        details: typeof payload === 'object' ? payload : [],
      },
      timestamp: nowIso(),
      path: request.url,
    });
  }
}
