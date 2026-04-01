import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
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

  @IsOptional()
  @IsString()
  @IsUUID('4')
  authorId: User['id'];

  @IsOptional()
  @IsString()
  @IsUUID('4')
  categoryId: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tags: string[];
}
