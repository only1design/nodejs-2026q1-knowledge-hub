import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateArticleDto } from './create-article.dto';
import { PartialType, PickType } from '@nestjs/mapped-types';

export class ArticleQueryDto extends PartialType(
  PickType(CreateArticleDto, ['status', 'categoryId']),
) {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tag?: string;
}
