import { User } from '../../user/entities/user.entity';

export class JwtPayloadDto {
  userId: User['id'];

  login: User['login'];

  role: User['role'];
}
