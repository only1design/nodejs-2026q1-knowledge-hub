import { IsOptional, IsEnum } from 'class-validator';
import { LlmResponseMaxLength } from '../ai.enums';

export class SummarizeArticleDto {
  @IsOptional()
  @IsEnum(LlmResponseMaxLength)
  maxLength?: LlmResponseMaxLength;
}
