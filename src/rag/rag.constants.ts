import * as process from 'node:process';

export const ragConfig = {
  vector: {
    url: process.env.RAG_VECTOR_DB_URL ?? 'http://vectordb:6333',
    collection: process.env.RAG_VECTOR_COLLECTION ?? 'knowledge_hub_articles',
  },
  chunk: {
    size: Number(process.env.RAG_CHUNK_SIZE ?? '800'),
    overlap: Number(process.env.RAG_CHUNK_OVERLAP ?? '200'),
  },
  conversation: {
    maxMessages: Number(process.env.RAG_CONVERSATION_MAX_MESSAGES ?? '20'),
  },
  embedding: {
    dimensions: Number(process.env.EMBEDDING_DIMENSION ?? '768'),
    batchSize: Number(process.env.EMBEDDING_BATCH_SIZE ?? '100'),
  },
  retrieval: {
    scoreThreshold: Number(process.env.RAG_RETRIEVAL_SCORE_THRESHOLD ?? '0.7'),
    topK: Number(process.env.RAG_RETRIEVAL_TOP_K ?? '5'),
  },
};

export enum geminiEmbeddingTaskType {
  RETRIEVAL_DOCUMENT = 'RETRIEVAL_DOCUMENT',
  RETRIEVAL_QUERY = 'RETRIEVAL_QUERY',
}
