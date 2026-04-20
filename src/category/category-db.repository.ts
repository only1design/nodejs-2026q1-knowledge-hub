import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma } from '../../generated/prisma/client';
import { DbBaseRepository } from '../common/base-db.repository';
import { CategoryRepository } from './category.repository';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryDbRepository
  extends DbBaseRepository<Category>
  implements CategoryRepository
{
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, Prisma.ModelName.Category, Category);
  }
}
