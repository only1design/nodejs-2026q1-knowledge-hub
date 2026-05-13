import { Article } from '../../article/entities/article.entity';
import { AnalyzeTask } from '../ai.enums';

const taskInstructions: Record<AnalyzeTask, string> = {
  [AnalyzeTask.REVIEW]:
    'Provide a critical review: assess clarity, structure, accuracy, and completeness.',
  [AnalyzeTask.BUGS]:
    'Identify factual errors, logical inconsistencies, and misleading statements.',
  [AnalyzeTask.OPTIMIZE]:
    'Suggest improvements to readability, structure, and engagement.',
  [AnalyzeTask.EXPLAIN]:
    'Explain the key concepts and ideas presented in the article in simple terms.',
};

export function analyzeArticlePrompt(
  article: Article,
  task: AnalyzeTask = AnalyzeTask.REVIEW,
): string {
  return `Analyze the following article and provide actionable suggestions.\n\nTask: ${taskInstructions[task]}\n\n${article.content}`;
}
