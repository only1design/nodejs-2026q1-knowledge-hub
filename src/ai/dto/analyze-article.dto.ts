import { IsOptional, IsEnum } from 'class-validator';
import { AnalyzeTask } from '../ai.enums';

export class AnalyzeArticleDto {
  @IsOptional()
  @IsEnum(AnalyzeTask)
  task?: AnalyzeTask;
}
