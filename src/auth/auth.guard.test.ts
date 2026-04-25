import { ExecutionContext } from '@nestjs/common';
import { UnauthorizedError } from '../errors/app.errors';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-vitest';
import { AuthGuard } from './auth.guard';

const mockContext = (authorization?: string): ExecutionContext =>
  createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: { authorization },
        user: undefined,
      }),
    }),
  });

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            signAsync: vi.fn().mockResolvedValue('mock-token'),
            verifyAsync: vi.fn(),
          },
        },
      ],
    })
      .useMocker(() => createMock())
      .compile();

    reflector = moduleRef.get(Reflector);
    guard = moduleRef.get(AuthGuard);
    jwtService = moduleRef.get(JwtService);
  });

  it('should allow access to public routes', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    await expect(guard.canActivate(mockContext())).resolves.toBe(true);
  });

  it('should throw 401 when token is missing', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    await expect(guard.canActivate(mockContext())).rejects.toThrow(
      new UnauthorizedError('The token is missing'),
    );
  });

  it('should throw 401 when authorization header is not Bearer', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    await expect(
      guard.canActivate(mockContext('Basic sometoken')),
    ).rejects.toThrow(new UnauthorizedError('The token is missing'));
  });

  it('should throw 401 when token is invalid', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    vi.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('invalid'));

    await expect(
      guard.canActivate(mockContext('Bearer bad.token')),
    ).rejects.toThrow(new UnauthorizedError('The token is invalid or expired'));
  });

  it('should attach user to request and return true for valid token', async () => {
    const payload = { userId: '1', role: 'viewer' };
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    vi.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

    const request = {
      headers: { authorization: 'Bearer valid.token' },
      user: undefined,
    };
    const ctx = createMock<ExecutionContext>({
      switchToHttp: () => ({ getRequest: () => request }),
    });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request.user).toEqual(payload);
  });
});
