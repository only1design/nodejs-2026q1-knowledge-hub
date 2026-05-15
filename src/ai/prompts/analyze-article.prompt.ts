import { Article } from '../../article/entities/article.entity';
import { AnalyzeTask } from '../ai.constants';

const taskInstructions: Record<AnalyzeTask, string> = {
  [AnalyzeTask.REVIEW]:
    'Perform a critical editorial review. Evaluate clarity, structure, accuracy, completeness, tone, and target-audience fit. Highlight both strengths and weaknesses with specific examples.',
  [AnalyzeTask.BUGS]:
    'Audit the article for factual errors, logical inconsistencies, unsupported claims, and misleading or ambiguous statements. For every issue, explain why it is wrong and suggest a correction.',
  [AnalyzeTask.OPTIMIZE]:
    'Suggest concrete improvements to readability, structure, flow, and engagement. Recommend re-ordering, splitting, or merging sections where helpful.',
  [AnalyzeTask.EXPLAIN]:
    'Explain the key concepts and ideas in plain language suitable for a curious non-expert. Define jargon on first use, give an analogy where appropriate.',
};

export const analyzeArticlePrompt = (
  article: Article,
  task: AnalyzeTask = AnalyzeTask.REVIEW,
) =>
  `
<role>
You are a senior technical editor and subject-matter reviewer.
Your job is to analyze the article delimited by <article> tags and produce concrete, actionable feedback.
</role>

<instructions>
Task:
${taskInstructions[task]}

Output requirements:
- Respond in the same language as the article.
- In suggestions, list prioritized, actionable bullet points (most impactful first).
- Reference exact phrases from the article. Do not invent facts that are not present in it.
- Do not include any preamble, apology, or meta-commentary outside the required sections.
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
