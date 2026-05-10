import { z } from 'zod';

export const ragChatResponseSchema = z.object({
  answer: z
    .string()
    .describe(
      'A grounded answer to the user question based solely on the provided sources. ' +
        'If no relevant information was found, return the message: ' +
        '"I could not find relevant information in the Knowledge Hub to answer this question."',
    ),
  sources: z
    .array(
      z
        .number()
        .describe(
          'The 1-based index of a source from the <sources> block that was used to produce the answer. ' +
            'Only include indexes of sources that were actually referenced.',
        ),
    )
    .describe(
      'List of source indexes that contributed to the answer. Empty if no sources were used.',
    ),
});

export const ragChatResponseJsonSchema = z.toJSONSchema(ragChatResponseSchema);
