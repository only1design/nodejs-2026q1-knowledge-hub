import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
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

  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  authorId: User['id'];

  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  categoryId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tags: string[];
}
