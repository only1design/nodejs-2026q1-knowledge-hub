import { UserRole } from '../../../generated/prisma/enums';
import { ROLE_KEY, Role } from './role.decorator';

describe('Role decorator', () => {
  it('should set role metadata on class', () => {
    class DummyController {}
    Role(UserRole.admin)(DummyController);

    expect(Reflect.getMetadata(ROLE_KEY, DummyController)).toBe(UserRole.admin);
  });

  it.each(Object.values(UserRole))('should work for role %s', (role) => {
    class Target {}
    Role(role)(Target);

    expect(Reflect.getMetadata(ROLE_KEY, Target)).toBe(role);
  });
});
