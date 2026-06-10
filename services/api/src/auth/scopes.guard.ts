import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SCOPES_KEY } from './scopes.decorator';

type AuthUser = {
  roles?: string[];
  scopes?: string[];
};

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredScopes?.length) {
      return true;
    }

    const user = context.switchToHttp().getRequest<{ user?: AuthUser }>().user;
    if (user?.roles?.includes('admin')) {
      return true;
    }

    const scopes = new Set(user?.scopes ?? []);
    return requiredScopes.every((scope) => scopes.has(scope));
  }
}
