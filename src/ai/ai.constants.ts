export const aiConfig = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl:
      process.env.GEMINI_API_BASE_URL ||
      'https://generativelanguage.googleapis.com',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  },
  maxRetries: 3,
  rateLimit: Number(process.env.AI_RATE_LIMIT_RPM || '20'),
  cacheTtl: Number(process.env.AI_CACHE_TTL_SEC || '300'),
};
