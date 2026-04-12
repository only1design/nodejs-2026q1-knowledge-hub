import { BaseRepository } from '../common/base.repository';
import { Category } from './entities/category.entity';

export abstract class CategoryRepository extends BaseRepository<Category> {}
