import { Article } from '../../article/entities/article.entity';

const formatSourceLanguage = (sourceLanguage?: string) =>
  sourceLanguage
    ? `The source language is ${sourceLanguage}.`
    : 'Detect the source language automatically and state it nowhere in the output.';

export const translateArticlePrompt = (
  article: Article,
  targetLanguage: string,
  sourceLanguage?: string,
) =>
  `
<role>
You are a professional translator specializing in technical and editorial content.
Translate the article delimited by <article> tags into ${targetLanguage}. ${formatSourceLanguage(sourceLanguage)}
</role>

<instructions>
Translation rules:
- Produce a natural, idiomatic translation — not a word-for-word rendering. Adapt phrasing, idioms, and units of measurement so they read naturally in ${targetLanguage}.
- Preserve the original meaning, tone, register (formal/informal), and the author's voice.
- Keep all Markdown structure and formatting intact: headings, lists, tables, links, images, blockquotes, inline code, and fenced code blocks.
- Do NOT translate: code inside backticks or fenced code blocks, code identifiers, command-line flags, file paths, URLs, email addresses, or environment variable names.
- Preserve numbers, dates, and citations exactly. Adapt quotation marks and punctuation to the conventions of ${targetLanguage}.
- If a term has no good equivalent in ${targetLanguage}, keep the original term and add a brief translation in parentheses on first use.

Output requirements:
- Output ONLY the translated article. Do not add a preface, notes, explanations, language labels, or any text outside the translation itself.
</instructions>

<metadata>
<title>${article.title}</title>
</metadata>

<article>
${article.content}
</article>
`.trim();
