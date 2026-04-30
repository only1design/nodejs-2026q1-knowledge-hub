import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class TranslateArticleDto {
  @IsString()
  @IsNotEmpty()
  targetLanguage: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sourceLanguage?: string;
}
