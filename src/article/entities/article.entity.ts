import { Category } from '../../category/entities/category.entity';
import { User } from '../../user/entities/user.entity';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class Article {
  id: string;

  title: string;

  content: string;

  status: ArticleStatus;

  authorId: User['id'] | null;

  categoryId: Category['id'] | null;

  tags: string[];

  createdAt: number;

  updatedAt: number;
}
