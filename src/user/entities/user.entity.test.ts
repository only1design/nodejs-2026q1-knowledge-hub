import { instanceToPlain } from 'class-transformer';
import { UserRole } from '../../../generated/prisma/enums';
import { User } from './user.entity';

const makeUser = (overrides: Partial<User> = {}): User =>
  Object.assign(new User(), {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    login: 'alice',
    password: 'hashed_secret',
    role: UserRole.viewer,
    createdAt: BigInt(0),
    updatedAt: BigInt(0),
    ...overrides,
  });

describe('User entity serialization', () => {
  it('should exclude password from plain output', () => {
    const result = instanceToPlain(makeUser());

    expect(result.password).toBeUndefined();
  });

  it('should include all other fields in plain output', () => {
    const user = makeUser();
    const result = instanceToPlain(user);

    expect(result.id).toBe(user.id);
    expect(result.login).toBe(user.login);
    expect(result.role).toBe(user.role);
  });
});
