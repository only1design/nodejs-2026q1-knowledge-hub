import { Injectable } from '@nestjs/common';
import { InMemoryBaseRepository } from '../common/base-memory.repository';
import { CategoryRepository } from './category.repository';
import { Category } from './entities/category.entity';

@Injectable()
export class InMemoryCategoryRepository
  extends InMemoryBaseRepository<Category>
  implements CategoryRepository
{
  constructor() {
    super(Category);
  }
}
