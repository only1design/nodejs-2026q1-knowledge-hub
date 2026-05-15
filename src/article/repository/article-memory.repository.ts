import { Injectable } from '@nestjs/common';
import { InMemoryBaseRepository } from '../../common/repository/base-memory.repository';
import { Article } from '../entities/article.entity';
import { ArticleRepository } from './article.repository';

@Injectable()
export class InMemoryArticleRepository
  extends InMemoryBaseRepository<Article>
  implements ArticleRepository
{
  constructor() {
    super(Article);
  }
}
