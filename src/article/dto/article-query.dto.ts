import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateArticleDto } from './create-article.dto';
import { IntersectionType, PartialType, PickType } from '@nestjs/mapped-types';
import { PaginationQueryDto } from '../../common/pagination-query.dto';

export class ArticleQueryDto extends IntersectionType(
  PaginationQueryDto,
  PartialType(PickType(CreateArticleDto, ['status', 'categoryId'])),
) {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tag?: string;
}
