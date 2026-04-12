import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsUUID('4')
  articleId: string;

  @IsOptional()
  @IsString()
  @IsUUID('4')
  authorId: string | null;
}
