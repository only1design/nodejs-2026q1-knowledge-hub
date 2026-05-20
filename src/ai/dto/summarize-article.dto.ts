import { IsOptional, IsEnum } from 'class-validator';
import { LlmResponseMaxLength } from '../ai.constants';

export class SummarizeArticleDto {
  @IsOptional()
  @IsEnum(LlmResponseMaxLength)
  maxLength?: LlmResponseMaxLength;
}
