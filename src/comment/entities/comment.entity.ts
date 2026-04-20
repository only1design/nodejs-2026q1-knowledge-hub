import { Article } from '../../article/entities/article.entity';
import { User } from '../../user/entities/user.entity';

export class Comment {
  id: string;

  content: string;

  articleId: Article['id'];

  authorId: User['id'] | null;

  createdAt: bigint;
}
