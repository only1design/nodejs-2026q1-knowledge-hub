import { IsString, IsUUID } from 'class-validator';
import { Article } from '../../article/entities/article.entity';

export class CommentQueryDto {
  @IsString()
  @IsUUID('4')
  articleId: Article['id'];
}
