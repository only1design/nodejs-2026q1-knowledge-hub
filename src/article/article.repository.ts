import { BaseRepository } from '../common/base.repository';
import { Article } from './entities/article.entity';

export abstract class ArticleRepository extends BaseRepository<Article> {}
