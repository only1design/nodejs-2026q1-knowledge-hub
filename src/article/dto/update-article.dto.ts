import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';

export class UpdateArticleDto extends PartialType(
  PickType(CreateArticleDto, [
    'title',
    'content',
    'status',
    'categoryId',
    'tags',
  ]),
) {}
