import { Article } from '../../article/entities/article.entity';
import { LlmResponseMaxLength } from '../ai.enums';

export const lengthGuide: Record<LlmResponseMaxLength, string> = {
  short: '1-2 sentences',
  medium: '1 paragraph',
  detailed: '2-3 paragraphs',
};

export function summarizeArticlePrompt(
  article: Article,
  maxLength: LlmResponseMaxLength = LlmResponseMaxLength.MEDIUM,
): string {
  return `Summarize the following article in ${lengthGuide[maxLength]}:\n\n${article.content}`;
}
