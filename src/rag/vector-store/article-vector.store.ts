import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { randomUUID } from 'node:crypto';
import { ServiceUnavailableError } from '../../common/errors/app.errors';
import { ragConfig } from '../rag.constants';
import { computeSparseVector } from './sparse-vectorizer';

export interface ChunkPayload {
  articleId: string;
  articleTitle: string;
  status: string;
  categoryId?: string;
  tags: string[];
  chunk: string;
}

export interface ChunkPoint {
  vector: number[];
  payload: ChunkPayload;
}

export interface VectorSearchFilter {
  status?: string;
  categoryId?: string;
  tags?: string[];
}

export interface VectorSearchHit {
  payload: ChunkPayload;
  score: number;
  vector?: number[];
}

export interface VectorSearchParams {
  vector: number[];
  limit: number;
  filter?: VectorSearchFilter;
  scoreThreshold?: number;
  withVector?: boolean;
}

export interface HybridSearchParams extends VectorSearchParams {
  queryText: string;
}

const DENSE_VECTOR_NAME = 'dense';
const SPARSE_VECTOR_NAME = 'sparse';

@Injectable()
export class ArticleVectorStore implements OnModuleInit {
  private readonly logger = new Logger(ArticleVectorStore.name);
  private readonly client = new QdrantClient({ url: ragConfig.vector.url });
  private readonly collection = ragConfig.vector.collection;

  get collectionName(): string {
    return this.collection;
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  private async ensureCollection() {
    try {
      const exists = await this.client.collectionExists(this.collection);
      if (exists.exists) return;

      await this.client.createCollection(this.collection, {
        vectors: {
          [DENSE_VECTOR_NAME]: {
            size: ragConfig.embedding.dimensions,
            distance: 'Cosine',
          },
        },
        sparse_vectors: {
          [SPARSE_VECTOR_NAME]: {
            modifier: 'idf',
          },
        },
      });
      await this.client.createPayloadIndex(this.collection, {
        field_name: 'articleId',
        field_schema: 'keyword',
      });
      this.logger.log(`Created Qdrant collection "${this.collection}"`);
    } catch (e) {
      this.logger.error('Failed to bootstrap vector collection', e);
      throw new ServiceUnavailableError('Vector DB is unavailable');
    }
  }

  async upsertChunks(points: ChunkPoint[]): Promise<void> {
    if (points.length === 0) return;

    try {
      await this.client.upsert(this.collection, {
        wait: true,
        points: points.map((point) => ({
          id: randomUUID(),
          vector: {
            [DENSE_VECTOR_NAME]: point.vector,
            [SPARSE_VECTOR_NAME]: computeSparseVector(point.payload.chunk),
          },
          payload: point.payload as unknown as Record<string, unknown>,
        })),
      });
    } catch (e) {
      this.logger.error('Vector upsert failed', e);
      throw new ServiceUnavailableError('Vector DB is unavailable');
    }
  }

  async semanticSearch({
    vector,
    limit,
    filter,
    scoreThreshold,
  }: VectorSearchParams): Promise<VectorSearchHit[]> {
    try {
      const results = await this.client.query(this.collection, {
        query: vector,
        using: DENSE_VECTOR_NAME,
        limit,
        score_threshold: scoreThreshold,
        filter: this.buildFilter(filter),
        with_payload: true,
      });

      return results.points.map((result) => ({
        payload: result.payload as unknown as ChunkPayload,
        score: result.score,
      }));
    } catch (e) {
      this.logger.error('Vector search failed', e);
      throw new ServiceUnavailableError('Vector DB is unavailable');
    }
  }

  async hybridSearch({
    queryText,
    vector,
    limit,
    filter,
    scoreThreshold,
    withVector,
  }: HybridSearchParams): Promise<VectorSearchHit[]> {
    const sparseVector = computeSparseVector(queryText);
    const prefetchLimit = limit * 3;

    try {
      const results = await this.client.query(this.collection, {
        prefetch: [
          {
            query: vector,
            using: DENSE_VECTOR_NAME,
            limit: prefetchLimit,
          },
          {
            query: sparseVector,
            using: SPARSE_VECTOR_NAME,
            limit: prefetchLimit,
          },
        ],
        query: { fusion: 'rrf' },
        limit,
        score_threshold: scoreThreshold,
        filter: this.buildFilter(filter),
        with_payload: true,
        with_vector: withVector ? [DENSE_VECTOR_NAME] : false,
      });

      return results.points.map((result) => ({
        payload: result.payload as unknown as ChunkPayload,
        score: result.score,
        vector: withVector ? result.vector?.[DENSE_VECTOR_NAME] : undefined,
      }));
    } catch (e) {
      this.logger.error('Hybrid vector search failed', e);
      throw new ServiceUnavailableError('Vector DB is unavailable');
    }
  }

  async deleteByArticleId(articleId: string): Promise<number> {
    const filter = {
      must: [{ key: 'articleId', match: { value: articleId } }],
    };

    try {
      const { count } = await this.client.count(this.collection, {
        filter,
        exact: true,
      });

      if (count === 0) return 0;

      await this.client.delete(this.collection, { wait: true, filter });

      return count;
    } catch (e) {
      this.logger.error('Vector delete failed', e);
      throw new ServiceUnavailableError('Vector DB is unavailable');
    }
  }

  private buildFilter(filter?: VectorSearchFilter) {
    if (!filter) return undefined;

    const must: Array<Record<string, unknown>> = [];

    if (filter.status) {
      must.push({ key: 'status', match: { value: filter.status } });
    }
    if (filter.categoryId) {
      must.push({ key: 'categoryId', match: { value: filter.categoryId } });
    }
    if (filter.tags?.length) {
      must.push({ key: 'tags', match: { any: filter.tags } });
    }

    return must.length ? { must } : undefined;
  }
}
