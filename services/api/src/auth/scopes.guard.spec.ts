import { Reflector } from '@nestjs/core';

import { ScopesGuard } from './scopes.guard';

describe('ScopesGuard', () => {
  function context(user: unknown) {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as never;
  }

  it('allows users with every required scope', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['ai:read', 'feedback:write']),
    } as unknown as Reflector;

    const allowed = new ScopesGuard(reflector).canActivate(
      context({ scopes: ['ai:read', 'feedback:write'] }),
    );

    expect(allowed).toBe(true);
  });

  it('rejects users missing required scopes', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['ai:recommend']),
    } as unknown as Reflector;

    const allowed = new ScopesGuard(reflector).canActivate(context({ scopes: ['ai:read'] }));

    expect(allowed).toBe(false);
  });

  it('allows admin users', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['admin:read']),
    } as unknown as Reflector;

    const allowed = new ScopesGuard(reflector).canActivate(context({ roles: ['admin'] }));

    expect(allowed).toBe(true);
  });
});
