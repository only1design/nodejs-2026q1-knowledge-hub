import { z } from 'zod';

export const translatedArticleSchema = z.object({
  translatedText: z
    .string()
    .describe('The full translated text of the article'),
  detectedLanguage: z
    .string()
    .describe(
      'The detected or provided source language locale (e.g. en-US, ru-RU, de-DE)',
    ),
});

export const translatedArticleJsonSchema = z.toJSONSchema(
  translatedArticleSchema,
);
