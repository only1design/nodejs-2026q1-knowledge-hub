import { PartialType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateArticleDto } from './create-article.dto';

export class ArticleQueryDto extends PartialType(
  PickType(CreateArticleDto, ['status', 'categoryId']),
) {
  @IsOptional()
  @IsString()
  tag?: string;
}
