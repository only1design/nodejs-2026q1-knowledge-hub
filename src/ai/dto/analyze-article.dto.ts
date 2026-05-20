import { IsOptional, IsEnum } from 'class-validator';
import { AnalyzeTask } from '../ai.constants';

export class AnalyzeArticleDto {
  @IsOptional()
  @IsEnum(AnalyzeTask)
  task?: AnalyzeTask;
}
