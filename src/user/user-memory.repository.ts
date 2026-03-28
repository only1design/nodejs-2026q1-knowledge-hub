import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class InMemoryUserRepository extends UserRepository {
  private storage = new Map<User['id'], User>();

  findAll() {
    return Array.from(this.storage.values());
  }

  findById(id: User['id']): User | undefined {
    return this.storage.get(id);
  }

  create(user: User) {
    const newUser = Object.assign(new User(), user);
    this.storage.set(user.id, newUser);
    return newUser;
  }

  update(id: User['id'], data: Partial<User>) {
    const user = this.storage.get(id);

    if (!user) {
      return undefined;
    }

    return Object.assign(user, data);
  }

  delete(id: User['id']) {
    return this.storage.delete(id);
  }
}
