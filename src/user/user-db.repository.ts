import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { DbBaseRepository } from '../common/base-db.repository';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class DbUserRepository
  extends DbBaseRepository<User>
  implements UserRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, Prisma.ModelName.User, User);
  }
}
