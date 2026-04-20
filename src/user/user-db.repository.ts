import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma } from '../../generated/prisma/client';
import { DbBaseRepository } from '../common/base-db.repository';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class DbUserRepository
  extends DbBaseRepository<User>
  implements UserRepository
{
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, Prisma.ModelName.User, User);
  }
}
