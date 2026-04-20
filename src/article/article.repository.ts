import { BaseRepository } from '../common/base.repository';
import { Article } from './entities/article.entity';

export interface ArticleFilter {
  status?: string;
  categoryId?: string;
  tag?: string;
  authorId?: string;
}

export abstract class ArticleRepository extends BaseRepository<Article> {
  abstract findAll(filter?: ArticleFilter): Promise<Article[]>;
}
