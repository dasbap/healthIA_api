import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export type RequestWithId = Request & { requestId?: string };

export function requestIdMiddleware(
  request: RequestWithId,
  response: Response,
  next: NextFunction,
): void {
  const header = request.header('x-request-id');
  const requestId = header && header.length <= 128 ? header : randomUUID();
  request.requestId = requestId;
  response.setHeader('X-Request-Id', requestId);
  next();
}
