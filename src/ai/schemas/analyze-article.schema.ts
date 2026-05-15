import { z } from 'zod';

export const analyzeArticleSchema = z.object({
  analysis: z
    .string()
    .describe('Detailed text analysis of the article based on the given task'),
  suggestions: z.array(
    z.string().describe('A single actionable improvement suggestion'),
  ),
  severity: z
    .enum(['info', 'warning', 'error'])
    .describe(
      'Overall severity: info — minor suggestions, warning — notable issues, error — critical problems',
    ),
});

export const analyzeArticleJsonSchema = z.toJSONSchema(analyzeArticleSchema);
