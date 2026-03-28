import { User } from './entities/user.entity';

export abstract class UserRepository {
  abstract findAll(): User[];

  abstract findById(id: User['id']): User | undefined;

  abstract create(user: User): User;

  abstract update(id: User['id'], data: Partial<User>): User | undefined;

  abstract delete(id: User['id']): boolean;
}
