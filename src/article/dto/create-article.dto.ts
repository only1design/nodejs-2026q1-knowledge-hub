import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Category } from '../../category/entities/category.entity';
import { User } from '../../user/entities/user.entity';
import { ArticleStatus } from '../entities/article.entity';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(ArticleStatus)
  @IsNotEmpty()
  status: ArticleStatus;

  @IsOptional()
  @IsString()
  @IsUUID('4')
  authorId: User['id'];

  @IsOptional()
  @IsString()
  @IsUUID('4')
  categoryId: Category['id'];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tags: string[];
}
