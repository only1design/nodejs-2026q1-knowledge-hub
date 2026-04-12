import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { DbBaseRepository } from '../common/base-db.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryRepository } from './category.repository';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryDbRepository
  extends DbBaseRepository<Category>
  implements CategoryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, Prisma.ModelName.Category, Category);
  }
}
