import { BaseRepository } from '../../common/repository/base.repository';
import { User } from '../entities/user.entity';

export abstract class UserRepository extends BaseRepository<User> {}
