import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { UserRole } from '../../../generated/prisma/enums';
import { RoleGuard } from './role.guard';
import { createMock } from '@golevelup/ts-vitest';

const mockContext = (role: UserRole): ExecutionContext =>
  createMock<ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ user: { role } }),
    }),
  });

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RoleGuard],
    })
      .useMocker(() => createMock())
      .compile();

    reflector = moduleRef.get(Reflector);
    guard = moduleRef.get(RoleGuard);
  });

  it('should allow access when no role is required', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(mockContext(UserRole.viewer))).toBe(true);
  });

  it.each([
    {
      requiredRole: UserRole.viewer,
      userRole: UserRole.viewer,
      expected: true,
    },
    {
      requiredRole: UserRole.viewer,
      userRole: UserRole.editor,
      expected: true,
    },
    { requiredRole: UserRole.viewer, userRole: UserRole.admin, expected: true },
    {
      requiredRole: UserRole.editor,
      userRole: UserRole.viewer,
      expected: false,
    },
    {
      requiredRole: UserRole.editor,
      userRole: UserRole.editor,
      expected: true,
    },
    { requiredRole: UserRole.editor, userRole: UserRole.admin, expected: true },
    {
      requiredRole: UserRole.admin,
      userRole: UserRole.viewer,
      expected: false,
    },
    {
      requiredRole: UserRole.admin,
      userRole: UserRole.editor,
      expected: false,
    },
    { requiredRole: UserRole.admin, userRole: UserRole.admin, expected: true },
  ])(
    '$userRole should $expected access $requiredRole endpoint',
    ({ requiredRole, userRole, expected }) => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRole);

      expect(guard.canActivate(mockContext(userRole))).toBe(expected);
    },
  );
});
