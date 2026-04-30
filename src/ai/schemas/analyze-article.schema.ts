import { z } from 'zod';

export const analyzeArticleSchema = z.object({
  analysis: z
    .string()
    .describe('Detailed text analysis of the article based on the given task'),
  suggestions: z.array(
    z.string().describe('A single actionable improvement suggestion'),
  ),
  severity: z
    .enum(['low', 'medium', 'high'])
    .describe(
      'Overall severity: low — minor suggestions, medium — notable issues, high — critical problems',
    ),
});

export const analyzeArticleJsonSchema = z.toJSONSchema(analyzeArticleSchema);
