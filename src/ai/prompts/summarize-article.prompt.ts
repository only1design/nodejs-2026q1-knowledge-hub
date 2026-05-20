import { Article } from '../../article/entities/article.entity';
import { LlmResponseMaxLength } from '../ai.constants';

export const lengthGuide: Record<LlmResponseMaxLength, string> = {
  short: '1–2 sentences (max ~40 words)',
  medium: 'one tight paragraph (max ~120 words)',
  detailed: '2–3 paragraphs (max ~300 words)',
};

export const summarizeArticlePrompt = (
  article: Article,
  maxLength: LlmResponseMaxLength = LlmResponseMaxLength.MEDIUM,
) =>
  `
<role>
You are a technical writer producing summaries for a knowledge base.
Your job is to distill the article delimited by <article> tags into a clear, accurate summary.
</role>

<instructions>
Goals:
- Write a summary of length: ${lengthGuide[maxLength]}.
- Capture the article's main thesis, the key supporting points, and any concrete conclusions or recommendations.
- Preserve the author's intent and tone; do not add opinions, speculation, or facts not present in the article.
- Use the same language as the article.

Style rules:
- Output the summary text only — no title, no headings, no bullet lists, no preamble such as "This article…".
- Prefer active voice and concrete nouns over vague phrases.
- If the article has clear sections or steps, reflect that ordering in the summary.
</instructions>

<article>
<metadata>
<title>${article.title}</title>
<tags>${article.tags?.length ? article.tags.join(', ') : 'none'}</tags>
</metadata>

<content> 
${article.content}
</content>
</article>
`.trim();
