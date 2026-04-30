import { Article } from '../../article/entities/article.entity';

export function translateArticlePrompt(
  article: Article,
  targetLanguage: string,
  sourceLanguage?: string,
): string {
  const sourcePart = sourceLanguage
    ? `The source language is ${sourceLanguage}.`
    : 'Detect the source language automatically.';

  return `Translate the following article to ${targetLanguage}. ${sourcePart}

  ${article.content}`;
}
