import { Article } from '../article/entities/article.entity';
import { BaseRepository } from '../common/base.repository';
import { User } from '../user/entities/user.entity';
import { Comment } from './entities/comment.entity';

export interface CommentFilter {
  articleId?: Article['id'];
  authorId?: User['id'];
}
export abstract class CommentRepository extends BaseRepository<Comment> {
  abstract findAll(filter?: CommentFilter): Promise<Comment[]>;
}
