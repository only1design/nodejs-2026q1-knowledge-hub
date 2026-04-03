import { IsString, IsUUID } from 'class-validator';
import { IntersectionType } from '@nestjs/mapped-types';
import { Article } from '../../article/entities/article.entity';
import { PaginationQueryDto } from '../../common/pagination-query.dto';

class CommentFilterDto {
  @IsString()
  @IsUUID('4')
  articleId: Article['id'];
}

export class CommentQueryDto extends IntersectionType(
  PaginationQueryDto,
  CommentFilterDto,
) {}
