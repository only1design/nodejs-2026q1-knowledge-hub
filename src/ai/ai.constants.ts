export const aiConfig = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl:
      process.env.GEMINI_API_BASE_URL ||
      'https://generativelanguage.googleapis.com',
    model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2',
  },
  maxRetries: 3,
  rateLimit: Number(process.env.AI_RATE_LIMIT_RPM || '20'),
  cacheTtl: Number(process.env.AI_CACHE_TTL_SEC || '300') * 1000,
};

export enum LlmResponseMaxLength {
  SHORT = 'short',
  MEDIUM = 'medium',
  DETAILED = 'detailed',
}

export enum AnalyzeTask {
  REVIEW = 'review',
  BUGS = 'bugs',
  OPTIMIZE = 'optimize',
  EXPLAIN = 'explain',
}
