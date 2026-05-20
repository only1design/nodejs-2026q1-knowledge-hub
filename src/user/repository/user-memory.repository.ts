import { Injectable } from '@nestjs/common';
import { InMemoryBaseRepository } from '../../common/repository/base-memory.repository';
import { User } from '../entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class InMemoryUserRepository
  extends InMemoryBaseRepository<User>
  implements UserRepository
{
  constructor() {
    super(User);
  }
}
